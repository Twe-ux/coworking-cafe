import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/api/auth'
import { successResponse, errorResponse } from '@/lib/api/response'
import { connectMongoose } from '@/lib/mongodb'
import { Task } from '@coworking-cafe/database'
import { Product } from '@/models/inventory/product'

export const dynamic = 'force-dynamic'

interface StockCountItem {
  productId: string
  countedStock: number
  orderSuggestion: number
}

interface RequestBody {
  taskId: string
  products: StockCountItem[]
}

/**
 * POST /api/tasks/dlc-stock-count - Submit DLC stock count
 *
 * Receives stock counts from staff, updates products if needed,
 * creates admin notification, and marks task as completed.
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(['dev', 'admin', 'staff'])
    if (!authResult.authorized) return authResult.response

    await connectMongoose()

    const body = (await request.json()) as RequestBody

    if (!body.taskId || !body.products || body.products.length === 0) {
      return errorResponse('Task ID and products required', undefined, 400)
    }

    const userId = authResult.session.user?.id || ''
    const userName = authResult.session.user?.name || 'Staff'

    // Validate task exists
    const task = await Task.findById(body.taskId)
    if (!task) {
      return errorResponse('Task not found', undefined, 404)
    }

    // Fetch product details for notification
    const productIds = body.products.map((p) => p.productId)
    const products = await Product.find({ _id: { $in: productIds } }).lean()

    // Build notification data
    const stockCounts = body.products.map((item) => {
      const product = products.find((p) => p._id.toString() === item.productId)
      return {
        productId: item.productId,
        productName: product?.name || 'Unknown',
        countedStock: item.countedStock,
        orderSuggestion: item.orderSuggestion,
        packageUnit: product?.packageUnit || 'unités',
      }
    })

    // Create admin notification task
    await Task.create({
      title: 'Stock DLC courte compté - Vérifier et commander',
      description: `${userName} a compté le stock des produits à DLC courte.\n\n**Résultats :**\n${stockCounts
        .map(
          (sc) =>
            `• ${sc.productName} : ${sc.countedStock} ${sc.packageUnit}${
              sc.orderSuggestion > 0
                ? ` → **Commander ${sc.orderSuggestion.toFixed(1)} ${sc.packageUnit}**`
                : ''
            }`
        )
        .join('\n')}\n\nVeuillez vérifier et passer les commandes nécessaires.`,
      category: 'inventory',
      priority: 'high',
      status: 'pending',
      assignedTo: 'admin',
      metadata: {
        type: 'dlc_order_verification',
        stockCounts,
        submittedBy: userId,
        submittedAt: new Date().toISOString(),
        originalTaskId: body.taskId,
      },
    })

    // Mark original task as completed
    task.status = 'completed'
    task.completedAt = new Date()
    task.metadata = {
      ...((task.metadata || {}) as Record<string, unknown>),
      stockCounts,
      completedBy: userId,
    }
    task.markModified('metadata')
    await task.save()

    return successResponse(
      {
        taskCompleted: true,
        notificationCreated: true,
        stockCounts,
      },
      'Stock count submitted successfully'
    )
  } catch (error) {
    console.error('[POST /api/tasks/dlc-stock-count] Error:', error)
    return errorResponse(
      'Error submitting stock count',
      error instanceof Error ? error.message : undefined,
      500
    )
  }
}
