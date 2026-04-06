import { NextRequest } from 'next/server'
import { successResponse, errorResponse } from '@/lib/api/response'
import { connectMongoose } from '@/lib/mongodb'
import { Product } from '@/models/inventory/product'
import { Supplier } from '@/models/inventory/supplier'

export const dynamic = 'force-dynamic'

/**
 * GET /api/cron/dlc-alerts/test - Test DLC alerts matching logic
 *
 * This endpoint simulates the cron job execution for debugging purposes.
 * It logs detailed information about suppliers, their configurations, and why they match or don't match.
 */
export async function GET(request: NextRequest) {
  try {
    await connectMongoose()

    const now = new Date()

    // Convert UTC time to French time (Europe/Paris timezone)
    const frenchTime = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Paris' }))
    const currentDay = frenchTime.getDay() // 0=Sunday, 1=Monday, ..., 6=Saturday
    const currentHour = frenchTime.getHours()
    const currentMinute = frenchTime.getMinutes()
    const currentTime = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`

    console.log('[TEST DLC ALERTS] ===== START =====')
    console.log('[TEST DLC ALERTS] Current UTC time:', now.toISOString())
    console.log('[TEST DLC ALERTS] Current French time:', frenchTime.toISOString())
    console.log('[TEST DLC ALERTS] Current day:', currentDay, getDayName(currentDay))
    console.log('[TEST DLC ALERTS] Current time:', currentTime)

    // Find products with own alerts
    const productsWithOwnAlerts = await Product.find({
      isActive: true,
      'dlcAlertConfig.enabled': true,
    }).lean()

    console.log('[TEST DLC ALERTS] Products with own alerts:', productsWithOwnAlerts.length)
    productsWithOwnAlerts.forEach(product => {
      const config = product.dlcAlertConfig
      const shouldTrigger =
        config?.days?.includes(currentDay) &&
        isTimeMatch(currentTime, config?.time || '')

      console.log(`[TEST DLC ALERTS] Product: ${product.name}`)
      console.log(`  - Config days: ${config?.days}`)
      console.log(`  - Config time: ${config?.time}`)
      console.log(`  - Days match: ${config?.days?.includes(currentDay)}`)
      console.log(`  - Time match: ${isTimeMatch(currentTime, config?.time || '')}`)
      console.log(`  - Should trigger: ${shouldTrigger}`)
    })

    // Find suppliers with alerts
    const suppliersWithAlerts = await Supplier.find({
      isActive: true,
      'dlcAlertConfig.enabled': true,
    }).lean()

    console.log('[TEST DLC ALERTS] Suppliers with DLC alerts:', suppliersWithAlerts.length)

    const debugInfo: any[] = []

    for (const supplier of suppliersWithAlerts) {
      const config = supplier.dlcAlertConfig
      const shouldTrigger =
        config?.days?.includes(currentDay) &&
        isTimeMatch(currentTime, config?.time || '')

      const info = {
        supplierName: supplier.name,
        isActive: supplier.isActive,
        dlcAlertEnabled: config?.enabled,
        configDays: config?.days,
        configTime: config?.time,
        currentDay,
        currentDayName: getDayName(currentDay),
        currentTime,
        daysMatch: config?.days?.includes(currentDay),
        timeMatch: isTimeMatch(currentTime, config?.time || ''),
        shouldTrigger,
      }

      console.log(`[TEST DLC ALERTS] Supplier: ${supplier.name}`)
      console.log(`  - Active: ${supplier.isActive}`)
      console.log(`  - DLC Alert Enabled: ${config?.enabled}`)
      console.log(`  - Config days: ${JSON.stringify(config?.days)}`)
      console.log(`  - Config time: ${config?.time}`)
      console.log(`  - Current day: ${currentDay} (${getDayName(currentDay)})`)
      console.log(`  - Current time: ${currentTime}`)
      console.log(`  - Days match: ${config?.days?.includes(currentDay)}`)
      console.log(`  - Time match: ${isTimeMatch(currentTime, config?.time || '')}`)
      console.log(`  - Should trigger: ${shouldTrigger}`)

      if (shouldTrigger) {
        // Find products for this supplier
        const supplierProducts = await Product.find({
          isActive: true,
          supplierId: supplier._id,
          'dlcAlertConfig.enabled': { $ne: true },
        }).lean()

        console.log(`  - Products found: ${supplierProducts.length}`)
        info.productsCount = supplierProducts.length
        info.productNames = supplierProducts.map(p => p.name)
      }

      debugInfo.push(info)
    }

    console.log('[TEST DLC ALERTS] ===== END =====')

    return successResponse(
      {
        currentUTCTime: now.toISOString(),
        currentFrenchTime: frenchTime.toISOString(),
        currentDay,
        currentDayName: getDayName(currentDay),
        currentTime,
        productsWithOwnAlerts: productsWithOwnAlerts.length,
        suppliersWithAlerts: suppliersWithAlerts.length,
        debugInfo,
      },
      'DLC alerts test completed'
    )
  } catch (error) {
    console.error('[TEST DLC ALERTS] Error:', error)
    return errorResponse(
      'Error testing DLC alerts',
      error instanceof Error ? error.message : undefined,
      500
    )
  }
}

/**
 * Check if current time matches configured time (within 1-hour window)
 */
function isTimeMatch(currentTime: string, configTime: string): boolean {
  if (!configTime) return false

  const [currentHour, currentMinute] = currentTime.split(':').map(Number)
  const [configHour, configMinute] = configTime.split(':').map(Number)

  // Match if current hour equals config hour
  return currentHour === configHour
}

function getDayName(day: number): string {
  const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']
  return days[day] || 'Unknown'
}
