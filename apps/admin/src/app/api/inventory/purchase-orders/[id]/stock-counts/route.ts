import { NextRequest } from 'next/server'
import { successResponse, errorResponse } from '@/lib/api/response'
import { requireAuth } from '@/lib/api/auth'
import { connectMongoose } from '@/lib/mongodb'
import { Task } from '@coworking-cafe/database'

export const dynamic = 'force-dynamic'

/**
 * GET /api/inventory/purchase-orders/[id]/stock-counts
 * Retrieve stock counts from DLC task for this order
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await requireAuth(['dev', 'admin'])
  if (!authResult.authorized) return authResult.response

  try {
    await connectMongoose()
    const orderId = params.id

    // Find task with this orderId in metadata
    const task = await Task.findOne({
      'metadata.orderId': orderId,
      'metadata.type': 'dlc_stock_count',
    }).lean()

    if (!task || !task.metadata) {
      return successResponse(
        { stockCounts: [] },
        'No stock counts found for this order'
      )
    }

    const metadata = task.metadata as any
    const stockCounts = metadata.stockCounts || []

    return successResponse({ stockCounts }, 'Stock counts retrieved')
  } catch (error) {
    console.error('[GET /api/inventory/purchase-orders/[id]/stock-counts] Error:', error)
    return errorResponse(
      'Error retrieving stock counts',
      error instanceof Error ? error.message : undefined,
      500
    )
  }
}
