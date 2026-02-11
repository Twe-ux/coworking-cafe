import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/api/auth'
import { successResponse, errorResponse } from '@/lib/api/response'
import { connectMongoose } from '@/lib/mongodb'
import TimeEntry from '@/models/timeEntry'
import type { ApiResponse } from '@/types/timeEntry'

/**
 * GET /api/time-entries/pending-justifications
 * Compte les pointages avec justification en attente de traitement
 * (isOutOfSchedule = true)
 */
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<{ count: number }>>> {
  // Auth: accessible à tous les rôles authentifiés
  const authResult = await requireAuth(['dev', 'admin', 'staff'])
  if (!authResult.authorized) {
    return authResult.response as NextResponse<ApiResponse<{ count: number }>>
  }

  try {
    await connectMongoose()

    // Compter les pointages avec isOutOfSchedule = true
    const count = await TimeEntry.countDocuments({
      isOutOfSchedule: true,
      isActive: true,
    })

    return successResponse({ count })
  } catch (error) {
    console.error('GET /api/time-entries/pending-justifications error:', error)
    return errorResponse(
      'Erreur lors du comptage des justifications',
      error instanceof Error ? error.message : 'Erreur inconnue'
    ) as NextResponse<ApiResponse<{ count: number }>>
  }
}
