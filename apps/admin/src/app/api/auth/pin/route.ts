import { NextRequest, NextResponse } from 'next/server'
import { connectMongoose } from '@/lib/mongodb'
import mongoose from 'mongoose'
import '@/models/employee'
import bcrypt from 'bcrypt'
import logger from '@/lib/logger'

interface PINVerifyRequest {
  pin: string
}

interface PINVerifyResponse {
  success: boolean
  user?: {
    id: string
    name: string
    email: string
    role: 'dev' | 'admin' | 'staff'
  }
  error?: string
}

/**
 * POST /api/auth/pin
 * Vérifie le PIN dashboard (6 chiffres) et retourne les données employé
 * Cherche dans la collection Employee avec dashboardPinHash
 */
// Force dynamic rendering (no static analysis at build time)
export const dynamic = 'force-dynamic';
export async function POST(request: NextRequest): Promise<NextResponse<PINVerifyResponse>> {
  try {
    await connectMongoose()

    const body: PINVerifyRequest = await request.json()
    const { pin } = body

    // Vérifier que c'est bien un PIN de 6 chiffres (dashboard)
    if (!pin || !/^\d{6}$/.test(pin)) {
      return NextResponse.json(
        {
          success: false,
          error: 'PIN invalide (6 chiffres requis)',
        },
        { status: 400 }
      )
    }

    const Employee = mongoose.model('Employee')

    // Chercher tous les employés actifs qui ont un dashboardPinHash
    const employees = await Employee.find({
      isActive: true,
      dashboardPinHash: { $exists: true, $ne: null },
      employeeRole: { $in: ['Manager', 'Assistant manager'] },
    }).lean()

    logger.info(`[PIN Auth] Found ${employees.length} employees with dashboard PIN`)

    // Comparer le PIN avec le dashboardPinHash de chaque employé
    let matchedEmployee = null
    for (const emp of employees) {
      if (emp.dashboardPinHash) {
        try {
          const isPinValid = await bcrypt.compare(pin, emp.dashboardPinHash)
          if (isPinValid) {
            matchedEmployee = emp
            logger.info(`[PIN Auth] Match found for employee: ${emp.email}`)
            break
          }
        } catch (err) {
          logger.error('[PIN Auth] bcrypt compare error', err)
        }
      }
    }

    if (!matchedEmployee) {
      logger.warn('[PIN Auth] No employee found with this PIN')
      return NextResponse.json(
        {
          success: false,
          error: 'PIN incorrect',
        },
        { status: 401 }
      )
    }

    // Déterminer le rôle système selon employeeRole
    let systemRole: 'dev' | 'admin' | 'staff' = 'staff'
    if (matchedEmployee.employeeRole === 'Manager') {
      systemRole = 'admin'
    } else if (matchedEmployee.employeeRole === 'Assistant manager') {
      systemRole = 'admin'
    }

    logger.info(`[PIN Auth] Employee ${matchedEmployee.email} authenticated with role: ${systemRole}`)

    // Retourner les données employé
    return NextResponse.json({
      success: true,
      user: {
        id: (matchedEmployee._id as any).toString(),
        name: `${matchedEmployee.firstName} ${matchedEmployee.lastName}`,
        email: matchedEmployee.email,
        role: systemRole,
      },
    })
  } catch (error) {
    logger.error('PIN verification API error', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur serveur',
      },
      { status: 500 }
    )
  }
}
