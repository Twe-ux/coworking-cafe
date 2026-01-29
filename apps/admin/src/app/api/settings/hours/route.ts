import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/api/auth'
import { connectDB } from '@/lib/db'
import { GlobalHoursConfiguration } from '@coworking-cafe/database'
import { successResponse, errorResponse } from '@/lib/api/response'
import type { GlobalHoursConfiguration as GlobalHoursConfigurationType } from '@/types/settings'

/**
 * GET /api/settings/hours
 * Get global hours configuration
 */
// Force dynamic rendering (no static analysis at build time)
export const dynamic = 'force-dynamic';
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(['dev', 'admin'])
    if (!authResult.authorized) return authResult.response

    await connectDB()

    const config = await GlobalHoursConfiguration.findOne().sort({ createdAt: -1 })

    if (!config) {
      return errorResponse('No global hours configuration found', undefined, 404)
    }

    const data: GlobalHoursConfigurationType = {
      _id: config._id.toString(),
      defaultHours: config.defaultHours,
      exceptionalClosures: config.exceptionalClosures.map(closure => ({
        date: closure.date.toISOString().split('T')[0], // Convert Date to YYYY-MM-DD
        reason: closure.reason,
        startTime: closure.startTime,
        endTime: closure.endTime,
        isFullDay: closure.isFullDay,
      })),
      createdAt: config.createdAt.toISOString(),
      updatedAt: config.updatedAt.toISOString(),
    }

    return successResponse(data)
  } catch (error) {
    console.error('GET /api/settings/hours error:', error)
    return errorResponse('Failed to fetch global hours configuration', undefined, 500)
  }
}

/**
 * PATCH /api/settings/hours
 * Update global hours configuration
 */
export async function PATCH(request: NextRequest) {
  try {
    const authResult = await requireAuth(['dev', 'admin'])
    if (!authResult.authorized) return authResult.response

    const body = await request.json()

    if (!body.defaultHours) {
      return errorResponse('defaultHours is required', undefined, 400)
    }

    await connectDB()

    // Get current config
    let config = await GlobalHoursConfiguration.findOne().sort({ createdAt: -1 })

    // Convert string dates to Date objects for MongoDB
    const exceptionalClosures = (body.exceptionalClosures || []).map((closure: { date: string, [key: string]: unknown }) => ({
      ...closure,
      date: new Date(closure.date),
    }))

    if (config) {
      // Update existing
      config.defaultHours = body.defaultHours
      config.exceptionalClosures = exceptionalClosures
      await config.save()
    } else {
      // Create new
      config = await GlobalHoursConfiguration.create({
        defaultHours: body.defaultHours,
        exceptionalClosures,
      })
    }

    const data: GlobalHoursConfigurationType = {
      _id: config._id.toString(),
      defaultHours: config.defaultHours,
      exceptionalClosures: config.exceptionalClosures.map(closure => ({
        date: closure.date.toISOString().split('T')[0],
        reason: closure.reason,
        startTime: closure.startTime,
        endTime: closure.endTime,
        isFullDay: closure.isFullDay,
      })),
      createdAt: config.createdAt.toISOString(),
      updatedAt: config.updatedAt.toISOString(),
    }

    return successResponse(data)
  } catch (error) {
    console.error('PATCH /api/settings/hours error:', error)
    return errorResponse('Failed to update global hours configuration', undefined, 500)
  }
}
