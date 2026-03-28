import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/api/auth'
import { successResponse, errorResponse } from '@/lib/api/response'
import { connectMongoose } from '@/lib/mongodb'
import { Task } from '@coworking-cafe/database'
import { getRequiredRoles } from '@/lib/inventory/permissions'
import type { ApiResponse } from '@/types/timeEntry'
import type { InventoryPendingTask, InventoryType } from '@/types/inventory'

export const dynamic = 'force-dynamic'

/**
 * GET /api/inventory/tasks/pending
 * Returns pending tasks with metadata.type = "inventory"
 */
export async function GET(): Promise<NextResponse<ApiResponse<InventoryPendingTask[]>>> {
  try {
    const authResult = await requireAuth(getRequiredRoles('viewInventory'))
    if (!authResult.authorized) return authResult.response

    await connectMongoose()

    const tasks = await Task.find({
      'metadata.type': 'inventory',
      'metadata.inventoryType': { $exists: true }, // Only tasks with explicit inventoryType
      status: 'pending',
    })
      .sort({ priority: -1, dueDate: 1 })
      .lean()

    const formatted: InventoryPendingTask[] = tasks.map((t) => {
      const metadata = (t.metadata || {}) as Record<string, unknown>

      return {
        id: t._id.toString(),
        title: t.title,
        description: t.description,
        priority: t.priority,
        dueDate: t.dueDate,
        inventoryType: (metadata.inventoryType as InventoryType) || 'monthly',
        recurringTaskId: t.recurringTaskId?.toString(),
        createdAt: t.createdAt.toISOString(),
      }
    })

    return successResponse(formatted, `${formatted.length} taches inventaire en attente`)
  } catch (error) {
    console.error('[GET /api/inventory/tasks/pending] Error:', error)
    return errorResponse(
      'Erreur lors de la recuperation des taches inventaire',
      error instanceof Error ? error.message : undefined,
      500
    )
  }
}
