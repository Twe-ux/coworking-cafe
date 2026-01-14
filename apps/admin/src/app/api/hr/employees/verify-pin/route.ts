import { NextRequest, NextResponse } from 'next/server'
import { connectMongoose } from '@/lib/mongodb'
import Employee from '@/models/employee'

interface VerifyPinRequest {
  employeeId: string
  pin: string
}

/**
 * POST /api/hr/employees/verify-pin - Vérifier le PIN d'un employé
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as VerifyPinRequest

    // Validation des données d'entrée
    if (!body.employeeId || !body.pin) {
      return NextResponse.json(
        {
          success: false,
          error: 'ID employé et PIN sont obligatoires',
        },
        { status: 400 }
      )
    }

    // Validation du format PIN
    if (!/^\d{4}$/.test(body.pin)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Le PIN doit être composé de 4 chiffres',
        },
        { status: 400 }
      )
    }

    await connectMongoose()

    // Rechercher l'employé
    const employee = await Employee.findById(body.employeeId)

    if (!employee) {
      return NextResponse.json(
        {
          success: false,
          error: 'Employé introuvable',
        },
        { status: 404 }
      )
    }

    // Vérifier que l'employé est actif
    if (!employee.isActive) {
      return NextResponse.json(
        {
          success: false,
          error: 'Employé inactif',
        },
        { status: 403 }
      )
    }

    // Vérifier le PIN
    const isPinValid = employee.verifyPin(body.pin)

    if (!isPinValid) {
      return NextResponse.json(
        {
          success: false,
          error: 'PIN incorrect',
        },
        { status: 401 }
      )
    }

    // Retourner les informations de l'employé (sans le PIN)
    const employeeData = {
      id: employee._id.toString(),
      firstName: employee.firstName,
      lastName: employee.lastName,
      fullName: employee.getFullName(),
      role: employee.role,
      color: employee.color,
      isActive: employee.isActive,
    }

    return NextResponse.json({
      success: true,
      data: employeeData,
      message: 'PIN vérifié avec succès',
    })
  } catch (error: any) {
    console.error('❌ Erreur API POST employees/verify-pin:', error)

    // Gestion des erreurs spécifiques
    if (error.name === 'CastError' && error.path === '_id') {
      return NextResponse.json(
        {
          success: false,
          error: "Format d'ID employé invalide",
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la vérification du PIN',
        details: error.message,
      },
      { status: 500 }
    )
  }
}

/**
 * OPTIONS /api/hr/employees/verify-pin - Gestion CORS
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}
