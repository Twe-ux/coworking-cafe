import { NextRequest, NextResponse } from 'next/server'
import { connectMongoose } from '@/lib/mongodb'
import Employee from '@/models/employee'
import TimeEntry from '@/models/timeEntry'
import Shift from '@/models/shift'
import type {
  ClockOutRequest,
  ApiResponse,
  TimeEntry as TimeEntryType,
} from '@/types/timeEntry'
import { TIME_ENTRY_ERRORS } from '@/types/timeEntry'
import { checkIPWhitelist, getClientIP } from '@/lib/security/ip-whitelist'
import { checkRateLimit, recordAttempt, resetAttempts } from '@/lib/security/rate-limiter'
import { logPINAttempt } from '@/lib/security/pin-logger'
import { validateRequest } from '@/lib/api/validation'
import { clockOutSchema } from '@/lib/validations/timeEntry'
import { isClockInWithinSchedule, isClockOutWithinSchedule } from '@/lib/utils/schedule-checker'
import { sendNewJustificationNotification } from '@/lib/push-notifications'

/**
 * POST /api/time-entries/clock-out - Terminer un shift actif
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
    const validation = validateRequest(rawBody, clockOutSchema)
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
        action: 'clock-out',
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
        action: 'clock-out',
        failureReason: `Rate limit: ${rateLimit.reason}`,
        userAgent,
      })
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: rateLimit.reason,
        },
        {
          status: 429,
          headers: rateLimit.retryAfter
            ? { 'Retry-After': rateLimit.retryAfter.toString() }
            : {}
        }
      )
    }

    await connectMongoose()

    // ⚡ Paralléliser la vérification de l'employé et la recherche du time entry
    const [employee, timeEntry] = await Promise.all([
      Employee.findById(body.employeeId).select('+pin').lean(),
      body.timeEntryId
        ? TimeEntry.findOne({
            _id: body.timeEntryId,
            employeeId: body.employeeId,
            status: 'active',
            isActive: true,
          }).populate('employeeId', 'firstName lastName employeeRole')
        : TimeEntry.findOne({
            employeeId: body.employeeId,
            status: 'active',
            isActive: true,
          })
            .sort({ clockIn: -1 })
            .populate('employeeId', 'firstName lastName employeeRole'),
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

    // Vérifier le PIN (optionnel pour clock-out)
    // Si un PIN est fourni, on le vérifie. Sinon, on permet le clock-out sans PIN.
    if (body.pin) {
      // Utiliser Employee model methods pour vérifier le PIN
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
          action: 'clock-out',
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
    }

    if (!timeEntry) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: 'Aucun shift actif trouvé pour cet employé',
          details: TIME_ENTRY_ERRORS.NOT_CLOCKED_IN,
        },
        { status: 404 }
      )
    }

    // Vérifier que le shift n'est pas déjà terminé
    if (timeEntry.status === 'completed') {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: 'Ce shift est déjà terminé',
          details: TIME_ENTRY_ERRORS.SHIFT_ALREADY_COMPLETED,
        },
        { status: 409 }
      )
    }

    // Définir l'heure de sortie au format string "HH:mm" (timezone Europe/Paris)
    const now = new Date()
    const parisTime = new Intl.DateTimeFormat('fr-FR', {
      timeZone: 'Europe/Paris',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(now)

    const clockOutTimeStr = body.clockOut
      ? body.clockOut
      : parisTime  // Format "HH:mm" en heure de Paris

    // Simple validation: both times should be different
    if (clockOutTimeStr === timeEntry.clockIn) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: "L'heure de sortie doit être différente de l'heure d'entrée",
          details: TIME_ENTRY_ERRORS.INVALID_TIME_RANGE,
        },
        { status: 400 }
      )
    }

    // Check if clock-out is within scheduled shifts
    let isOutOfScheduleClockOut = timeEntry.isOutOfSchedule || false

    // ⚡ Récupérer les shifts planifiés pour ce jour (requête rapide avec lean + select)
    const scheduledShifts = await Shift.find({
      employeeId: body.employeeId,
      date: timeEntry.date,
      isActive: true,
    }).select('startTime endTime').lean();

    // Cas 1 : Aucun shift planifié pour ce jour
    if (scheduledShifts.length === 0) {
      // Pas de référence horaire → Pas de vérification au clock-out
      // La justification du clock-in (si présente) couvre toute la période
    } else {
      // Cas 2 : Il y a des shifts planifiés
      // Vérifier si le clock-in était dans un créneau planifié
      const wasClockInScheduled = isClockInWithinSchedule(
        timeEntry.clockIn,
        scheduledShifts.map((s) => ({ startTime: s.startTime, endTime: s.endTime }))
      );

      if (!wasClockInScheduled) {
        // Clock-in était complètement hors de tous les shifts planifiés
        // → Pas de vérification au clock-out (pas de référence horaire de fin)
        // La justification du clock-in couvre toute la période
      } else {
        // Clock-in était dans un créneau planifié
        // → Vérifier si clock-out est dans les horaires
        const isClockOutScheduled = isClockOutWithinSchedule(
          clockOutTimeStr,
          scheduledShifts.map((s) => ({ startTime: s.startTime, endTime: s.endTime }))
        );

        if (!isClockOutScheduled) {
          isOutOfScheduleClockOut = true

          // Clock-out hors planning → Exiger justification
          // (indépendamment d'une éventuelle justification au clock-in)
          if (!body.justificationNote) {
            return NextResponse.json<ApiResponse<null>>(
              {
                success: false,
                error: 'Pointage hors planning détecté',
                details: {
                  code: 'JUSTIFICATION_REQUIRED',
                  message: 'Vous pointez en dehors de vos horaires planifiés (±15min). Veuillez justifier ce pointage.',
                  clockOutTime: clockOutTimeStr,
                  scheduledShifts: scheduledShifts.map((s) => ({
                    startTime: s.startTime,
                    endTime: s.endTime,
                  })),
                },
              },
              { status: 400 }
            )
          }
        }
      }
    }

    // Mettre à jour le time entry
    timeEntry.clockOut = clockOutTimeStr
    timeEntry.totalHours = timeEntry.calculateTotalHours()
    timeEntry.status = 'completed'
    timeEntry.isOutOfSchedule = isOutOfScheduleClockOut

    // Gérer la justification (Option A : concaténation)
    if (body.justificationNote) {
      if (timeEntry.justificationNote) {
        // Concaténer les deux justifications avec préfixes
        timeEntry.justificationNote = `[Arrivée] ${timeEntry.justificationNote}\n---\n[Départ] ${body.justificationNote}`
      } else {
        // Première justification (seulement au clock-out)
        timeEntry.justificationNote = `[Départ] ${body.justificationNote}`
      }
      // IMPORTANT: Définir explicitement justificationRead à false
      // (les valeurs par défaut du schéma ne s'appliquent pas aux updates)
      if (timeEntry.justificationRead === undefined) {
        timeEntry.justificationRead = false
      }
    }

    await timeEntry.save()

    // Send push notification for out-of-schedule clock-out
    if (isOutOfScheduleClockOut && body.justificationNote) {
      const pendingCount = await TimeEntry.countDocuments({
        isOutOfSchedule: true,
        justificationRead: { $ne: true },
        isActive: true,
      })
      sendNewJustificationNotification({
        id: timeEntry._id.toString(),
        employeeName: `${employee.firstName} ${employee.lastName}`,
        clockTime: clockOutTimeStr,
        type: 'clock-out',
        pendingCount,
      }).catch((err) => console.error('[Push] Justification notification error:', err))
    }

    // ✅ PIN valide : Réinitialiser le compteur de tentatives
    resetAttempts(clientIP, body.employeeId)

    // 📝 Logger le succès
    logPINAttempt({
      ip: clientIP,
      employeeId: body.employeeId,
      employeeName: `${employee.firstName} ${employee.lastName}`,
      success: true,
      action: 'clock-out',
      userAgent,
    })

    // Formater la réponse
    const populatedEmployee = timeEntry.employeeId as unknown as {
      _id?: { toString: () => string }
      firstName?: string
      lastName?: string
      employeeRole?: string
    }
    const formattedTimeEntry: TimeEntryType = {
      id: timeEntry._id.toString(),
      employeeId: employee._id.toString(),
      employee: {
        id: populatedEmployee._id?.toString() || employee._id.toString(),
        firstName: populatedEmployee.firstName || employee.firstName,
        lastName: populatedEmployee.lastName || employee.lastName,
        fullName: `${populatedEmployee.firstName || employee.firstName} ${populatedEmployee.lastName || employee.lastName}`,
        employeeRole: populatedEmployee.employeeRole || employee.employeeRole,
      },
      date: timeEntry.date,
      clockIn: timeEntry.clockIn,
      clockOut: timeEntry.clockOut,
      shiftNumber: timeEntry.shiftNumber,
      totalHours: timeEntry.totalHours,
      status: timeEntry.status,
      isOutOfSchedule: timeEntry.isOutOfSchedule,
      justificationNote: timeEntry.justificationNote,
      isActive: timeEntry.isActive,
      createdAt: timeEntry.createdAt,
      updatedAt: timeEntry.updatedAt,
    }

    return NextResponse.json<ApiResponse<TimeEntryType>>({
      success: true,
      data: formattedTimeEntry,
      message: `Shift ${timeEntry.shiftNumber} terminé avec succès. Durée: ${timeEntry.totalHours}h`,
    })
  } catch (error: unknown) {
    console.error('❌ Erreur API POST time-entries/clock-out:', error)

    // Gestion des erreurs spécifiques de MongoDB
    if (error instanceof Error && error.name === 'ValidationError') {
      const mongooseError = error as Error & {
        errors: Record<string, { message: string }>
      }
      const validationErrors = Object.values(mongooseError.errors).map(
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

    if (error instanceof Error && error.name === 'CastError') {
      const castError = error as Error & { path?: string }
      if (castError.path === '_id') {
        return NextResponse.json<ApiResponse<null>>(
          {
            success: false,
            error: "Format d'ID invalide",
            details: TIME_ENTRY_ERRORS.TIME_ENTRY_NOT_FOUND,
          },
          { status: 400 }
        )
      }
    }

    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: 'Erreur lors du pointage de sortie',
        details: error instanceof Error ? error.message : 'Erreur inconnue',
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
