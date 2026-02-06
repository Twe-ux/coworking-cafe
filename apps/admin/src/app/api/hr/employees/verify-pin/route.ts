import { NextRequest, NextResponse } from 'next/server'
import { connectMongoose } from '@/lib/mongodb'
import Employee from '@/models/employee'
import { checkIPWhitelist, getClientIP } from '@/lib/security/ip-whitelist'
import { checkRateLimit, recordAttempt, resetAttempts } from '@/lib/security/rate-limiter'
import { logPINAttempt } from '@/lib/security/pin-logger'
import logger from '@/lib/logger'

interface VerifyPinRequest {
  employeeId: string
  pin: string
}

/**
 * POST /api/hr/employees/verify-pin - Vérifier le PIN d'un employé
 * 🔓 ROUTE PUBLIQUE avec sécurités : IP whitelist + Rate limiting + Logging
 */
// Force dynamic rendering (no static analysis at build time)
export const dynamic = 'force-dynamic';
export async function POST(request: NextRequest) {
  const clientIP = getClientIP(request)
  const userAgent = request.headers.get('user-agent') || undefined

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

    // 🔒 Sécurité 1: IP Whitelist (optionnelle)
    const ipCheck = checkIPWhitelist(request)
    if (!ipCheck.allowed) {
      logPINAttempt({
        ip: clientIP,
        employeeId: body.employeeId,
        success: false,
        action: 'verify',
        failureReason: 'IP non autorisée',
        userAgent,
      })
      return NextResponse.json(
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
        action: 'verify',
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

    // 🔒 Enregistrer la tentative (succès ou échec)
    recordAttempt(clientIP, body.employeeId)

    if (!isPinValid) {
      // 📝 Logger l'échec
      logPINAttempt({
        ip: clientIP,
        employeeId: body.employeeId,
        employeeName: employee.getFullName(),
        success: false,
        action: 'verify',
        failureReason: 'PIN incorrect',
        userAgent,
      })

      return NextResponse.json(
        {
          success: false,
          error: 'PIN incorrect',
        },
        { status: 401 }
      )
    }

    // ✅ PIN valide : Réinitialiser le compteur de tentatives
    resetAttempts(clientIP, body.employeeId)

    // 📝 Logger le succès
    logPINAttempt({
      ip: clientIP,
      employeeId: body.employeeId,
      employeeName: employee.getFullName(),
      success: true,
      action: 'verify',
      userAgent,
    })

    // Retourner les informations de l'employé (sans le PIN)
    const employeeData = {
      id: employee._id.toString(),
      firstName: employee.firstName,
      lastName: employee.lastName,
      fullName: employee.getFullName(),
      role: employee.employeeRole,
      color: employee.color,
      isActive: employee.isActive,
    }

    return NextResponse.json({
      success: true,
      data: employeeData,
      message: 'PIN vérifié avec succès',
    })
  } catch (error: unknown) {
    // Type guard pour Error
    if (error instanceof Error) {
      logger.error('Verify PIN API error', {
        errorName: error.name,
        errorMessage: error.message,
      })

      // Gestion des erreurs spécifiques Mongoose CastError
      if (error.name === 'CastError' && 'path' in error && error.path === '_id') {
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

    // Cas d'erreur non-Error (rare mais possible)
    logger.error('Verify PIN API error', {
      error: String(error),
    })

    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la vérification du PIN',
        details: 'Unknown error',
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
