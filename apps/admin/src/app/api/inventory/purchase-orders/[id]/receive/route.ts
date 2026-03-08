import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/api/auth'
import { successResponse, errorResponse, notFoundResponse } from '@/lib/api/response'
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
        // Find matching product name from order for notes
        const orderItem = order.items.find(
          (oi) => oi.productId.toString() === item.productId
        )
        const productName = orderItem?.productName || item.productId

        // Create StockMovement record
        await StockMovement.create({
          productId: item.productId,
          type: 'purchase_reception',
          quantity: item.receivedQty,
          date: new Date(),
          reference: order.orderNumber,
          notes: `Reception ${order.orderNumber} - ${productName}`,
          createdBy: userId,
        })

        // Update Product currentStock
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { currentStock: item.receivedQty },
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
      order.toObject() as unknown as Record<string, unknown>
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
