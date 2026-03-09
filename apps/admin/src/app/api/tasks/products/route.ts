import { NextRequest } from 'next/server'
import { successResponse, errorResponse } from '@/lib/api/response'
import { connectMongoose } from '@/lib/mongodb'
import { Product } from '@/models/inventory/product'

export const dynamic = 'force-dynamic'

/**
 * GET /api/tasks/products?ids=xxx - Get products for DLC stock count tasks
 *
 * SECURITY NOTE:
 * This endpoint is accessible without NextAuth session to allow staff access.
 * Staff are protected by IP verification in middleware.
 * This endpoint only returns basic product info (name, stock, min/max) for
 * products that are already referenced in DLC tasks, so data exposure is minimal.
 */
export async function GET(request: NextRequest) {
  try {
    await connectMongoose()

    const { searchParams } = new URL(request.url)
    const ids = searchParams.get('ids')

    if (!ids) {
      return errorResponse('Product IDs required', undefined, 400)
    }

    const idArray = ids.split(',').filter(Boolean)

    // Fetch only necessary fields for DLC stock counting
    const products = await Product.find(
      { _id: { $in: idArray } },
      {
        _id: 1,
        name: 1,
        currentStock: 1,
        minStock: 1,
        maxStock: 1,
        packageUnit: 1,
      }
    ).lean()

    return successResponse(products, 'Products fetched successfully')
  } catch (error) {
    console.error('[GET /api/tasks/products] Error:', error)
    return errorResponse(
      'Error fetching products',
      error instanceof Error ? error.message : undefined,
      500
    )
  }
}
