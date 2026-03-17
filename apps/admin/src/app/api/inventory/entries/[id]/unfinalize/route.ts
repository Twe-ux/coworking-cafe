import { NextRequest } from "next/server"
import { requireAuth } from "@/lib/api/auth"
import { successResponse, errorResponse, notFoundResponse } from "@/lib/api/response"
import { toRecord } from "@/lib/api/casting"
import { connectMongoose } from "@/lib/mongodb"
import { InventoryEntry } from "@/models/inventory/inventoryEntry"
import { StockMovement } from "@/models/inventory/stockMovement"
import { Product } from "@/models/inventory/product"
import { PurchaseOrder } from "@/models/inventory/purchaseOrder"
import { getRequiredRoles } from "@/lib/inventory/permissions"

export const dynamic = 'force-dynamic'

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * POST /api/inventory/entries/[id]/unfinalize - Unfinalize (revert) inventory entry
 *
 * Actions:
 * 1. Check that entry is finalized
 * 2. Delete StockMovements created during finalization (type: inventory_adjustment)
 * 3. Revert Product.currentStock adjustments
 * 4. Delete auto-generated PurchaseOrders (status: draft, created during finalization)
 * 5. Mark entry as draft again
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

    if (entry.status !== 'finalized') {
      return errorResponse('Cet inventaire n\'est pas finalisé', undefined, 400)
    }

    // Security: only allow unfinalizing the most recent finalized inventory
    const lastFinalizedInventory = await InventoryEntry.findOne({
      status: 'finalized',
    })
      .sort({ finalizedAt: -1 })
      .lean()

    if (!lastFinalizedInventory) {
      return errorResponse('Aucun inventaire finalisé trouvé', undefined, 404)
    }

    if (lastFinalizedInventory._id.toString() !== entry._id.toString()) {
      return errorResponse(
        'Vous ne pouvez définaliser que le dernier inventaire finalisé. ' +
        'Des inventaires plus récents ont déjà été finalisés après celui-ci.',
        undefined,
        403
      )
    }

    const dateStr = entry.date.toISOString().split('T')[0]
    const reference = `INV-${dateStr}`

    console.log(`[unfinalize] Unfinalizing inventory ${reference}...`)

    // 1. Find and delete stock movements created during finalization
    const movementsToDelete = await StockMovement.find({
      type: 'inventory_adjustment',
      reference,
    })

    console.log(`[unfinalize] Found ${movementsToDelete.length} stock movements to delete`)

    // 2. Revert stock adjustments
    for (const movement of movementsToDelete) {
      // Revert the stock change (opposite operation)
      await Product.findByIdAndUpdate(movement.productId, {
        $inc: { currentStock: -movement.quantity },
      })
      console.log(
        `[unfinalize] Reverted stock for product ${movement.productId}: ${-movement.quantity}`
      )
    }

    // 3. Delete the stock movements
    await StockMovement.deleteMany({
      type: 'inventory_adjustment',
      reference,
    })

    // 4. Delete auto-generated purchase orders (draft status, created on finalization date)
    const finalizedDate = entry.finalizedAt
    if (finalizedDate) {
      // Delete orders created within 1 minute of finalization (to catch auto-generated ones)
      const startTime = new Date(finalizedDate.getTime() - 60000) // 1 min before
      const endTime = new Date(finalizedDate.getTime() + 60000) // 1 min after

      const ordersDeleted = await PurchaseOrder.deleteMany({
        status: 'draft',
        createdAt: { $gte: startTime, $lte: endTime },
        notes: { $regex: `inventaire du ${dateStr}`, $options: 'i' },
      })

      console.log(
        `[unfinalize] Deleted ${ordersDeleted.deletedCount} auto-generated purchase orders`
      )
    }

    // 5. Reset entry to draft status
    entry.status = 'draft'
    entry.finalizedAt = undefined
    // Reset variance values (will be recalculated on re-finalization)
    for (const item of entry.items) {
      item.varianceValue = 0
    }
    entry.totalVarianceValue = 0

    await entry.save()

    console.log(`[unfinalize] ✅ Successfully unfinalized inventory ${reference}`)

    // Transform for response
    const obj = toRecord(entry.toObject())
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

    return successResponse(
      transformed,
      'Inventaire définalise avec succès. Vous pouvez maintenant le modifier.'
    )
  } catch (error) {
    console.error('[POST /api/inventory/entries/[id]/unfinalize] Error:', error)

    return errorResponse(
      "Erreur lors de la définalisation de l'inventaire",
      error instanceof Error ? error.message : undefined,
      500
    )
  }
}
