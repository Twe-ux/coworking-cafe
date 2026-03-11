import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/api/auth'
import { successResponse, errorResponse, notFoundResponse } from '@/lib/api/response'
import { toRecord } from '@/lib/api/casting'
import { connectMongoose } from '@/lib/mongodb'
import { PurchaseOrder } from '@/models/inventory/purchaseOrder'
import { Product } from '@/models/inventory/product'
import { StockMovement } from '@/models/inventory/stockMovement'
import { getRequiredRoles } from '@/lib/inventory/permissions'
import { transformOrder } from '@/lib/inventory/orderHelpers'
import type { ReceiveOrderData } from '@/types/inventory'

export const dynamic = 'force-dynamic'

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * POST /api/inventory/purchase-orders/[id]/receive
 * Receive a purchase order (sent → received).
 * Creates StockMovements and updates Product.currentStock for each received item.
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await requireAuth(getRequiredRoles('receiveStock'))
    if (!authResult.authorized) return authResult.response

    await connectMongoose()

    const { id } = await params
    const order = await PurchaseOrder.findById(id)

    if (!order) {
      return notFoundResponse('Commande')
    }

    if (order.status !== 'sent') {
      return errorResponse(
        'Seules les commandes envoyees peuvent etre receptionnees',
        undefined,
        400
      )
    }

    const body = (await request.json()) as ReceiveOrderData

    if (!body.items || body.items.length === 0) {
      return errorResponse('items requis', undefined, 400)
    }

    const userId = authResult.session.user?.id || ''

    // Create StockMovements and update currentStock for each received item
    const receptionPromises = body.items
      .filter((item) => item.receivedQty > 0)
      .map(async (item) => {
        // Find matching order item for pricing info
        const orderItem = order.items.find(
          (oi) => oi.productId.toString() === item.productId
        )

        if (!orderItem) {
          throw new Error(`Product ${item.productId} not found in order`)
        }

        const productName = orderItem.productName

        // Get product to check packaging
        const product = await Product.findById(item.productId).lean()
        if (!product) {
          throw new Error(`Product ${item.productId} not found`)
        }

        // Use receivedPrice if provided, otherwise use orderItem price
        const receivedUnitPriceHT = item.receivedPrice ?? orderItem.unitPriceHT
        const priceChanged = item.receivedPrice && Math.abs(item.receivedPrice - orderItem.unitPriceHT) > 0.01

        // Calculate unit price considering packaging (same logic as order creation)
        const unitPriceHT =
          product.packagingType === 'pack' && product.unitsPerPackage
            ? receivedUnitPriceHT * product.unitsPerPackage
            : receivedUnitPriceHT

        const totalValue = item.receivedQty * unitPriceHT

        // Calculate quantity in units (if pack, multiply by unitsPerPackage)
        const quantityInUnits =
          product.packagingType === 'pack' && product.unitsPerPackage
            ? item.receivedQty * product.unitsPerPackage
            : item.receivedQty

        // Update Product.unitPriceHT if received price is different
        if (priceChanged) {
          await Product.findByIdAndUpdate(item.productId, {
            unitPriceHT: receivedUnitPriceHT,
          })
          console.log(
            `[Receive Order] Updated price for ${productName}: ${orderItem.unitPriceHT} → ${receivedUnitPriceHT} EUR HT`
          )
        }

        // Create StockMovement record (in units)
        await StockMovement.create({
          productId: item.productId,
          type: 'purchase_reception',
          quantity: quantityInUnits,
          unitPriceHT,
          totalValue,
          date: new Date(),
          reference: order.orderNumber,
          notes: `Reception ${order.orderNumber} - ${productName}${
            product.packagingType === 'pack' && product.unitsPerPackage
              ? ` (${item.receivedQty} pack(s) × ${product.unitsPerPackage} unités)`
              : ''
          }${
            priceChanged
              ? ` - Prix mis à jour: ${orderItem.unitPriceHT.toFixed(2)} → ${receivedUnitPriceHT.toFixed(2)} EUR HT`
              : ''
          }`,
          createdBy: userId,
        })

        // Update Product currentStock (in units)
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { currentStock: quantityInUnits },
        })
      })

    await Promise.all(receptionPromises)

    // Mark order as received
    order.status = 'received'
    order.receivedAt = new Date()
    order.receivedBy = userId
    if (body.notes) {
      order.notes = [order.notes, body.notes].filter(Boolean).join(' | ')
    }
    await order.save()

    const transformed = transformOrder(
      toRecord(order.toObject())
    )

    return successResponse(transformed, 'Commande receptionnee')
  } catch (error) {
    console.error('[POST /api/inventory/purchase-orders/[id]/receive] Error:', error)
    return errorResponse(
      'Erreur lors de la reception de la commande',
      error instanceof Error ? error.message : undefined,
      500
    )
  }
}
