import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import Employee from '@/models/employee'
import TimeEntry from '@/models/timeEntry'
import type {
  ClockInRequest,
  ApiResponse,
  TimeEntry as TimeEntryType,
} from '@/types/timeEntry'
import { TIME_ENTRY_ERRORS } from '@/types/timeEntry'
import { checkIPWhitelist, getClientIP } from '@/lib/security/ip-whitelist'
import { checkRateLimit, recordAttempt, resetAttempts } from '@/lib/security/rate-limiter'
import { logPINAttempt } from '@/lib/security/pin-logger'

/**
 * POST /api/time-entries/clock-in - Débuter un nouveau shift
 * 🔓 ROUTE PUBLIQUE avec sécurités : IP whitelist + Rate limiting + Logging
 */
export async function POST(request: NextRequest) {
  const clientIP = getClientIP(request)
  const userAgent = request.headers.get('user-agent') || undefined

  try {
    const body = (await request.json()) as ClockInRequest

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

    // 🔒 Sécurité 1: IP Whitelist (optionnelle)
    const ipCheck = checkIPWhitelist(request)
    if (!ipCheck.allowed) {
      logPINAttempt({
        ip: clientIP,
        employeeId: body.employeeId,
        success: false,
        action: 'clock-in',
        failureReason: 'IP non autorisée',
        userAgent,
      })
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: ipCheck.reason,
        },
        { status: 403 }
      )
    }

    // 🔒 Sécurité 2: Rate Limiting
    const rateLimit = checkRateLimit(clientIP, body.employeeId)
    if (!rateLimit.allowed) {
      logPINAttempt({
        ip: clientIP,
        employeeId: body.employeeId,
        success: false,
        action: 'clock-in',
        failureReason: `Rate limit: ${rateLimit.reason}`,
        userAgent,
      })
      return NextResponse.json(
        {
          success: false,
          error: rateLimit.reason,
          retryAfter: rateLimit.retryAfter,
        },
        { status: 429 }
      )
    }

    await connectToDatabase()

    // Vérifier l'employé et le PIN
    const employee = await Employee.findById(body.employeeId).select('+pin')

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

    // Vérifier le PIN
    const isPinValid = employee.verifyPin(body.pin)

    // 🔒 Enregistrer la tentative (succès ou échec)
    recordAttempt(clientIP, body.employeeId)

    if (!isPinValid) {
      // 📝 Logger l'échec
      logPINAttempt({
        ip: clientIP,
        employeeId: body.employeeId,
        employeeName: employee.getFullName(),
        success: false,
        action: 'clock-in',
        failureReason: 'PIN incorrect',
        userAgent,
      })

      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: 'PIN incorrect',
          details: TIME_ENTRY_ERRORS.INVALID_PIN,
        },
        { status: 401 }
      )
    }

    // Vérifier les shifts actifs pour aujourd'hui
    const today = new Date()
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

    const activeShifts = await TimeEntry.find({
      employeeId: body.employeeId,
      date: todayStr,
      status: 'active',
      isActive: true,
    })

    if (activeShifts.length > 0) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error:
            'Vous avez déjà un shift actif. Veuillez pointer la sortie avant de commencer un nouveau shift.',
          details: TIME_ENTRY_ERRORS.ALREADY_CLOCKED_IN,
        },
        { status: 409 }
      )
    }

    // Compter le nombre total de shifts pour aujourd'hui
    const totalShifts = await TimeEntry.countDocuments({
      employeeId: body.employeeId,
      date: todayStr,
      isActive: true,
    })

    if (totalShifts >= 2) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: 'Vous avez atteint le maximum de 2 shifts par jour',
          details: TIME_ENTRY_ERRORS.MAX_SHIFTS_EXCEEDED,
        },
        { status: 409 }
      )
    }

    // Créer le nouveau time entry avec format string
    const now = new Date()
    const clockInTimeStr = body.clockIn
      ? body.clockIn
      : `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

    const timeEntryData = {
      employeeId: body.employeeId,
      date: todayStr,
      clockIn: clockInTimeStr,
      status: 'active' as const,
      shiftNumber: (totalShifts + 1) as 1 | 2,
    }

    const newTimeEntry = new TimeEntry(timeEntryData)
    await newTimeEntry.save()

    // ✅ PIN valide et shift créé : Réinitialiser le compteur de tentatives
    resetAttempts(clientIP, body.employeeId)

    // 📝 Logger le succès
    logPINAttempt({
      ip: clientIP,
      employeeId: body.employeeId,
      employeeName: employee.getFullName(),
      success: true,
      action: 'clock-in',
      userAgent,
    })

    // Populer les données de l'employé pour la réponse
    await newTimeEntry.populate('employeeId', 'firstName lastName employeeRole')

    // Formater la réponse
    const populatedEmployee = newTimeEntry.employeeId as any
    const formattedTimeEntry: TimeEntryType = {
      id: newTimeEntry._id.toString(),
      employeeId: employee._id.toString(),
      employee: {
        id: populatedEmployee._id?.toString() || employee._id.toString(),
        firstName: populatedEmployee.firstName || employee.firstName,
        lastName: populatedEmployee.lastName || employee.lastName,
        fullName: `${populatedEmployee.firstName || employee.firstName} ${populatedEmployee.lastName || employee.lastName}`,
        employeeRole: populatedEmployee.employeeRole || employee.employeeRole,
      },
      date: newTimeEntry.date,
      clockIn: newTimeEntry.clockIn,
      clockOut: newTimeEntry.clockOut,
      shiftNumber: newTimeEntry.shiftNumber,
      totalHours: newTimeEntry.totalHours,
      status: newTimeEntry.status,
      isActive: newTimeEntry.isActive,
      createdAt: newTimeEntry.createdAt,
      updatedAt: newTimeEntry.updatedAt,
    }

    return NextResponse.json<ApiResponse<TimeEntryType>>(
      {
        success: true,
        data: formattedTimeEntry,
        message: `Shift ${newTimeEntry.shiftNumber} débuté avec succès`,
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('❌ Erreur API POST time-entries/clock-in:', error)

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

    if (error.code === 11000) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: 'Un shift avec ce numéro existe déjà pour cette date',
          details: TIME_ENTRY_ERRORS.ALREADY_CLOCKED_IN,
        },
        { status: 409 }
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
        error: "Erreur lors du pointage d'entrée",
        details: error.message,
      },
      { status: 500 }
    )
  }
}

/**
 * OPTIONS /api/time-entries/clock-in - Gestion CORS
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
