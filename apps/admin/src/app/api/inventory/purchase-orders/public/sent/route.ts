import { NextRequest } from 'next/server'
import { successResponse, errorResponse } from '@/lib/api/response'
import { toRecordArray } from '@/lib/api/casting'
import { connectMongoose } from '@/lib/mongodb'
import { PurchaseOrder } from '@/models/inventory/purchaseOrder'
import { transformOrder } from '@/lib/inventory/orderHelpers'

export const dynamic = 'force-dynamic'

/**
 * GET /api/inventory/purchase-orders/public/sent
 * List purchase orders with status "sent" (sent to supplier, waiting for reception)
 *
 * PUBLIC ROUTE - No authentication required (for staff page)
 */
export async function GET(_request: NextRequest) {
  try {
    await connectMongoose()

    const orders = await PurchaseOrder.find({ status: 'sent' })
      .sort({ sentAt: -1, createdAt: -1 })
      .lean()

    const transformed = toRecordArray(orders).map(transformOrder)

    return successResponse(transformed)
  } catch (error) {
    console.error('[GET /api/inventory/purchase-orders/public/sent] Error:', error)
    return errorResponse(
      'Erreur lors de la recuperation des commandes',
      error instanceof Error ? error.message : undefined,
      500
    )
  }
}
