import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/api/auth'
import { successResponse, errorResponse } from '@/lib/api/response'
import { connectMongoose } from '@/lib/mongodb'
import { Product } from '@/models/inventory/product'
import { getRequiredRoles } from '@/lib/inventory/permissions'
import {
  calculateOrderSuggestion,
  formatStock,
} from '@/lib/inventory/stockHelpers'
import type {
  OrderSuggestionsResponse,
  PackagingType,
  MinStockUnit,
} from '@/types/inventory'

export const dynamic = 'force-dynamic'

/**
 * GET /api/inventory/purchase-orders/suggestions?supplierId=xxx
 * Returns product suggestions for a supplier based on low stock levels.
 * Accounts for packaging type and units per package.
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

    // Fetch active products from this supplier
    // Low stock check accounts for minStockUnit (package vs unit)
    const products = await Product.find({
      supplierId,
      isActive: true,
      $expr: {
        $lt: [
          '$currentStock',
          {
            $cond: {
              if: { $eq: ['$minStockUnit', 'package'] },
              then: { $multiply: ['$minStock', { $ifNull: ['$unitsPerPackage', 1] }] },
              else: '$minStock',
            },
          },
        ],
      },
    })
      .sort({ order: 1, name: 1 })
      .lean()

    const suggestions = products.map((p) => {
      const packagingType = (p.packagingType || 'unit') as PackagingType
      const unitsPerPackage = p.unitsPerPackage || 1
      const minStockUnit = (p.minStockUnit || 'unit') as MinStockUnit

      const suggestion = calculateOrderSuggestion(
        p.currentStock,
        p.minStock,
        p.maxStock,
        minStockUnit,
        unitsPerPackage
      )

      return {
        productId: p._id.toString(),
        productName: p.name,
        unit: p.unit,
        currentStock: p.currentStock,
        currentStockFormatted: formatStock(
          p.currentStock,
          packagingType,
          unitsPerPackage,
          minStockUnit
        ),
        minStock: p.minStock,
        maxStock: p.maxStock,
        suggestedQuantity: suggestion.suggestedPacks,
        suggestedUnits: suggestion.suggestedUnits,
        packagingType,
        packagingDescription: p.packagingDescription || undefined,
        supplierReference: p.supplierReference || undefined,
        unitPriceHT: p.unitPriceHT,
        vatRate: p.vatRate,
      }
    })

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
