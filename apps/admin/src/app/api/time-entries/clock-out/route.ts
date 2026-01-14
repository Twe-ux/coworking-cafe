import { NextRequest, NextResponse } from 'next/server'
import { connectMongoose } from '@/lib/mongodb'
import Employee from '@/models/employee'
import TimeEntry from '@/models/timeEntry'
import type {
  ApiResponse,
  TimeEntry as TimeEntryType,
} from '@/types/timeEntry'
import { TIME_ENTRY_ERRORS } from '@/types/timeEntry'

interface ClockOutRequest {
  employeeId: string
  pin: string
  clockOut?: string
}

/**
 * POST /api/time-entries/clock-out - Terminer le shift actif
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ClockOutRequest

    // Validation des données d'entrée
    if (!body.employeeId || !body.pin) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: 'ID employé et PIN sont obligatoires',
          details: TIME_ENTRY_ERRORS.VALIDATION_ERROR,
        },
        { status: 400 }
      )
    }

    // Validation du format PIN
    if (!/^\d{4}$/.test(body.pin)) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: 'Le PIN doit être composé de 4 chiffres',
          details: TIME_ENTRY_ERRORS.INVALID_PIN,
        },
        { status: 400 }
      )
    }

    await connectMongoose()

    // Vérifier l'employé et le PIN
    const employee = await Employee.findById(body.employeeId)

    if (!employee) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: 'Employé introuvable',
          details: TIME_ENTRY_ERRORS.EMPLOYEE_NOT_FOUND,
        },
        { status: 404 }
      )
    }

    if (!employee.isActive) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: 'Employé inactif',
          details: TIME_ENTRY_ERRORS.EMPLOYEE_NOT_FOUND,
        },
        { status: 403 }
      )
    }

    if (!employee.verifyPin(body.pin)) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: 'PIN incorrect',
          details: TIME_ENTRY_ERRORS.INVALID_PIN,
        },
        { status: 401 }
      )
    }

    // Trouver le shift actif pour aujourd'hui
    const today = new Date()
    const startOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    )

    const activeShift = await TimeEntry.findOne({
      employeeId: body.employeeId,
      date: startOfDay,
      status: 'active',
      isActive: true,
    })

    if (!activeShift) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: "Aucun shift actif trouvé pour aujourd'hui",
          details: 'NO_ACTIVE_SHIFT',
        },
        { status: 404 }
      )
    }

    // Terminer le shift
    const clockOutTime = body.clockOut ? new Date(body.clockOut) : new Date()

    activeShift.clockOut = clockOutTime
    activeShift.status = 'completed'
    activeShift.totalHours = activeShift.calculateTotalHours()

    await activeShift.save()

    // Populer les données de l'employé pour la réponse
    await activeShift.populate('employeeId', 'firstName lastName role')

    // Formater la réponse
    const populatedEmployee = activeShift.employeeId as any
    const formattedTimeEntry: TimeEntryType = {
      id: activeShift._id.toString(),
      employeeId: employee._id.toString(),
      employee: {
        id: populatedEmployee._id?.toString() || employee._id.toString(),
        firstName: populatedEmployee.firstName || employee.firstName,
        lastName: populatedEmployee.lastName || employee.lastName,
        fullName:
          populatedEmployee.fullName || employee.getFullName(),
        role: populatedEmployee.role || employee.role,
      },
      date: activeShift.date,
      clockIn: activeShift.clockIn,
      clockOut: activeShift.clockOut,
      shiftNumber: activeShift.shiftNumber,
      totalHours: activeShift.totalHours,
      status: activeShift.status,
      isActive: activeShift.isActive,
      createdAt: activeShift.createdAt,
      updatedAt: activeShift.updatedAt,
    }

    return NextResponse.json<ApiResponse<TimeEntryType>>(
      {
        success: true,
        data: formattedTimeEntry,
        message: `Shift ${activeShift.shiftNumber} terminé avec succès (${activeShift.totalHours?.toFixed(2)}h)`,
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('❌ Erreur API POST time-entries/clock-out:', error)

    // Gestion des erreurs spécifiques de MongoDB
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(
        (err: any) => err.message
      )
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: 'Données invalides',
          details: validationErrors,
        },
        { status: 400 }
      )
    }

    if (error.name === 'CastError' && error.path === '_id') {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: "Format d'ID employé invalide",
          details: TIME_ENTRY_ERRORS.EMPLOYEE_NOT_FOUND,
        },
        { status: 400 }
      )
    }

    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: 'Erreur lors du pointage de sortie',
        details: error.message,
      },
      { status: 500 }
    )
  }
}

/**
 * OPTIONS /api/time-entries/clock-out - Gestion CORS
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
