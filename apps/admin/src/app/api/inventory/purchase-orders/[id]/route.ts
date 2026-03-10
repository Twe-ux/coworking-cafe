import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/api/auth'
import { successResponse, errorResponse, notFoundResponse } from '@/lib/api/response'
import { connectMongoose } from '@/lib/mongodb'
import { PurchaseOrder } from '@/models/inventory/purchaseOrder'
import { Product } from '@/models/inventory/product'
import { getRequiredRoles } from '@/lib/inventory/permissions'
import { transformOrder } from '@/lib/inventory/orderHelpers'
import type { UpdatePurchaseOrderData } from '@/types/inventory'

export const dynamic = 'force-dynamic'

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * GET /api/inventory/purchase-orders/[id]
 * Get purchase order detail.
 */
export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await requireAuth(getRequiredRoles('viewOrders'))
    if (!authResult.authorized) return authResult.response

    await connectMongoose()

    const { id } = await params
    const order = await PurchaseOrder.findById(id).lean()

    if (!order) {
      return notFoundResponse('Commande')
    }

    // Enrich items with unitsPerPackage from products if missing
    const enrichedItems = await Promise.all(
      order.items.map(async (item) => {
        // If unitsPerPackage is already present, return as-is
        if (item.unitsPerPackage !== undefined && item.unitsPerPackage !== null) {
          return item
        }

        // Otherwise, fetch from product
        try {
          const product = await Product.findById(item.productId).lean()
          return {
            ...item,
            unitsPerPackage: product?.unitsPerPackage || 1,
          }
        } catch (error) {
          console.error(`Error fetching product ${item.productId}:`, error)
          return { ...item, unitsPerPackage: 1 }
        }
      })
    )

    const enrichedOrder = { ...order, items: enrichedItems }

    return successResponse(transformOrder(enrichedOrder as unknown as Record<string, unknown>))
  } catch (error) {
    console.error('[GET /api/inventory/purchase-orders/[id]] Error:', error)
    return errorResponse(
      'Erreur lors de la recuperation de la commande',
      error instanceof Error ? error.message : undefined,
      500
    )
  }
}

/**
 * PUT /api/inventory/purchase-orders/[id]
 * Update a draft purchase order (items, notes).
 * Only drafts can be modified.
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await requireAuth(getRequiredRoles('createOrderDraft'))
    if (!authResult.authorized) return authResult.response

    await connectMongoose()

    const { id } = await params
    const order = await PurchaseOrder.findById(id)

    if (!order) {
      return notFoundResponse('Commande')
    }

    if (order.status !== 'draft') {
      return errorResponse(
        'Seuls les brouillons peuvent etre modifies',
        undefined,
        400
      )
    }

    const body = (await request.json()) as UpdatePurchaseOrderData

    // Recalculate totals if items changed
    if (body.items && body.items.length > 0) {
      let totalHT = 0
      let totalTTC = 0

      const newItems = await Promise.all(
        body.items.map(async (item) => {
          const product = await Product.findById(item.productId).lean()
          if (!product) {
            throw new Error(`Produit ${item.productId} introuvable`)
          }

          // Calculate price per item: for packs, multiply unitPrice by unitsPerPackage
          const pricePerItem =
            product.packagingType === 'pack' && product.unitsPerPackage
              ? product.unitPriceHT * product.unitsPerPackage
              : product.unitPriceHT

          const lineHT = item.quantity * pricePerItem
          const lineTTC = lineHT * (1 + product.vatRate / 100)

          totalHT += lineHT
          totalTTC += lineTTC

          return {
            productId: product._id,
            productName: product.name,
            quantity: item.quantity,
            packagingType: product.packagingType,
            unitPriceHT: product.unitPriceHT,
            vatRate: product.vatRate,
            totalHT: Math.round(lineHT * 100) / 100,
            totalTTC: Math.round(lineTTC * 100) / 100,
            unitsPerPackage: product.unitsPerPackage || undefined,
          }
        })
      )

      order.items = newItems
      order.totalHT = Math.round(totalHT * 100) / 100
      order.totalTTC = Math.round(totalTTC * 100) / 100
    }

    if (body.notes !== undefined) {
      order.notes = body.notes?.trim()
    }

    await order.save()

    const transformed = transformOrder(
      order.toObject() as unknown as Record<string, unknown>
    )

    return successResponse(transformed, 'Commande mise a jour')
  } catch (error) {
    console.error('[PUT /api/inventory/purchase-orders/[id]] Error:', error)
    return errorResponse(
      'Erreur lors de la mise a jour de la commande',
      error instanceof Error ? error.message : undefined,
      500
    )
  }
}

/**
 * DELETE /api/inventory/purchase-orders/[id]
 * Delete a draft purchase order.
 * Only drafts can be deleted.
 */
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await requireAuth(getRequiredRoles('createOrderDraft'))
    if (!authResult.authorized) return authResult.response

    await connectMongoose()

    const { id } = await params
    const order = await PurchaseOrder.findById(id)

    if (!order) {
      return notFoundResponse('Commande')
    }

    if (order.status !== 'draft') {
      return errorResponse(
        'Seuls les brouillons peuvent etre supprimes',
        undefined,
        400
      )
    }

    // Hard delete for drafts
    await PurchaseOrder.findByIdAndDelete(id)

    return successResponse(
      { message: 'Commande supprimee avec succes' },
      'Commande supprimee avec succes'
    )
  } catch (error) {
    const { id } = await params
    console.error(`[DELETE /api/inventory/purchase-orders/${id}] Error:`, error)
    return errorResponse(
      'Erreur lors de la suppression de la commande',
      error instanceof Error ? error.message : undefined,
      500
    )
  }
}
