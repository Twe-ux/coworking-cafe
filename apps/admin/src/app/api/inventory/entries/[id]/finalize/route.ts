import { NextRequest } from "next/server"
import { requireAuth } from "@/lib/api/auth"
import { successResponse, errorResponse, notFoundResponse } from "@/lib/api/response"
import { connectMongoose } from "@/lib/mongodb"
import { InventoryEntry } from "@/models/inventory/inventoryEntry"
import { StockMovement } from "@/models/inventory/stockMovement"
import { Product } from "@/models/inventory/product"
import { PurchaseOrder } from "@/models/inventory/purchaseOrder"
import { Supplier } from "@/models/inventory/supplier"
import { Task } from '@coworking-cafe/database'
import { getRequiredRoles } from "@/lib/inventory/permissions"
import { notifyTaskCompleted } from "@/lib/inventory/notifications"
import { calculateCUMPBatch } from "@/lib/inventory/cumpCalculator"

export const dynamic = 'force-dynamic'

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * Calculate order quantity based on stock levels and pack constraints
 */
function calculateOrderQuantity(
  realStock: number,
  minStock: number,
  maxStock: number,
  packagingType: string,
  unitsPerPackage: number
): number {
  // If real stock >= minStock, no need to order
  if (realStock >= minStock) return 0

  // Calculate need
  const need = maxStock - realStock

  // If ordering in packs, round up to next pack
  if (packagingType === 'pack' && unitsPerPackage > 1) {
    const packs = Math.ceil(need / unitsPerPackage)
    return packs
  }

  // Otherwise return need in units
  return need
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

    // Calculate CUMP for all products in the inventory
    // Period: from start of month to inventory date
    const inventoryDate = new Date(entry.date)
    const monthStart = new Date(inventoryDate.getFullYear(), inventoryDate.getMonth(), 1)
    const monthStartStr = monthStart.toISOString().split('T')[0]
    const monthEndStr = dateStr

    const productIds = entry.items.map((item) => item.productId.toString())
    const cumpResults = await calculateCUMPBatch(productIds, monthStartStr, monthEndStr)

    // Create StockMovements and update Product.currentStock for variances
    const movementPromises = entry.items
      .filter((item) => item.variance !== 0)
      .map(async (item) => {
        const productId = item.productId.toString()
        const cumpData = cumpResults.get(productId)
        const cump = cumpData?.cump || item.unitPriceHT

        // Create stock movement record with CUMP
        await StockMovement.create({
          productId: item.productId,
          type: 'inventory_adjustment',
          quantity: item.variance,
          unitPriceHT: cump,
          totalValue: item.variance * cump,
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

    // Update varianceValue in inventory items with CUMP
    for (const item of entry.items) {
      const productId = item.productId.toString()
      const cumpData = cumpResults.get(productId)
      const cump = cumpData?.cump || item.unitPriceHT
      item.varianceValue = item.variance * cump
    }

    // Recalculate total variance value
    entry.totalVarianceValue = entry.items.reduce(
      (sum, item) => sum + item.varianceValue,
      0
    )

    // Finalize the entry
    entry.status = 'finalized'
    entry.finalizedAt = new Date()
    await entry.save()

    // Auto-generate purchase orders for all inventories
    // Only for products with actualQty < minStock
    try {
        console.log('[finalize] Starting auto-generation of purchase orders...')

        // Group products by supplier that need ordering
        const ordersBySupplier = new Map<string, Array<{ productId: string; quantity: number }>>()
        let productsChecked = 0
        let productsNeedingOrder = 0

        for (const item of entry.items) {
          productsChecked++
          const product = await Product.findById(item.productId)

          if (!product) {
            console.log(`[finalize] Product ${item.productId} not found, skipping`)
            continue
          }

          if (!product.isActive) {
            console.log(`[finalize] Product ${product.name} is inactive, skipping`)
            continue
          }

          // Calculate order quantity based on actual stock from inventory
          // Use 0 if actualQty is undefined/null
          const actualQty = item.actualQty ?? 0

          const orderQty = calculateOrderQuantity(
            actualQty,
            product.minStock,
            product.maxStock,
            product.packagingType,
            product.unitsPerPackage || 1
          )

          console.log(`[finalize] ${product.name}: actualQty=${actualQty}, minStock=${product.minStock}, maxStock=${product.maxStock}, orderQty=${orderQty}`)

          if (orderQty > 0) {
            productsNeedingOrder++
            const supplierId = product.supplierId.toString()
            if (!ordersBySupplier.has(supplierId)) {
              ordersBySupplier.set(supplierId, [])
            }
            ordersBySupplier.get(supplierId)!.push({
              productId: product._id.toString(),
              quantity: orderQty,
            })
          }
        }

        console.log(`[finalize] Checked ${productsChecked} products, ${productsNeedingOrder} need ordering`)
        console.log(`[finalize] Orders to create for ${ordersBySupplier.size} suppliers`)

        // Create a draft purchase order for each supplier
        const orderCreationPromises = Array.from(ordersBySupplier.entries()).map(
          async ([supplierId, items]) => {
            const supplier = await Supplier.findById(supplierId)
            if (!supplier) {
              console.log(`[finalize] Supplier ${supplierId} not found, skipping order`)
              return
            }
            if (!supplier.isActive) {
              console.log(`[finalize] Supplier ${supplier.name} is inactive, skipping order`)
              return
            }

            console.log(`[finalize] Creating order for supplier ${supplier.name} with ${items.length} products`)

            // Generate order number
            const today = new Date()
            const dateStr = today.toISOString().split('T')[0].replace(/-/g, '')
            const count = await PurchaseOrder.countDocuments()
            const orderNumber = `CMD-${dateStr}-${String(count + 1).padStart(4, '0')}`

            // Calculate totals
            let totalHT = 0
            let totalTTC = 0
            const enrichedItems = await Promise.all(
              items.map(async (item) => {
                const product = await Product.findById(item.productId)
                if (!product) return null

                // Calculate price per item (consider packs)
                const pricePerItem =
                  product.packagingType === 'pack' && product.unitsPerPackage
                    ? product.unitPriceHT * product.unitsPerPackage
                    : product.unitPriceHT

                const itemHT = item.quantity * pricePerItem
                const itemTTC = itemHT * (1 + product.vatRate / 100)

                totalHT += itemHT
                totalTTC += itemTTC

                return {
                  productId: item.productId,
                  productName: product.name,
                  quantity: item.quantity,
                  packagingType: product.packagingType,
                  unitPriceHT: product.unitPriceHT,
                  vatRate: product.vatRate,
                  totalHT: Math.round(itemHT * 100) / 100,
                  totalTTC: Math.round(itemTTC * 100) / 100,
                  unitsPerPackage: product.unitsPerPackage || 1,
                }
              })
            )

            const validItems = enrichedItems.filter((item) => item !== null)
            if (validItems.length === 0) {
              console.log(`[finalize] No valid items for supplier ${supplier.name}, skipping`)
              return
            }

            const order = await PurchaseOrder.create({
              orderNumber,
              supplierId,
              supplierName: supplier.name,
              items: validItems,
              totalHT,
              totalTTC,
              status: 'draft',
              notes: `Commande générée automatiquement suite à l'inventaire du ${dateStr}`,
              createdBy: userId,
            })

            console.log(`[finalize] ✅ Created order ${orderNumber} for ${supplier.name} - ${validItems.length} products, ${totalHT.toFixed(2)}€ HT`)
          }
        )

        await Promise.all(orderCreationPromises)
        console.log('[finalize] ✅ Auto-generation of purchase orders completed successfully')
    } catch (orderError) {
      // Order generation failure is non-blocking
      console.error('[finalize] ❌ Failed to generate purchase orders:', orderError)
      if (orderError instanceof Error) {
        console.error('[finalize] Error details:', orderError.message, orderError.stack)
      }
    }

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
