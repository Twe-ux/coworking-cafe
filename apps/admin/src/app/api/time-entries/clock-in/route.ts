import { NextRequest, NextResponse } from 'next/server'
import { connectMongoose } from '@/lib/mongodb'
import Employee from '@/models/employee'
import TimeEntry from '@/models/timeEntry'
import Shift from '@/models/shift'
import type {
  ClockInRequest,
  ApiResponse,
  TimeEntry as TimeEntryType,
} from '@/types/timeEntry'
import { TIME_ENTRY_ERRORS } from '@/types/timeEntry'
import { checkIPWhitelist, getClientIP } from '@/lib/security/ip-whitelist'
import { checkRateLimit, recordAttempt, resetAttempts } from '@/lib/security/rate-limiter'
import { logPINAttempt } from '@/lib/security/pin-logger'
import { validateRequest } from '@/lib/api/validation'
import { clockInSchema } from '@/lib/validations/timeEntry'
import { isClockInWithinSchedule } from '@/lib/utils/schedule-checker'
import { isShiftBeforeCutoff } from '@/lib/schedule/utils'
import { sendNewJustificationNotification } from '@/lib/push-notifications'

/**
 * POST /api/time-entries/clock-in - Débuter un nouveau shift
 * 🔓 ROUTE PUBLIQUE avec sécurités : IP whitelist + Rate limiting + Logging
 */
// Force dynamic rendering (no static analysis at build time)
export const dynamic = 'force-dynamic';
export async function POST(request: NextRequest) {
  const clientIP = getClientIP(request)
  const userAgent = request.headers.get('user-agent') || undefined

  try {
    const rawBody = await request.json()

    // Validate request body with Zod
    const validation = validateRequest(rawBody, clockInSchema)
    if (!validation.success) {
      return validation.response
    }

    const body = validation.data

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

    await connectMongoose()

    // ⚡ Paralléliser les requêtes MongoDB pour améliorer les performances
    const today = new Date()
    const parisDate = new Intl.DateTimeFormat('fr-FR', {
      timeZone: 'Europe/Paris',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(today).split('/').reverse().join('-')  // DD/MM/YYYY → YYYY-MM-DD

    const todayStr = parisDate

    // Exécuter toutes les requêtes en parallèle (3x plus rapide)
    const [employee, activeShifts, totalShifts] = await Promise.all([
      Employee.findById(body.employeeId).select('+pin').lean(),
      TimeEntry.find({
        employeeId: body.employeeId,
        date: todayStr,
        status: 'active',
        isActive: true,
      }).lean(),
      TimeEntry.countDocuments({
        employeeId: body.employeeId,
        date: todayStr,
        isActive: true,
      }),
    ])

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

    // Vérifier le PIN (utiliser Employee model methods)
    const employeeDoc = await Employee.findById(body.employeeId).select('+pin')
    const isPinValid = employeeDoc?.verifyPin(body.pin) || false

    // 🔒 Enregistrer la tentative (succès ou échec)
    recordAttempt(clientIP, body.employeeId)

    if (!isPinValid) {
      // 📝 Logger l'échec
      logPINAttempt({
        ip: clientIP,
        employeeId: body.employeeId,
        employeeName: `${employee.firstName} ${employee.lastName}`,
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
    // Utiliser le timezone Europe/Paris pour éviter les décalages en prod (Vercel = UTC)
    const now = new Date()
    const parisTime = new Intl.DateTimeFormat('fr-FR', {
      timeZone: 'Europe/Paris',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(now)

    const clockInTimeStr = body.clockIn
      ? body.clockIn
      : parisTime  // Format "HH:mm" en heure de Paris

    // ⚡ Récupérer les shifts planifiés (requête rapide avec lean)
    const scheduledShifts = await Shift.find({
      employeeId: body.employeeId,
      date: todayStr,
      isActive: true,
    }).select('startTime endTime').lean();

    const isWithinScheduleTime = isClockInWithinSchedule(
      clockInTimeStr,
      scheduledShifts.map((s) => ({ startTime: s.startTime, endTime: s.endTime }))
    );

    // Si hors planning et pas de justification → exiger justification
    const isOutOfSchedule = !isWithinScheduleTime
    if (isOutOfSchedule && !body.justificationNote) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: 'Pointage hors planning détecté',
          details: {
            code: 'JUSTIFICATION_REQUIRED',
            message: 'Vous pointez en dehors de vos horaires planifiés (±15min). Veuillez justifier ce pointage.',
            clockInTime: clockInTimeStr,
            scheduledShifts: scheduledShifts.map((s) => ({
              startTime: s.startTime,
              endTime: s.endTime,
            })),
          },
        },
        { status: 400 }
      )
    }

    // Determine shiftNumber based on clockIn time, with fallback for legacy data
    const calculatedShiftNumber: 1 | 2 = isShiftBeforeCutoff(clockInTimeStr) ? 1 : 2
    const conflicting = await TimeEntry.exists({
      employeeId: body.employeeId,
      date: todayStr,
      shiftNumber: calculatedShiftNumber,
      isActive: true,
    })
    const finalShiftNumber: 1 | 2 = conflicting
      ? (calculatedShiftNumber === 1 ? 2 : 1)
      : calculatedShiftNumber

    const timeEntryData = {
      employeeId: body.employeeId,
      date: todayStr,
      clockIn: clockInTimeStr,
      status: 'active' as const,
      shiftNumber: finalShiftNumber,
      isOutOfSchedule,
      justificationNote: body.justificationNote ? `[Arrivée] ${body.justificationNote}` : undefined,
      justificationRead: body.justificationNote ? false : undefined,
    }

    const newTimeEntry = new TimeEntry(timeEntryData)
    await newTimeEntry.save()

    // Send push notification for out-of-schedule clock-in
    if (isOutOfSchedule) {
      const pendingCount = await TimeEntry.countDocuments({
        isOutOfSchedule: true,
        justificationRead: { $ne: true },
        isActive: true,
      })
      sendNewJustificationNotification({
        id: newTimeEntry._id.toString(),
        employeeName: `${employee.firstName} ${employee.lastName}`,
        clockTime: clockInTimeStr,
        type: 'clock-in',
        pendingCount,
      }).catch((err) => console.error('[Push] Justification notification error:', err))
    }

    // ✅ PIN valide et shift créé : Réinitialiser le compteur de tentatives
    resetAttempts(clientIP, body.employeeId)

    // 📝 Logger le succès
    logPINAttempt({
      ip: clientIP,
      employeeId: body.employeeId,
      employeeName: `${employee.firstName} ${employee.lastName}`,
      success: true,
      action: 'clock-in',
      userAgent,
    })

    // Populer les données de l'employé pour la réponse
    await newTimeEntry.populate('employeeId', 'firstName lastName employeeRole')

    // Formater la réponse
    interface PopulatedEmployee {
      _id: { toString(): string }
      firstName: string
      lastName: string
      employeeRole: string
    }

    const populatedEmployee = newTimeEntry.employeeId as unknown as PopulatedEmployee
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
      isOutOfSchedule: newTimeEntry.isOutOfSchedule,
      justificationNote: newTimeEntry.justificationNote,
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
  } catch (error: unknown) {
    console.error('❌ Erreur API POST time-entries/clock-in:', error)

    // Type guard pour les erreurs MongoDB
    interface MongoDBValidationError {
      name: string
      errors: Record<string, { message: string }>
    }

    interface MongoDBDuplicateKeyError {
      code: number
    }

    interface MongoDBCastError {
      name: string
      path: string
    }

    // Gestion des erreurs spécifiques de MongoDB
    if (error && typeof error === 'object' && 'name' in error && error.name === 'ValidationError') {
      const validationError = error as MongoDBValidationError
      const validationErrors = Object.values(validationError.errors).map(
        (err) => err.message
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

    if (error && typeof error === 'object' && 'code' in error && error.code === 11000) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: 'Un shift avec ce numéro existe déjà pour cette date',
          details: TIME_ENTRY_ERRORS.ALREADY_CLOCKED_IN,
        },
        { status: 409 }
      )
    }

    if (error && typeof error === 'object' && 'name' in error && error.name === 'CastError' && 'path' in error) {
      const castError = error as MongoDBCastError
      if (castError.path === '_id') {
        return NextResponse.json<ApiResponse<null>>(
          {
            success: false,
            error: "Format d'ID employé invalide",
            details: TIME_ENTRY_ERRORS.EMPLOYEE_NOT_FOUND,
          },
          { status: 400 }
        )
      }
    }

    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: "Erreur lors du pointage d'entrée",
        details: error instanceof Error ? error.message : 'Erreur inconnue',
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
