import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/api/auth'
import { successResponse, errorResponse, notFoundResponse } from '@/lib/api/response'
import { connectMongoose } from '@/lib/mongodb'
import { PurchaseOrder } from '@/models/inventory/purchaseOrder'
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

    const transformed = transformOrder(
      order.toObject() as unknown as Record<string, unknown>
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
