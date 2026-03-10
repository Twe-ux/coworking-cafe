import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/api/auth'
import { successResponse, errorResponse, notFoundResponse } from '@/lib/api/response'
import { connectMongoose } from '@/lib/mongodb'
import { PurchaseOrder } from '@/models/inventory/purchaseOrder'
import { Product } from '@/models/inventory/product'
import { Supplier } from '@/models/inventory/supplier'
import { getRequiredRoles } from '@/lib/inventory/permissions'
import { transformOrder } from '@/lib/inventory/orderHelpers'
import { sendPurchaseOrderEmail } from '@/lib/email/emailService'

export const dynamic = 'force-dynamic'

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * POST /api/inventory/purchase-orders/[id]/send
 * Send purchase order to supplier via email (draft/validated → sent).
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

    // Accept both 'draft' and 'validated' status (new simplified workflow)
    if (order.status !== 'draft' && order.status !== 'validated') {
      return errorResponse(
        'Seules les commandes en brouillon ou validees peuvent etre envoyees',
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

    // Enrich items with product data (supplierReference, packagingDescription)
    const productIds = order.items.map((item) => item.productId)
    const products = await Product.find({ _id: { $in: productIds } })
      .select('supplierReference packagingDescription')
      .lean()

    const productMap = new Map(
      products.map((p) => [p._id.toString(), p])
    )

    // Send email to supplier
    const emailSent = await sendPurchaseOrderEmail(supplier.email, {
      orderNumber: order.orderNumber,
      supplierName: supplier.name,
      items: order.items.map((item) => {
        const productData = productMap.get(item.productId.toString())
        return {
          productName: item.productName,
          supplierReference: productData?.supplierReference || undefined,
          packagingDescription: productData?.packagingDescription || undefined,
          quantity: item.quantity,
          packagingType: item.packagingType,
          unitPriceHT: item.unitPriceHT,
          totalHT: item.totalHT,
        }
      }),
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
    console.error('[POST /api/inventory/purchase-orders/[id]/send] Error:', error)
    return errorResponse(
      "Erreur lors de l'envoi de la commande",
      error instanceof Error ? error.message : undefined,
      500
    )
  }
}
