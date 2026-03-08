import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/api/auth'
import { successResponse, errorResponse } from '@/lib/api/response'
import { connectMongoose } from '@/lib/mongodb'
import { Task } from '@coworking-cafe/database'
import { Product } from '@/models/inventory/product'
import { getRequiredRoles } from '@/lib/inventory/permissions'
import { notifyLowStock } from '@/lib/inventory/notifications'
import type { ApiResponse } from '@/types/timeEntry'
import type { LowStockAlertResult } from '@/types/inventory'

export const dynamic = 'force-dynamic'

/**
 * POST /api/inventory/tasks/check-low-stock
 * Creates tasks for products below minimum stock level.
 * Idempotent: skips products that already have a pending low-stock task.
 */
export async function POST(): Promise<NextResponse<ApiResponse<LowStockAlertResult>>> {
  try {
    const authResult = await requireAuth(getRequiredRoles('viewInventory'))
    if (!authResult.authorized) return authResult.response

    await connectMongoose()

    const userId = authResult.session.user?.id || ''

    // Find products below minStock
    const lowStockProducts = await Product.find({
      isActive: true,
      $expr: { $lt: ['$currentStock', '$minStock'] },
    }).lean()

    if (lowStockProducts.length === 0) {
      return successResponse(
        { tasksCreated: 0, products: [] },
        'Aucun produit sous le seuil minimum'
      )
    }

    let tasksCreated = 0
    const alertedProducts: LowStockAlertResult['products'] = []

    for (const product of lowStockProducts) {
      const productId = product._id.toString()

      // Check if pending task already exists for this product
      const existing = await Task.findOne({
        'metadata.type': 'inventory',
        'metadata.productId': productId,
        status: 'pending',
      }).lean()

      if (existing) continue

      // Create alert task
      await Task.create({
        title: `Stock bas: ${product.name}`,
        description: `Stock actuel: ${product.currentStock} ${product.packagingType} (min: ${product.minStock})`,
        priority: 'high',
        status: 'pending',
        dueDate: new Date().toISOString().split('T')[0],
        metadata: { type: 'inventory', productId },
        createdBy: userId,
      })

      tasksCreated++
      alertedProducts.push({
        productId,
        productName: product.name,
        currentStock: product.currentStock,
        minStock: product.minStock,
      })
    }

    // Notification placeholder
    if (tasksCreated > 0) {
      notifyLowStock(alertedProducts)
    }

    return successResponse(
      { tasksCreated, products: alertedProducts },
      `${tasksCreated} alerte(s) stock bas creee(s)`,
      tasksCreated > 0 ? 201 : 200
    )
  } catch (error) {
    console.error('[POST /api/inventory/tasks/check-low-stock] Error:', error)
    return errorResponse(
      'Erreur lors de la verification du stock bas',
      error instanceof Error ? error.message : undefined,
      500
    )
  }
}
