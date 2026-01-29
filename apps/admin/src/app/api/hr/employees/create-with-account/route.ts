import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { connectMongoose } from '@/lib/mongodb'
import Employee from '@/models/employee'
import { User, Role } from '@coworking-cafe/database'
import bcrypt from 'bcrypt'

/**
 * POST /api/hr/employees/create-with-account
 * Créer un employé avec son compte User
 *
 * LOGIQUE D'ATTRIBUTION AUTOMATIQUE :
 * - Employé polyvalent → Role staff + PIN pointage (4 chiffres) uniquement
 * - Assistant manager → Role admin + PIN pointage (4 chiffres) + PIN dashboard (6 chiffres)
 * - Manager → Role admin + PIN pointage (4 chiffres) + PIN dashboard (6 chiffres)
 *
 * Body:
 * {
 *   // Employee data
 *   firstName: string
 *   lastName: string
 *   email: string
 *   phone: string
 *   employeeRole: 'Manager' | 'Assistant manager' | 'Employé polyvalent'
 *   clockingCode: string (PIN pointage - 4 chiffres)
 *   dashboardPin?: string (PIN dashboard - 6 chiffres - requis pour Manager/Assistant manager)
 *   dateOfBirth: string
 *   hireDate: string
 *   contractType: string
 *   // ... autres champs employé
 * }
 */
// Force dynamic rendering (no static analysis at build time)
export const dynamic = 'force-dynamic';
export async function POST(request: NextRequest) {
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
    const {
      // Employee data
      firstName,
      lastName,
      email,
      phone,
      employeeRole,
      clockingCode, // PIN pointage 4 chiffres
      dashboardPin, // PIN dashboard 6 chiffres (optionnel)
      color,
      dateOfBirth,
      placeOfBirth,
      address,
      socialSecurityNumber,
      contractType,
      contractualHours,
      hireDate,
      hireTime,
      endDate,
      endContractReason,
      level,
      step,
      hourlyRate,
      monthlySalary,
      availability,
      bankDetails,
    } = body

    // Validation de base
    if (!firstName || !lastName || !email || !employeeRole || !clockingCode) {
      return NextResponse.json(
        {
          success: false,
          error: 'Données manquantes (firstName, lastName, email, employeeRole, clockingCode requis)',
        },
        { status: 400 }
      )
    }

    // Valider employeeRole
    const validEmployeeRoles = ['Manager', 'Assistant manager', 'Employé polyvalent']
    if (!validEmployeeRoles.includes(employeeRole)) {
      return NextResponse.json(
        {
          success: false,
          error: `employeeRole doit être : ${validEmployeeRoles.join(', ')}`,
        },
        { status: 400 }
      )
    }

    // Valider PIN pointage (4 chiffres)
    if (!/^\d{4}$/.test(clockingCode)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Le code de pointage doit être composé de 4 chiffres',
        },
        { status: 400 }
      )
    }

    // 🎯 LOGIQUE AUTOMATIQUE : Déterminer systemRole selon employeeRole
    let systemRole: 'dev' | 'admin' | 'staff'
    let requiresDashboardPin = false

    if (employeeRole === 'Employé polyvalent') {
      systemRole = 'staff'
      requiresDashboardPin = false
    } else if (employeeRole === 'Assistant manager' || employeeRole === 'Manager') {
      systemRole = 'admin'
      requiresDashboardPin = true
    } else {
      // Fallback (ne devrait pas arriver avec validation ci-dessus)
      systemRole = 'staff'
      requiresDashboardPin = false
    }

    // Valider PIN dashboard si requis (Manager/Assistant manager)
    if (requiresDashboardPin) {
      if (!dashboardPin) {
        return NextResponse.json(
          {
            success: false,
            error: `Un PIN dashboard (6 chiffres) est requis pour le rôle ${employeeRole}`,
          },
          { status: 400 }
        )
      }

      if (!/^\d{6}$/.test(dashboardPin)) {
        return NextResponse.json(
          {
            success: false,
            error: 'Le PIN dashboard doit être composé de 6 chiffres',
          },
          { status: 400 }
        )
      }

      // Vérifier que les deux PINs sont différents
      if (clockingCode === dashboardPin.slice(0, 4) || clockingCode === dashboardPin.slice(2, 6)) {
        return NextResponse.json(
          {
            success: false,
            error: 'Le PIN dashboard doit être différent du PIN de pointage',
          },
          { status: 400 }
        )
      }
    }

    await connectMongoose()

    // 1. Vérifier que l'email n'existe pas déjà
    const existingUser = await User.findOne({ email: email.toLowerCase() })
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'Un compte avec cet email existe déjà' },
        { status: 409 }
      )
    }

    // 2. Récupérer le Role document selon systemRole
    const roleDoc = await Role.findOne({ slug: systemRole })
    if (!roleDoc) {
      return NextResponse.json(
        { success: false, error: `Rôle système ${systemRole} introuvable` },
        { status: 404 }
      )
    }

    // 3. Déterminer le PIN à utiliser comme password selon le rôle
    let passwordPin: string
    if (systemRole === 'staff') {
      // Employé polyvalent : utiliser PIN pointage (4 chiffres)
      passwordPin = clockingCode
    } else {
      // Manager/Assistant manager : utiliser PIN dashboard (6 chiffres)
      passwordPin = dashboardPin!
    }

    // 4. Hasher le PIN
    const hashedPassword = await bcrypt.hash(passwordPin, 10)

    // 5. Créer le User account
    const newUser = await User.create({
      email: email.toLowerCase(),
      password: hashedPassword,
      username: `${firstName.toLowerCase()}.${lastName.toLowerCase()}`,
      givenName: firstName,
      role: roleDoc._id, // ObjectId du role
      phone,
      newsletter: false,
    })

    // 6. Créer l'Employee avec référence au User
    const employeeData = {
      firstName,
      lastName,
      employeeRole,
      clockingCode, // PIN pointage (4 chiffres)
      color,
      email: email.toLowerCase(),
      phone,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
      placeOfBirth,
      address,
      socialSecurityNumber,
      contractType,
      contractualHours,
      hireDate: hireDate ? new Date(hireDate) : undefined,
      hireTime,
      endDate: endDate ? new Date(endDate) : undefined,
      endContractReason,
      level,
      step,
      hourlyRate,
      monthlySalary,
      availability,
      bankDetails,
      userId: newUser._id, // Link to User account
      onboardingStatus: {
        step1Completed: true,
        step2Completed: true,
        step3Completed: true,
        step4Completed: true,
        contractGenerated: false,
        dpaeCompleted: false,
        bankDetailsProvided: false,
        contractSent: false,
      },
    }

    const newEmployee = new Employee(employeeData)
    await newEmployee.save()

    return NextResponse.json(
      {
        success: true,
        message: 'Employé et compte créés avec succès',
        data: {
          employee: {
            id: newEmployee._id.toString(),
            firstName: newEmployee.firstName,
            lastName: newEmployee.lastName,
            email: newEmployee.email,
            employeeRole: newEmployee.employeeRole,
            clockingCode: newEmployee.clockingCode,
          },
          user: {
            id: newUser._id.toString(),
            email: newUser.email,
            systemRole: roleDoc.slug,
          },
          pins: {
            clockingCode: clockingCode, // PIN pointage
            dashboardPin: systemRole === 'admin' ? 'Configuré (6 chiffres)' : 'Non requis',
          },
        },
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('❌ Erreur API POST employees/create-with-account:', error)

    // Gestion des erreurs de validation Mongoose
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(
        (err: any) => err.message
      )
      return NextResponse.json(
        {
          success: false,
          error: 'Données invalides',
          details: validationErrors,
        },
        { status: 400 }
      )
    }

    // Gestion des erreurs de duplication
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0]
      const fieldNames: Record<string, string> = {
        email: 'cet email',
        socialSecurityNumber: 'ce numéro de sécurité sociale',
        clockingCode: 'ce code de pointage',
      }
      const fieldName = fieldNames[field] || 'ces informations'

      return NextResponse.json(
        {
          success: false,
          error: `Un employé avec ${fieldName} existe déjà`,
          field,
        },
        { status: 409 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: "Erreur lors de la création de l'employé",
        details: error.message,
      },
      { status: 500 }
    )
  }
}
