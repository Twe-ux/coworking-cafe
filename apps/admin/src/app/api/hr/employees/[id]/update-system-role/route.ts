import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { connectMongoose } from '@/lib/mongodb'
import Employee from '@/models/employee'
import bcrypt from 'bcrypt'

/**
 * PUT /api/hr/employees/[id]/update-system-role
 * Modifier le rôle système et/ou les PINs d'un employé
 *
 * Body:
 * {
 *   clockingCode?: string (optionnel - nouveau PIN pointage 4 chiffres)
 *   dashboardPin?: string (optionnel - nouveau PIN dashboard 6 chiffres)
 * }
 *
 * Note: Le systemRole est automatiquement mis à jour selon employeeRole
 */
// Force dynamic rendering (no static analysis at build time)
export const dynamic = 'force-dynamic';
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Non authentifié' },
        { status: 401 }
      )
    }

    // Vérifier les permissions (dev ou admin uniquement)
    const userRole = session?.user?.role
    if (!userRole || !['dev', 'admin'].includes(userRole)) {
      return NextResponse.json(
        { success: false, error: 'Permissions insuffisantes' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { clockingCode, dashboardPin } = body

    // Au moins un champ doit être fourni
    if (!clockingCode && !dashboardPin) {
      return NextResponse.json(
        {
          success: false,
          error: 'Au moins un champ doit être fourni (clockingCode ou dashboardPin)',
        },
        { status: 400 }
      )
    }

    // Valider clockingCode si fourni (4 chiffres)
    if (clockingCode && !/^\d{4}$/.test(clockingCode)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Le code de pointage doit être composé de 4 chiffres',
        },
        { status: 400 }
      )
    }

    // Valider dashboardPin si fourni (6 chiffres)
    if (dashboardPin && !/^\d{6}$/.test(dashboardPin)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Le PIN dashboard doit être composé de 6 chiffres',
        },
        { status: 400 }
      )
    }

    await connectMongoose()

    // 1. Trouver l'employé
    const employee = await Employee.findById(params.id)
    if (!employee) {
      return NextResponse.json(
        { success: false, error: 'Employé introuvable' },
        { status: 404 }
      )
    }

    // Note: Les employés n'ont plus de User, on travaille uniquement avec Employee
    // Le rôle système est déterminé automatiquement depuis employeeRole lors de l'authentification

    // 2. Mettre à jour le PIN de pointage si fourni
    if (clockingCode) {
      // Vérifier que le PIN n'est pas déjà utilisé par un autre employé
      const existingEmployee = await Employee.findOne({
        clockingCode,
        _id: { $ne: params.id },
      })

      if (existingEmployee) {
        return NextResponse.json(
          {
            success: false,
            error: 'Ce code de pointage est déjà utilisé par un autre employé',
          },
          { status: 409 }
        )
      }

      employee.clockingCode = clockingCode
    }

    // 3. Mettre à jour le PIN dashboard si fourni (Manager/Assistant Manager uniquement)
    if (dashboardPin) {
      // Vérifier que l'employé a le bon rôle pour avoir un PIN dashboard
      if (employee.employeeRole === 'Employé polyvalent') {
        return NextResponse.json(
          {
            success: false,
            error:
              "Le PIN dashboard n'est pas applicable pour un Employé polyvalent",
          },
          { status: 400 }
        )
      }

      // Vérifier que les deux PINs sont différents
      const currentClockingCode = clockingCode || employee.clockingCode
      if (
        currentClockingCode === dashboardPin.slice(0, 4) ||
        currentClockingCode === dashboardPin.slice(2, 6)
      ) {
        return NextResponse.json(
          {
            success: false,
            error: 'Le PIN dashboard doit être différent du PIN de pointage',
          },
          { status: 400 }
        )
      }

      // Mettre à jour le dashboardPinHash dans Employee
      employee.dashboardPinHash = await bcrypt.hash(dashboardPin, 10)
    }

    // 4. Sauvegarder les changements
    await employee.save()

    return NextResponse.json({
      success: true,
      message: 'PINs mis à jour avec succès',
      data: {
        employee: {
          id: employee._id.toString(),
          firstName: employee.firstName,
          lastName: employee.lastName,
          email: employee.email,
          employeeRole: employee.employeeRole,
          clockingCode: employee.clockingCode,
          hasDashboardPin: !!employee.dashboardPinHash,
        },
        updated: {
          clockingCode: clockingCode ? 'Mis à jour (4 chiffres)' : 'Inchangé',
          dashboardPin:
            dashboardPin && employee.employeeRole !== 'Employé polyvalent'
              ? 'Mis à jour (6 chiffres)'
              : employee.employeeRole === 'Employé polyvalent'
                ? 'Non applicable (Employé polyvalent)'
                : 'Inchangé',
        },
      },
    })
  } catch (error: any) {
    console.error(
      '❌ Erreur API PUT employees/[id]/update-system-role:',
      error
    )

    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la mise à jour du rôle système',
        details: error.message,
      },
      { status: 500 }
    )
  }
}
