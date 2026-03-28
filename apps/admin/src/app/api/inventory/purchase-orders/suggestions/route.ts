import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/api/auth'
import { successResponse, errorResponse } from '@/lib/api/response'
import { connectMongoose } from '@/lib/mongodb'
import { Product } from '@/models/inventory/product'
import { Supplier } from '@/models/inventory/supplier'
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

    // Check if supplier requires stock management
    const supplier = await Supplier.findById(supplierId)
    if (!supplier) {
      return errorResponse('Fournisseur introuvable', undefined, 404)
    }

    // If supplier doesn't require stock management, return empty suggestions
    if (!supplier.requiresStockManagement) {
      const result: OrderSuggestionsResponse = {
        supplierId,
        suggestions: [],
        total: 0,
      }
      return successResponse(result)
    }

    // Fetch ALL active products from this supplier (not just low stock)
    // We'll include all products in suggestions to complete order up to maxStock
    const products = await Product.find({
      supplierId,
      isActive: true,
    })
      .sort({ order: 1, name: 1 })
      .lean()

    const suggestions = products
      .map((p) => {
        const packagingType = (p.packagingType || 'unit') as PackagingType
        const unitsPerPackage = p.unitsPerPackage || 1

        // Calculate quantity to reach maxStock (not just minStock)
        // Formula: maxStock - currentStock
        const qtyNeeded = Math.max(0, p.maxStock - p.currentStock)

        // If no quantity needed, skip this product
        if (qtyNeeded <= 0) {
          return null
        }

        // Convert units to packs if needed
        const suggestedPacks = Math.ceil(qtyNeeded / unitsPerPackage)
        const suggestedUnits = suggestedPacks * unitsPerPackage

        return {
          productId: p._id.toString(),
          productName: p.name,
          packagingType,
          currentStock: p.currentStock,
          currentStockFormatted: formatStock(p.currentStock, p.packageUnit),
          minStock: p.minStock,
          maxStock: p.maxStock,
          suggestedQuantity: suggestedPacks,
          suggestedUnits: suggestedUnits,
          packagingDescription: p.packagingDescription || undefined,
          supplierReference: p.supplierReference || undefined,
          unitPriceHT: p.unitPriceHT,
          vatRate: p.vatRate,
        }
      })
      .filter((s): s is NonNullable<typeof s> => s !== null) // Remove null entries

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
