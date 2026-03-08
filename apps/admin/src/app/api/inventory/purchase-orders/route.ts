import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/api/auth'
import { successResponse, errorResponse } from '@/lib/api/response'
import { connectMongoose } from '@/lib/mongodb'
import { PurchaseOrder } from '@/models/inventory/purchaseOrder'
import { Product } from '@/models/inventory/product'
import { Supplier } from '@/models/inventory/supplier'
import { getRequiredRoles } from '@/lib/inventory/permissions'
import { transformOrder } from '@/lib/inventory/orderHelpers'
import type { CreatePurchaseOrderData } from '@/types/inventory'

export const dynamic = 'force-dynamic'

/**
 * GET /api/inventory/purchase-orders
 * List purchase orders with optional filters.
 * Query: ?status=draft|validated|sent|received&supplierId=xxx
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(getRequiredRoles('viewOrders'))
    if (!authResult.authorized) return authResult.response

    await connectMongoose()

    const { searchParams } = request.nextUrl
    const status = searchParams.get('status')
    const supplierId = searchParams.get('supplierId')

    const filter: Record<string, unknown> = {}
    if (status) filter.status = status
    if (supplierId) filter.supplierId = supplierId

    const orders = await PurchaseOrder.find(filter)
      .sort({ createdAt: -1 })
      .lean()

    const transformed = (orders as Array<Record<string, unknown>>).map(transformOrder)

    return successResponse(transformed)
  } catch (error) {
    console.error('[GET /api/inventory/purchase-orders] Error:', error)
    return errorResponse(
      'Erreur lors de la recuperation des commandes',
      error instanceof Error ? error.message : undefined,
      500
    )
  }
}

/**
 * POST /api/inventory/purchase-orders
 * Create a new purchase order draft.
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(getRequiredRoles('createOrderDraft'))
    if (!authResult.authorized) return authResult.response

    await connectMongoose()

    const body = (await request.json()) as CreatePurchaseOrderData

    if (!body.supplierId || !body.items || body.items.length === 0) {
      return errorResponse('supplierId et items requis', undefined, 400)
    }

    // Fetch supplier
    const supplier = await Supplier.findById(body.supplierId).lean()
    if (!supplier) {
      return errorResponse('Fournisseur introuvable', undefined, 404)
    }

    // Build items with product details and calculate totals
    let totalHT = 0
    let totalTTC = 0

    const itemsWithDetails = await Promise.all(
      body.items.map(async (item) => {
        const product = await Product.findById(item.productId).lean()
        if (!product) {
          throw new Error(`Produit ${item.productId} introuvable`)
        }

        const lineHT = item.quantity * product.unitPriceHT
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
        }
      })
    )

    // Generate order number: PO-YYYYMMDD-XXX
    const today = new Date().toISOString().split('T')[0].replace(/-/g, '')
    const countToday = await PurchaseOrder.countDocuments({
      orderNumber: { $regex: `^PO-${today}` },
    })
    const orderNumber = `PO-${today}-${String(countToday + 1).padStart(3, '0')}`

    const order = await PurchaseOrder.create({
      orderNumber,
      supplierId: body.supplierId,
      supplierName: supplier.name,
      items: itemsWithDetails,
      status: 'draft',
      totalHT: Math.round(totalHT * 100) / 100,
      totalTTC: Math.round(totalTTC * 100) / 100,
      createdBy: authResult.session.user?.id || '',
      notes: body.notes?.trim(),
    })

    const transformed = transformOrder(
      order.toObject() as unknown as Record<string, unknown>
    )

    return successResponse(transformed, 'Commande creee', 201)
  } catch (error) {
    console.error('[POST /api/inventory/purchase-orders] Error:', error)
    return errorResponse(
      'Erreur lors de la creation de la commande',
      error instanceof Error ? error.message : undefined,
      500
    )
  }
}
