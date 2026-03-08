import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/api/auth'
import { successResponse, errorResponse } from '@/lib/api/response'
import { connectMongoose } from '@/lib/mongodb'
import { InventoryEntry } from '@/models/inventory/inventoryEntry'
import { calculateCUMPBatch } from '@/lib/inventory/cumpCalculator'
import { getRequiredRoles } from '@/lib/inventory/permissions'

export const dynamic = 'force-dynamic'

interface ProductConsumption {
  productId: string
  productName: string
  totalQuantityConsumed: number
  avgCUMP: number
  totalValue: number
}

/**
 * GET /api/inventory/analytics/consumption
 * Analyze consumption by period (year or year+month)
 * Query params: ?year=2026&month=3 (month optional)
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(getRequiredRoles('viewInventory'))
    if (!authResult.authorized) return authResult.response

    await connectMongoose()

    const { searchParams } = new URL(request.url)
    const yearParam = searchParams.get('year')
    const monthParam = searchParams.get('month')

    if (!yearParam) {
      return errorResponse('Paramètre "year" requis', undefined, 400)
    }

    const year = parseInt(yearParam, 10)
    const month = monthParam ? parseInt(monthParam, 10) : null

    // Build date range
    let startDate: Date
    let endDate: Date

    if (month) {
      // Specific month
      startDate = new Date(year, month - 1, 1)
      endDate = new Date(year, month, 0) // Last day of month
    } else {
      // Whole year
      startDate = new Date(year, 0, 1)
      endDate = new Date(year, 11, 31)
    }

    // Fetch finalized inventories in period
    const inventories = await InventoryEntry.find({
      status: 'finalized',
      date: {
        $gte: startDate.toISOString().split('T')[0],
        $lte: endDate.toISOString().split('T')[0],
      },
    }).sort({ date: 1 }).lean()

    if (inventories.length === 0) {
      return successResponse({
        totalValue: 0,
        topProducts: [],
        monthlyTrend: [],
        inventoryCount: 0,
      })
    }

    // Aggregate consumption per product
    const productConsumptionMap = new Map<string, ProductConsumption>()

    for (const inventory of inventories) {
      // Calculate CUMP for products in this inventory
      const inventoryDate = new Date(inventory.date)
      const monthStart = new Date(inventoryDate.getFullYear(), inventoryDate.getMonth(), 1)
      const monthStartStr = monthStart.toISOString().split('T')[0]
      const dateStr = inventoryDate.toISOString().split('T')[0]

      const productIds = inventory.items
        .filter((item) => item.variance < 0) // Only consumed items
        .map((item) => item.productId.toString())

      if (productIds.length === 0) continue

      const cumpResults = await calculateCUMPBatch(productIds, monthStartStr, dateStr)

      // Aggregate consumption
      for (const item of inventory.items) {
        if (item.variance >= 0) continue // Skip non-consumed items

        const productId = item.productId.toString()
        const cumpData = cumpResults.get(productId)
        const cump = cumpData?.cump || item.unitPriceHT
        const quantityConsumed = Math.abs(item.variance)
        const value = quantityConsumed * cump

        if (productConsumptionMap.has(productId)) {
          const existing = productConsumptionMap.get(productId)!
          existing.totalQuantityConsumed += quantityConsumed
          existing.totalValue += value
          // Recalculate average CUMP
          existing.avgCUMP = existing.totalValue / existing.totalQuantityConsumed
        } else {
          productConsumptionMap.set(productId, {
            productId,
            productName: item.productName,
            totalQuantityConsumed: quantityConsumed,
            avgCUMP: cump,
            totalValue: value,
          })
        }
      }
    }

    // Sort by total value DESC and get top 10
    const topProducts = Array.from(productConsumptionMap.values())
      .sort((a, b) => b.totalValue - a.totalValue)
      .slice(0, 10)
      .map((p, index) => ({
        rank: index + 1,
        productId: p.productId,
        productName: p.productName,
        totalQuantityConsumed: parseFloat(p.totalQuantityConsumed.toFixed(2)),
        avgCUMP: parseFloat(p.avgCUMP.toFixed(2)),
        totalValue: parseFloat(p.totalValue.toFixed(2)),
      }))

    // Calculate total value
    const totalValue = Array.from(productConsumptionMap.values())
      .reduce((sum, p) => sum + p.totalValue, 0)

    // Monthly trend (if whole year)
    const monthlyTrend: { month: number; value: number }[] = []
    if (!month) {
      for (let m = 1; m <= 12; m++) {
        const monthInventories = inventories.filter((inv) => {
          const invDate = new Date(inv.date)
          return invDate.getMonth() + 1 === m
        })

        let monthValue = 0
        for (const inventory of monthInventories) {
          for (const item of inventory.items) {
            if (item.variance < 0) {
              const quantityConsumed = Math.abs(item.variance)
              const cump = productConsumptionMap.get(item.productId.toString())?.avgCUMP || item.unitPriceHT
              monthValue += quantityConsumed * cump
            }
          }
        }

        monthlyTrend.push({ month: m, value: parseFloat(monthValue.toFixed(2)) })
      }
    }

    return successResponse({
      totalValue: parseFloat(totalValue.toFixed(2)),
      topProducts,
      monthlyTrend,
      inventoryCount: inventories.length,
    })
  } catch (error) {
    console.error('[GET /api/inventory/analytics/consumption] Error:', error)
    return errorResponse(
      'Erreur lors du calcul des analytics',
      error instanceof Error ? error.message : undefined,
      500
    )
  }
}
