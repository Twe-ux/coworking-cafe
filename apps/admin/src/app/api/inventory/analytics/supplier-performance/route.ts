import { NextRequest } from "next/server"
import { requireAuth } from "@/lib/api/auth"
import { successResponse, errorResponse } from "@/lib/api/response"
import { connectMongoose } from "@/lib/mongodb"
import { Product } from "@/models/inventory/product"
import { getRequiredRoles } from "@/lib/inventory/permissions"

export const dynamic = 'force-dynamic'

interface SupplierAggResult {
  _id: string
  supplierName: string
  totalProducts: number
  stockValue: number
  categories: string[]
}

/**
 * GET /api/inventory/analytics/supplier-performance
 * Returns supplier stats based on products and stock value
 * Note: PurchaseOrders stats will be added once Task #6 is complete
 */
export async function GET(_request: NextRequest) {
  try {
    const authResult = await requireAuth(getRequiredRoles('viewAnalytics'))
    if (!authResult.authorized) return authResult.response

    await connectMongoose()

    const suppliers = await Product.aggregate<SupplierAggResult>([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$supplierId',
          supplierName: { $first: '$supplierName' },
          totalProducts: { $sum: 1 },
          stockValue: {
            $sum: { $multiply: ['$currentStock', '$unitPriceHT'] },
          },
          categories: { $addToSet: '$category' },
        },
      },
      { $sort: { stockValue: -1 } },
    ])

    return successResponse({
      suppliers: suppliers.map((s) => ({
        supplierId: s._id.toString(),
        supplierName: s.supplierName || 'N/A',
        totalProducts: s.totalProducts,
        stockValue: Math.round(s.stockValue * 100) / 100,
        categories: s.categories,
      })),
    })
  } catch (error) {
    console.error('[GET /api/inventory/analytics/supplier-performance] Error:', error)
    return errorResponse(
      'Erreur lors du calcul des performances fournisseurs',
      error instanceof Error ? error.message : undefined,
      500
    )
  }
}
