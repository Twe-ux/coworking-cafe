import { NextRequest } from "next/server"
import { requireAuth } from "@/lib/api/auth"
import { successResponse, errorResponse } from "@/lib/api/response"
import { connectMongoose } from "@/lib/mongodb"
import { Product } from "@/models/inventory/product"
import { getRequiredRoles } from "@/lib/inventory/permissions"

export const dynamic = 'force-dynamic'

interface ProductAggResult {
  _id: string
  totalValue: number
  productCount: number
}

interface SupplierAggResult {
  _id: string
  supplierName: string
  totalValue: number
}

/**
 * GET /api/inventory/analytics/stock-value
 * Returns total stock value with breakdown by category and supplier
 * Query: ?category=food|cleaning&supplierId=xxx
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(getRequiredRoles('viewAnalytics'))
    if (!authResult.authorized) return authResult.response

    await connectMongoose()

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const supplierId = searchParams.get('supplierId')

    // Build match stage
    const match: Record<string, unknown> = { isActive: true }
    const validCategories = ['food', 'cleaning', 'emballage', 'papeterie', 'divers']
    if (category && validCategories.includes(category)) {
      match.category = category
    }
    if (supplierId) {
      const mongoose = await import('mongoose')
      match.supplierId = new mongoose.Types.ObjectId(supplierId)
    }

    // Aggregate by category
    const byCategory = await Product.aggregate<ProductAggResult>([
      { $match: match },
      {
        $group: {
          _id: '$category',
          totalValue: {
            $sum: { $multiply: ['$currentStock', '$unitPriceHT'] },
          },
          productCount: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ])

    // Aggregate by supplier
    const bySupplier = await Product.aggregate<SupplierAggResult>([
      { $match: match },
      {
        $group: {
          _id: '$supplierId',
          supplierName: { $first: '$supplierName' },
          totalValue: {
            $sum: { $multiply: ['$currentStock', '$unitPriceHT'] },
          },
        },
      },
      { $sort: { totalValue: -1 } },
    ])

    const totalValue = byCategory.reduce((sum, cat) => sum + cat.totalValue, 0)

    return successResponse({
      totalValue: Math.round(totalValue * 100) / 100,
      breakdown: byCategory.map((cat) => ({
        category: cat._id,
        value: Math.round(cat.totalValue * 100) / 100,
        products: cat.productCount,
      })),
      bySupplier: bySupplier.map((sup) => ({
        supplierId: sup._id.toString(),
        supplierName: sup.supplierName || 'N/A',
        value: Math.round(sup.totalValue * 100) / 100,
      })),
    })
  } catch (error) {
    console.error('[GET /api/inventory/analytics/stock-value] Error:', error)
    return errorResponse(
      'Erreur lors du calcul de la valeur du stock',
      error instanceof Error ? error.message : undefined,
      500
    )
  }
}
