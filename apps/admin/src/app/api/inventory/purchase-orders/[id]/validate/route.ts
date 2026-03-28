import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/api/auth'
import { successResponse, errorResponse, notFoundResponse } from '@/lib/api/response'
import { toRecord } from '@/lib/api/casting'
import { connectMongoose } from '@/lib/mongodb'
import { PurchaseOrder } from '@/models/inventory/purchaseOrder'
import { Supplier } from '@/models/inventory/supplier'
import { Task } from '@coworking-cafe/database'
import { getRequiredRoles } from '@/lib/inventory/permissions'
import { transformOrder } from '@/lib/inventory/orderHelpers'

export const dynamic = 'force-dynamic'

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * POST /api/inventory/purchase-orders/[id]/validate
 * Validate a purchase order (draft → validated).
 * Only admin/dev can validate.
 */
export async function POST(_request: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await requireAuth(getRequiredRoles('validateOrder'))
    if (!authResult.authorized) return authResult.response

    await connectMongoose()

    const { id } = await params
    const order = await PurchaseOrder.findById(id)

    if (!order) {
      return notFoundResponse('Commande')
    }

    if (order.status !== 'draft') {
      return errorResponse(
        'Seuls les brouillons peuvent etre valides',
        undefined,
        400
      )
    }

    order.status = 'validated'
    order.validatedBy = authResult.session.user?.id || ''
    order.validatedAt = new Date()
    await order.save()

    // Check if supplier has a delivery reminder message
    const supplier = await Supplier.findById(order.supplierId)
    console.log('[Validate Order] Supplier found:', supplier?.name)
    console.log('[Validate Order] Delivery reminder message:', supplier?.deliveryReminderMessage)

    if (supplier?.deliveryReminderMessage) {
      try {
        console.log('[Validate Order] Creating delivery reminder task...')
        const task = await Task.create({
          title: `Rappel livraison: ${supplier.name}`,
          description: supplier.deliveryReminderMessage,
          priority: 'low',
          status: 'pending',
          dueDate: new Date().toISOString().split('T')[0],
          metadata: {
            type: 'inventory',
            subType: 'delivery-reminder',
            supplierId: supplier._id.toString(),
            orderId: order._id.toString(),
          },
          createdBy: authResult.session.user?.id || 'system',
        })
        console.log('[Validate Order] Task created successfully:', task._id.toString())
      } catch (taskError) {
        console.error('[Validate Order] Failed to create task:', taskError)
        // Don't fail the order validation if task creation fails
      }
    } else {
      console.log('[Validate Order] No delivery reminder message configured for this supplier')
    }

    const transformed = transformOrder(
      toRecord(order.toObject())
    )

    return successResponse(transformed, 'Commande validee')
  } catch (error) {
    console.error('[POST /api/inventory/purchase-orders/[id]/validate] Error:', error)
    return errorResponse(
      'Erreur lors de la validation de la commande',
      error instanceof Error ? error.message : undefined,
      500
    )
  }
}
