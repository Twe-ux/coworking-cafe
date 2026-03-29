import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/api/auth'
import { successResponse, errorResponse } from '@/lib/api/response'
import { connectMongoose } from '@/lib/mongodb'
import { RecurringTask } from '@coworking-cafe/database'
import { getRequiredRoles } from '@/lib/inventory/permissions'

export const dynamic = 'force-dynamic'

/**
 * GET /api/inventory/tasks/templates
 * Get all inventory recurring task templates (weekly and monthly)
 */
export async function GET() {
  try {
    const authResult = await requireAuth(getRequiredRoles('viewInventory'))
    if (!authResult.authorized) return authResult.response

    await connectMongoose()

    const templates = await RecurringTask.find({
      'metadata.type': 'inventory',
    })
      .sort({ 'metadata.inventoryType': 1 })
      .lean()

    const formatted = templates.map((t) => {
      const metadata = (t.metadata || {}) as Record<string, unknown>
      return {
        id: t._id.toString(),
        title: t.title,
        description: t.description,
        priority: t.priority,
        recurrenceType: t.recurrenceType,
        recurrenceDays: t.recurrenceDays || [],
        active: t.active,
        inventoryType: metadata.inventoryType as 'weekly' | 'monthly',
        supplierIds: (metadata.supplierIds as string[]) || [],
        createdAt: t.createdAt?.toISOString(),
        updatedAt: t.updatedAt?.toISOString(),
      }
    })

    return successResponse(formatted)
  } catch (error) {
    console.error('[GET /api/inventory/tasks/templates] Error:', error)
    return errorResponse(
      'Erreur lors de la récupération des templates',
      error instanceof Error ? error.message : undefined,
      500
    )
  }
}
