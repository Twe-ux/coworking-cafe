import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/api/auth'
import {
  successResponse,
  errorResponse,
  notFoundResponse,
} from '@/lib/api/response'
import { connectMongoose } from '@/lib/mongodb'
import { PurchaseOrder } from '@/models/inventory/purchaseOrder'
import { Product } from '@/models/inventory/product'
import { StockMovement } from '@/models/inventory/stockMovement'
import { getRequiredRoles } from '@/lib/inventory/permissions'
import type { ReceiveOrderData } from '@/types/inventory'

export const dynamic = 'force-dynamic'

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * POST /api/inventory/orders/[id]/receive - Receive a purchase order
 *
 * Body: {
 *   items: [{ productId: string, receivedQty: number }],
 *   notes?: string
 * }
 *
 * Actions:
 * 1. Verify order exists and status = "sent"
 * 2. For each received item:
 *    - Create StockMovement (type: "purchase_reception")
 *    - Update Product.currentStock
 * 3. Change order status to "received"
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await requireAuth(getRequiredRoles('createInventory'))
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
        `Status actuel: ${order.status}`,
        400
      )
    }

    const body = (await request.json()) as ReceiveOrderData

    if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
      return errorResponse('Liste des produits recus requise', undefined, 400)
    }

    const userId = authResult.session.user?.id || ''
    const orderDate = new Date()

    // Process each received item
    const receiptPromises = body.items.map(async (receivedItem) => {
      // Find corresponding item in order
      const orderItem = order.items.find(
        (item) => item.productId.toString() === receivedItem.productId
      )

      if (!orderItem) {
        throw new Error(
          `Produit ${receivedItem.productId} non trouve dans la commande`
        )
      }

      // Validate received quantity
      if (receivedItem.receivedQty <= 0) {
        throw new Error('Quantite recue doit etre positive')
      }

      // Create StockMovement with price from order
      await StockMovement.create({
        productId: receivedItem.productId,
        type: 'purchase_reception',
        quantity: receivedItem.receivedQty,
        unitPriceHT: orderItem.unitPriceHT,
        totalValue: receivedItem.receivedQty * orderItem.unitPriceHT,
        date: orderDate,
        reference: order.orderNumber,
        notes: `Réception commande ${order.orderNumber} - ${orderItem.productName}`,
        createdBy: userId,
      })

      // Update product currentStock
      await Product.findByIdAndUpdate(receivedItem.productId, {
        $inc: { currentStock: receivedItem.receivedQty },
      })
    })

    await Promise.all(receiptPromises)

    // Update order status
    order.status = 'received'
    order.receivedAt = orderDate
    order.receivedBy = userId
    if (body.notes) {
      order.notes = body.notes
    }
    await order.save()

    // Transform for response
    const orderObj = order.toObject()
    const transformed = {
      ...orderObj,
      _id: order._id.toString(),
      supplierId: order.supplierId.toString(),
      validatedAt: order.validatedAt?.toISOString().split('T')[0],
      sentAt: order.sentAt?.toISOString().split('T')[0],
      receivedAt: order.receivedAt?.toISOString().split('T')[0],
      createdAt: order.createdAt?.toISOString().split('T')[0],
      updatedAt: order.updatedAt?.toISOString().split('T')[0],
      items: orderObj.items.map((item) => ({
        ...item,
        productId: item.productId.toString(),
      })),
    }

    return successResponse(transformed, 'Commande receptionnee avec succes')
  } catch (error) {
    console.error('[POST /api/inventory/orders/[id]/receive] Error:', error)

    if (
      error !== null &&
      typeof error === 'object' &&
      'name' in error &&
      (error as { name: string }).name === 'CastError'
    ) {
      return errorResponse('ID commande invalide', undefined, 400)
    }

    return errorResponse(
      'Erreur lors de la reception de la commande',
      error instanceof Error ? error.message : undefined,
      500
    )
  }
}
