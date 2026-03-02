import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/api/auth'
import { successResponse, errorResponse, notFoundResponse } from '@/lib/api/response'
import { connectMongoose } from '@/lib/mongodb'
import { PurchaseOrder } from '@/models/inventory/purchaseOrder'
import { Supplier } from '@/models/inventory/supplier'
import { getRequiredRoles } from '@/lib/inventory/permissions'
import { transformOrder } from '@/lib/inventory/orderHelpers'
import { sendPurchaseOrderEmail } from '@/lib/email/emailService'

export const dynamic = 'force-dynamic'

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * POST /api/inventory/purchase-orders/[id]/send-email
 * Send purchase order to supplier via email (validated → sent).
 * Only admin/dev can send.
 */
export async function POST(_request: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await requireAuth(getRequiredRoles('sendOrder'))
    if (!authResult.authorized) return authResult.response

    await connectMongoose()

    const { id } = await params
    const order = await PurchaseOrder.findById(id)

    if (!order) {
      return notFoundResponse('Commande')
    }

    if (order.status !== 'validated') {
      return errorResponse(
        'Seules les commandes validees peuvent etre envoyees',
        undefined,
        400
      )
    }

    // Fetch supplier email
    const supplier = await Supplier.findById(order.supplierId).lean()
    if (!supplier) {
      return errorResponse('Fournisseur introuvable', undefined, 404)
    }

    // Format order date
    const createdDate = new Date(order.createdAt)
    const formattedDate = createdDate.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })

    // Send email to supplier
    const emailSent = await sendPurchaseOrderEmail(supplier.email, {
      orderNumber: order.orderNumber,
      supplierName: supplier.name,
      items: order.items.map((item) => ({
        productName: item.productName,
        quantity: item.quantity,
        unit: item.unit,
        unitPriceHT: item.unitPriceHT,
        totalHT: item.totalHT,
      })),
      totalHT: order.totalHT,
      totalTTC: order.totalTTC,
      notes: order.notes,
      createdAt: formattedDate,
    })

    if (!emailSent) {
      return errorResponse('Erreur lors de l\'envoi de l\'email', undefined, 500)
    }

    order.status = 'sent'
    order.sentAt = new Date()
    await order.save()

    const transformed = transformOrder(
      order.toObject() as unknown as Record<string, unknown>
    )

    return successResponse(transformed, 'Commande envoyee')
  } catch (error) {
    console.error('[POST /api/inventory/purchase-orders/[id]/send-email] Error:', error)
    return errorResponse(
      "Erreur lors de l'envoi de la commande",
      error instanceof Error ? error.message : undefined,
      500
    )
  }
}
