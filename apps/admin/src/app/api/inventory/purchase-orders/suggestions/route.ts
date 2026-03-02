import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/api/auth'
import { successResponse, errorResponse } from '@/lib/api/response'
import { connectMongoose } from '@/lib/mongodb'
import { Product } from '@/models/inventory/product'
import { getRequiredRoles } from '@/lib/inventory/permissions'
import type { OrderSuggestionsResponse } from '@/types/inventory'

export const dynamic = 'force-dynamic'

/**
 * GET /api/inventory/purchase-orders/suggestions?supplierId=xxx
 * Returns product suggestions for a supplier based on low stock levels.
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(getRequiredRoles('viewOrders'))
    if (!authResult.authorized) return authResult.response

    await connectMongoose()

    const supplierId = request.nextUrl.searchParams.get('supplierId')
    if (!supplierId) {
      return errorResponse('supplierId requis', undefined, 400)
    }

    // Fetch products from this supplier that are below minStock
    const products = await Product.find({
      supplierId,
      isActive: true,
      $expr: { $lt: ['$currentStock', '$minStock'] },
    })
      .sort({ name: 1 })
      .lean()

    const suggestions = products.map((p) => ({
      productId: p._id.toString(),
      productName: p.name,
      unit: p.unit,
      currentStock: p.currentStock,
      minStock: p.minStock,
      maxStock: p.maxStock,
      suggestedQuantity: Math.max(0, p.maxStock - p.currentStock),
      unitPriceHT: p.unitPriceHT,
      vatRate: p.vatRate,
    }))

    const result: OrderSuggestionsResponse = {
      supplierId,
      suggestions,
      total: suggestions.length,
    }

    return successResponse(result)
  } catch (error) {
    console.error('[GET /api/inventory/purchase-orders/suggestions] Error:', error)
    return errorResponse(
      'Erreur lors de la recuperation des suggestions',
      error instanceof Error ? error.message : undefined,
      500
    )
  }
}
