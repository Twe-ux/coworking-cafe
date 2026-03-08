import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/api/auth'
import { successResponse, errorResponse, notFoundResponse } from '@/lib/api/response'
import { connectMongoose } from '@/lib/mongodb'
import { Task } from '@coworking-cafe/database'
import { getRequiredRoles } from '@/lib/inventory/permissions'
import { notifyTaskCompleted } from '@/lib/inventory/notifications'
import type { ApiResponse } from '@/types/timeEntry'

export const dynamic = 'force-dynamic'

interface RouteParams {
  params: Promise<{ id: string }>
}

interface CompleteBody {
  inventoryEntryId?: string
}

/**
 * POST /api/inventory/tasks/[id]/complete
 * Marks an inventory task as completed.
 * Optionally links an inventoryEntryId in metadata.
 * For recurring tasks, the instance is deleted (existing behavior).
 */
export async function POST(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<ApiResponse<{ completed: boolean }>>> {
  try {
    const authResult = await requireAuth(getRequiredRoles('createInventory'))
    if (!authResult.authorized) return authResult.response

    await connectMongoose()

    const { id } = await params
    const body: CompleteBody = await request.json().catch(() => ({}))
    const task = await Task.findById(id)

    if (!task) {
      return notFoundResponse('Tache inventaire')
    }

    if (task.status === 'completed') {
      return successResponse({ completed: true }, 'Tache deja completee')
    }

    // For recurring tasks, delete the instance (matches existing Task system behavior)
    if (task.recurringTaskId) {
      await Task.findByIdAndDelete(task._id)
    } else {
      // Update metadata with inventoryEntryId if provided
      if (body.inventoryEntryId) {
        const currentMetadata = (task.metadata || {}) as Record<string, unknown>
        task.metadata = { ...currentMetadata, inventoryEntryId: body.inventoryEntryId }
        task.markModified('metadata')
      }
      task.status = 'completed'
      task.completedAt = new Date()
      await task.save()
    }

    // Notification placeholder
    notifyTaskCompleted(task.title, id)

    return successResponse({ completed: true }, 'Tache inventaire completee')
  } catch (error) {
    console.error('[POST /api/inventory/tasks/[id]/complete] Error:', error)

    if (
      error !== null &&
      typeof error === 'object' &&
      'name' in error &&
      (error as { name: string }).name === 'CastError'
    ) {
      return errorResponse('ID tache invalide', undefined, 400)
    }

    return errorResponse(
      'Erreur lors de la completion de la tache',
      error instanceof Error ? error.message : undefined,
      500
    )
  }
}
