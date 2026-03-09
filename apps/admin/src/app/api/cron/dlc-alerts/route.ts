import { NextRequest } from 'next/server'
import { successResponse, errorResponse } from '@/lib/api/response'
import { connectMongoose } from '@/lib/mongodb'
import { Product } from '@/models/inventory/product'
import { Supplier } from '@/models/inventory/supplier'
import { Task } from '@coworking-cafe/database'

export const dynamic = 'force-dynamic'

/**
 * GET /api/cron/dlc-alerts - Check DLC alerts and create tasks
 *
 * This cron job runs hourly to check DLC alerts at two levels:
 * 1. Product level: products with their own dlcAlertConfig
 * 2. Supplier level: all products from suppliers with dlcAlertConfig
 *
 * Product config takes priority over supplier config.
 *
 * Security: Should be called by Vercel Cron or protected by auth token
 */
export async function GET(request: NextRequest) {
  try {
    // Optional: Verify cron secret for security
    const authHeader = request.headers.get('authorization')
    const expectedToken = process.env.CRON_SECRET

    if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
      return errorResponse('Unauthorized', undefined, 401)
    }

    await connectMongoose()

    const now = new Date()
    const currentDay = now.getDay() // 0=Sunday, 1=Monday, ..., 6=Saturday
    const currentHour = now.getHours()
    const currentMinute = now.getMinutes()
    const currentTime = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`

    // Find products to count (two sources):
    // 1. Products with their own DLC alert config
    const productsWithOwnAlerts = await Product.find({
      isActive: true,
      'dlcAlertConfig.enabled': true,
    }).lean()

    // 2. Suppliers with DLC alert config (all their products)
    const suppliersWithAlerts = await Supplier.find({
      isActive: true,
      'dlcAlertConfig.enabled': true,
    }).lean()

    // Collect all products that should trigger an alert
    const productsToCount = new Map()

    // Add products with own config
    for (const product of productsWithOwnAlerts) {
      const config = product.dlcAlertConfig
      const shouldTrigger =
        config?.days?.includes(currentDay) &&
        isTimeMatch(currentTime, config?.time || '')

      if (shouldTrigger) {
        productsToCount.set(product._id.toString(), {
          productId: product._id.toString(),
          productName: product.name,
          source: 'product',
        })
      }
    }

    // Add products from suppliers with config (if not already added)
    for (const supplier of suppliersWithAlerts) {
      const config = supplier.dlcAlertConfig
      const shouldTrigger =
        config?.days?.includes(currentDay) &&
        isTimeMatch(currentTime, config?.time || '')

      if (shouldTrigger) {
        // Find all active products from this supplier
        const supplierProducts = await Product.find({
          isActive: true,
          supplierId: supplier._id,
          // Exclude products that already have their own config
          'dlcAlertConfig.enabled': { $ne: true },
        }).lean()

        for (const product of supplierProducts) {
          if (!productsToCount.has(product._id.toString())) {
            productsToCount.set(product._id.toString(), {
              productId: product._id.toString(),
              productName: product.name,
              source: 'supplier',
              supplierName: supplier.name,
            })
          }
        }
      }
    }

    if (productsToCount.size === 0) {
      return successResponse(
        { triggeredAlerts: 0, message: 'No DLC alerts matched current day/time' },
        'No alerts to process'
      )
    }

    // Check if task already exists for today
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const todayEnd = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      23,
      59,
      59
    )

    // Format today's date as YYYY-MM-DD string (required by Task model)
    const todayDateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`

    const existingTask = await Task.findOne({
      title: { $regex: 'Compter stock DLC courte' },
      status: { $in: ['pending', 'completed'] },
      createdAt: { $gte: todayStart, $lte: todayEnd },
    })

    let taskId = null

    if (!existingTask) {
      // Get system user ID from env (required by Task model)
      const systemUserId = process.env.SYSTEM_USER_ID || '000000000000000000000000'

      // Create task for DLC stock count
      const productsList = Array.from(productsToCount.values())
      const task = await Task.create({
        title: 'Compter stock DLC courte',
        description: `Compter le stock des produits à DLC courte et vérifier si commandes nécessaires.\n\nProduits concernés : ${productsList.map((p) => p.productName).join(', ')}`,
        priority: 'high',
        status: 'pending',
        dueDate: todayDateStr, // String format YYYY-MM-DD (required)
        createdBy: systemUserId, // Required by Task model
        metadata: {
          type: 'dlc_stock_count',
          productIds: productsList.map((p) => p.productId),
          triggeredBy: 'cron',
        },
      })

      taskId = task._id.toString()
    }

    return successResponse(
      {
        triggeredAlerts: productsToCount.size,
        productSources: {
          ownConfig: Array.from(productsToCount.values()).filter((p) => p.source === 'product').length,
          supplierConfig: Array.from(productsToCount.values()).filter((p) => p.source === 'supplier').length,
        },
        taskCreated: !!taskId,
        taskId,
        timestamp: now.toISOString(),
      },
      `Processed ${productsToCount.size} products for DLC alerts`
    )
  } catch (error) {
    console.error('[GET /api/cron/dlc-alerts] Error:', error)
    return errorResponse(
      'Error processing DLC alerts',
      error instanceof Error ? error.message : undefined,
      500
    )
  }
}

/**
 * Check if current time matches configured time (within 1-hour window)
 * Allows triggering within the same hour as configured
 */
function isTimeMatch(currentTime: string, configTime: string): boolean {
  if (!configTime) return false

  const [currentHour, currentMinute] = currentTime.split(':').map(Number)
  const [configHour, configMinute] = configTime.split(':').map(Number)

  // Match if current hour equals config hour
  // This allows the task to be created anytime within that hour
  return currentHour === configHour
}
