import { NextRequest } from "next/server"
import mongoose from "mongoose"
import { requireAuth } from "@/lib/api/auth"
import { successResponse, errorResponse } from "@/lib/api/response"
import { connectMongoose } from "@/lib/mongodb"
import { StockMovement } from "@/models/inventory/stockMovement"
import { getRequiredRoles } from "@/lib/inventory/permissions"
import type { ConsumptionTrendDirection } from "@/types/inventory"

export const dynamic = 'force-dynamic'

interface MonthlyItem {
  _id: { productId: mongoose.Types.ObjectId; month: string }
  productName: string
  totalConsumed: number
  totalValue: number
}

interface TopItem {
  _id: mongoose.Types.ObjectId
  productName: string
  totalConsumed: number
  totalValue: number
}

interface FacetResult {
  monthly: MonthlyItem[]
  topConsumed: TopItem[]
}

/**
 * GET /api/inventory/analytics/consumption-trends
 * Analyzes StockMovements (inventory_adjustment with qty < 0)
 * Uses $facet to run both monthly + top aggregations in a single query.
 * Query: ?months=6&productId=xxx
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(getRequiredRoles('viewAnalytics'))
    if (!authResult.authorized) return authResult.response

    await connectMongoose()

    const { searchParams } = new URL(request.url)
    const months = parseInt(searchParams.get('months') || '6', 10)
    const productId = searchParams.get('productId')

    // Calculate start date
    const startDate = new Date()
    startDate.setMonth(startDate.getMonth() - months)

    // Build match filter for negative adjustments (consumption)
    const match: Record<string, unknown> = {
      type: 'inventory_adjustment',
      quantity: { $lt: 0 },
      date: { $gte: startDate },
    }

    if (productId) {
      match.productId = new mongoose.Types.ObjectId(productId)
    }

    // Single aggregation with $facet for both monthly trends and top consumed
    const lookupStage = {
      $lookup: {
        from: 'products',
        localField: 'productId',
        foreignField: '_id',
        as: 'product',
      },
    }
    const unwindStage = {
      $unwind: { path: '$product', preserveNullAndEmptyArrays: true },
    }

    const [result] = await StockMovement.aggregate<FacetResult>([
      { $match: match },
      lookupStage,
      unwindStage,
      {
        $facet: {
          monthly: [
            {
              $group: {
                _id: {
                  productId: '$productId',
                  month: { $dateToString: { format: '%Y-%m', date: '$date' } },
                },
                productName: { $first: '$product.name' },
                totalConsumed: { $sum: { $abs: '$quantity' } },
                totalValue: {
                  $sum: { $abs: { $multiply: ['$quantity', '$product.unitPriceHT'] } },
                },
              },
            },
            { $sort: { '_id.month': 1 } },
          ],
          topConsumed: [
            {
              $group: {
                _id: '$productId',
                productName: { $first: '$product.name' },
                totalConsumed: { $sum: { $abs: '$quantity' } },
                totalValue: {
                  $sum: { $abs: { $multiply: ['$quantity', '$product.unitPriceHT'] } },
                },
              },
            },
            { $sort: { totalConsumed: -1 } },
            { $limit: 10 },
          ],
        },
      },
    ])

    const { monthly: monthlyData, topConsumed } = result

    // Group by product for trends
    const productMap = new Map<string, {
      productName: string
      data: Array<{ date: string; consumed: number; value: number }>
    }>()

    for (const item of monthlyData) {
      const pid = item._id.productId.toString()
      if (!productMap.has(pid)) {
        productMap.set(pid, {
          productName: item.productName || 'Inconnu',
          data: [],
        })
      }
      productMap.get(pid)!.data.push({
        date: item._id.month,
        consumed: Math.round(item.totalConsumed * 10) / 10,
        value: Math.round(item.totalValue * 100) / 100,
      })
    }

    // Calculate trends
    const trends = Array.from(productMap.entries()).map(([pid, info]) => {
      const data = info.data
      const avgMonthly = data.length > 0
        ? data.reduce((s, d) => s + d.consumed, 0) / data.length
        : 0

      let trend: ConsumptionTrendDirection = 'stable'
      if (data.length >= 2) {
        const first = data[0].consumed
        const last = data[data.length - 1].consumed
        const diff = last - first
        if (diff > first * 0.1) trend = 'up'
        else if (diff < -first * 0.1) trend = 'down'
      }

      return {
        productId: pid,
        productName: info.productName,
        data,
        trend,
        avgMonthly: Math.round(avgMonthly * 10) / 10,
      }
    })

    return successResponse({
      trends,
      topConsumed: topConsumed.map((t) => ({
        productId: t._id.toString(),
        productName: t.productName || 'Inconnu',
        totalConsumed: Math.round(t.totalConsumed * 10) / 10,
        totalValue: Math.round(t.totalValue * 100) / 100,
      })),
    })
  } catch (error) {
    console.error('[GET /api/inventory/analytics/consumption-trends] Error:', error)
    return errorResponse(
      'Erreur lors du calcul des tendances',
      error instanceof Error ? error.message : undefined,
      500
    )
  }
}
