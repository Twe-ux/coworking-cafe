import { NextRequest } from 'next/server'
import { successResponse, errorResponse } from '@/lib/api/response'
import { connectMongoose } from '@/lib/mongodb'
import { Product } from '@/models/inventory/product'
import { Supplier } from '@/models/inventory/supplier'
import { Task } from '@coworking-cafe/database'

export const dynamic = 'force-dynamic'

/**
 * GET /api/cron/dlc-alerts/test?time=12:00&day=1 - Test DLC alerts with custom time/day
 *
 * Query params:
 * - time: HH:mm format (e.g., "12:00") - defaults to current time
 * - day: 0-6 (0=Sunday, 1=Monday, etc.) - defaults to current day
 *
 * Example: /api/cron/dlc-alerts/test?time=12:00&day=1
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Get test parameters from query or use current time
    const now = new Date()
    const testTime = searchParams.get('time') || `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    const testDay = searchParams.get('day') ? parseInt(searchParams.get('day')!) : now.getDay()

    console.log(`[TEST] Simulating time: ${testTime}, day: ${testDay}`)

    await connectMongoose()

    // Find products with DLC alert config
    const productsWithOwnAlerts = await Product.find({
      isActive: true,
      'dlcAlertConfig.enabled': true,
    }).lean()

    // Find suppliers with DLC alert config
    const suppliersWithAlerts = await Supplier.find({
      isActive: true,
      'dlcAlertConfig.enabled': true,
    }).lean()

    // Collect matching products
    const productsToCount = new Map()

    // Check products with own config
    for (const product of productsWithOwnAlerts) {
      const config = product.dlcAlertConfig
      const shouldTrigger =
        config?.days?.includes(testDay) &&
        isTimeMatch(testTime, config?.time || '')

      if (shouldTrigger) {
        productsToCount.set(product._id.toString(), {
          productId: product._id.toString(),
          productName: product.name,
          source: 'product',
          configTime: config?.time,
          configDays: config?.days,
        })
      }
    }

    // Check products from suppliers with config
    for (const supplier of suppliersWithAlerts) {
      const config = supplier.dlcAlertConfig
      const shouldTrigger =
        config?.days?.includes(testDay) &&
        isTimeMatch(testTime, config?.time || '')

      if (shouldTrigger) {
        const supplierProducts = await Product.find({
          isActive: true,
          supplierId: supplier._id,
          'dlcAlertConfig.enabled': { $ne: true },
        }).lean()

        for (const product of supplierProducts) {
          if (!productsToCount.has(product._id.toString())) {
            productsToCount.set(product._id.toString(), {
              productId: product._id.toString(),
              productName: product.name,
              source: 'supplier',
              supplierName: supplier.name,
              configTime: config?.time,
              configDays: config?.days,
            })
          }
        }
      }
    }

    if (productsToCount.size === 0) {
      return successResponse(
        {
          testMode: true,
          testTime,
          testDay,
          triggeredAlerts: 0,
          message: 'No DLC alerts matched simulated day/time',
          debug: {
            productsWithAlerts: productsWithOwnAlerts.length,
            suppliersWithAlerts: suppliersWithAlerts.length,
          },
        },
        'Test completed - No matches'
      )
    }

    // Check if task already exists for today
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)
    const todayDateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`

    const existingTask = await Task.findOne({
      title: { $regex: 'Compter stock DLC courte' },
      status: { $in: ['pending', 'completed'] },
      createdAt: { $gte: todayStart, $lte: todayEnd },
    })

    let taskId = null
    let taskCreated = false

    if (!existingTask) {
      const systemUserId = process.env.SYSTEM_USER_ID || '000000000000000000000000'
      const productsList = Array.from(productsToCount.values())

      const task = await Task.create({
        title: 'Compter stock DLC courte (TEST)',
        description: `[TEST MODE] Compter le stock des produits à DLC courte.\n\nProduits : ${productsList.map((p) => p.productName).join(', ')}`,
        priority: 'high',
        status: 'pending',
        dueDate: todayDateStr,
        createdBy: systemUserId,
        metadata: {
          type: 'dlc_stock_count',
          productIds: productsList.map((p) => p.productId),
          triggeredBy: 'test',
          testTime,
          testDay,
        },
      })

      taskId = task._id.toString()
      taskCreated = true
    }

    return successResponse(
      {
        testMode: true,
        testTime,
        testDay,
        triggeredAlerts: productsToCount.size,
        products: Array.from(productsToCount.values()),
        taskCreated,
        taskId,
        existingTaskFound: !!existingTask,
        timestamp: now.toISOString(),
      },
      `Test completed - ${productsToCount.size} products matched`
    )
  } catch (error) {
    console.error('[GET /api/cron/dlc-alerts/test] Error:', error)
    return errorResponse(
      'Error testing DLC alerts',
      error instanceof Error ? error.message : undefined,
      500
    )
  }
}

/**
 * Check if simulated time matches configured time (within same hour)
 */
function isTimeMatch(simulatedTime: string, configTime: string): boolean {
  if (!configTime) return false

  const [simHour] = simulatedTime.split(':').map(Number)
  const [cfgHour] = configTime.split(':').map(Number)

  return simHour === cfgHour
}
