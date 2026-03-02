import { NextRequest } from "next/server"
import { requireAuth } from "@/lib/api/auth"
import { successResponse, errorResponse } from "@/lib/api/response"
import { connectMongoose } from "@/lib/mongodb"
import { Product } from "@/models/inventory/product"
import { getRequiredRoles } from "@/lib/inventory/permissions"
import { transformProductForAPI } from "@/lib/inventory/helpers"

/**
 * GET /api/inventory/products/low-stock - Get products with low stock
 * Returns products where currentStock < minStock
 * Auth: requireAuth(['admin', 'staff', 'dev'])
 */
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Auth check
    const authResult = await requireAuth(getRequiredRoles('viewProducts'))
    if (!authResult.authorized) return authResult.response

    // Connect to database
    await connectMongoose()

    // Fetch products with low stock (currentStock < minStock)
    const lowStockProducts = await Product.find({
      isActive: true,
      $expr: { $lt: ['$currentStock', '$minStock'] },
    })
      .populate('supplierId', 'name')
      .sort({ currentStock: 1 }) // Sort by lowest stock first
      .lean()

    // Transform dates to strings and populate supplier name
    const transformedProducts = lowStockProducts.map((product: {
      [key: string]: unknown
    }) => transformProductForAPI(product))

    return successResponse({
      products: transformedProducts,
      count: transformedProducts.length,
    })
  } catch (error) {
    console.error('[GET /api/inventory/products/low-stock] Error:', error)
    return errorResponse(
      'Erreur lors de la récupération des produits en rupture',
      error instanceof Error ? error.message : undefined,
      500
    )
  }
}
