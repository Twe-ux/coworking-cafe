import { NextRequest } from "next/server"
import { requireAuth } from "@/lib/api/auth"
import { successResponse, errorResponse, notFoundResponse } from "@/lib/api/response"
import { connectMongoose } from "@/lib/mongodb"
import { InventoryEntry } from "@/models/inventory/inventoryEntry"
import { StockMovement } from "@/models/inventory/stockMovement"
import { Product } from "@/models/inventory/product"
import { Task } from '@coworking-cafe/database'
import { getRequiredRoles } from "@/lib/inventory/permissions"
import { notifyTaskCompleted } from "@/lib/inventory/notifications"

export const dynamic = 'force-dynamic'

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * POST /api/inventory/entries/[id]/finalize - Finalize inventory entry
 *
 * Actions:
 * 1. Mark entry as finalized
 * 2. Create StockMovement for each item with variance !== 0
 * 3. Update Product.currentStock with variance
 */
export async function POST(_request: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await requireAuth(getRequiredRoles('createInventory'))
    if (!authResult.authorized) return authResult.response

    await connectMongoose()

    const { id } = await params
    const entry = await InventoryEntry.findById(id)

    if (!entry) {
      return notFoundResponse('Inventaire')
    }

    if (entry.status === 'finalized') {
      return errorResponse('Cet inventaire est deja finalise', undefined, 400)
    }

    // Check that at least one item has been counted
    const hasCountedItems = entry.items.some((item) => item.actualQty > 0)
    if (!hasCountedItems) {
      return errorResponse(
        'Au moins un produit doit avoir une quantite saisie',
        undefined,
        400
      )
    }

    const dateStr = entry.date.toISOString().split('T')[0]
    const userId = authResult.session.user?.id || ''

    // Create StockMovements and update Product.currentStock for variances
    const movementPromises = entry.items
      .filter((item) => item.variance !== 0)
      .map(async (item) => {
        // Create stock movement record
        await StockMovement.create({
          productId: item.productId,
          type: 'inventory_adjustment',
          quantity: item.variance,
          date: new Date(),
          reference: `INV-${dateStr}`,
          notes: `Inventaire du ${dateStr} - ${item.productName}`,
          createdBy: userId,
        })

        // Update product currentStock
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { currentStock: item.variance },
        })
      })

    await Promise.all(movementPromises)

    // Finalize the entry
    entry.status = 'finalized'
    entry.finalizedAt = new Date()
    await entry.save()

    // Auto-complete linked task if present
    if (entry.taskId) {
      try {
        const linkedTask = await Task.findById(entry.taskId)
        if (linkedTask && linkedTask.status === 'pending') {
          if (linkedTask.recurringTaskId) {
            await Task.findByIdAndDelete(linkedTask._id)
          } else {
            // Store inventoryEntryId in metadata
            const currentMetadata = (linkedTask.metadata || {}) as Record<string, unknown>
            linkedTask.metadata = { ...currentMetadata, inventoryEntryId: entry._id.toString() }
            linkedTask.markModified('metadata')
            linkedTask.status = 'completed'
            linkedTask.completedAt = new Date()
            await linkedTask.save()
          }
          notifyTaskCompleted(linkedTask.title, entry.taskId)
        }
      } catch (taskError) {
        // Task completion failure is non-blocking
        console.warn('[finalize] Failed to complete linked task:', taskError)
      }
    }

    // Transform for response
    const obj = entry.toObject() as unknown as Record<string, unknown>
    const items = (obj.items || []) as Array<Record<string, unknown>>

    const transformed = {
      ...obj,
      _id: entry._id.toString(),
      date: entry.date.toISOString().split('T')[0],
      finalizedAt: entry.finalizedAt?.toISOString().split('T')[0] || '',
      createdAt: entry.createdAt?.toISOString().split('T')[0] || '',
      updatedAt: entry.updatedAt?.toISOString().split('T')[0] || '',
      items: items.map((item) => ({
        ...item,
        productId: (item.productId as { toString(): string })?.toString() || '',
      })),
    }

    return successResponse(transformed, 'Inventaire finalise avec succes')
  } catch (error) {
    console.error('[POST /api/inventory/entries/[id]/finalize] Error:', error)

    if (
      error !== null &&
      typeof error === 'object' &&
      'name' in error &&
      (error as { name: string }).name === 'CastError'
    ) {
      return errorResponse('ID inventaire invalide', undefined, 400)
    }

    return errorResponse(
      "Erreur lors de la finalisation de l'inventaire",
      error instanceof Error ? error.message : undefined,
      500
    )
  }
}
