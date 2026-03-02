import { NextRequest } from "next/server"
import { requireAuth } from "@/lib/api/auth"
import { successResponse, errorResponse } from "@/lib/api/response"
import { connectMongoose } from "@/lib/mongodb"
import { Product } from "@/models/inventory/product"
import { Turnover } from "@/models/turnover"
import { getRequiredRoles } from "@/lib/inventory/permissions"
import type { CARatioStatus } from "@/types/inventory"

export const dynamic = 'force-dynamic'

/**
 * GET /api/inventory/analytics/ca-ratio
 * Returns CA/Stock ratio and rotation rate
 * Query: ?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(getRequiredRoles('viewAnalytics'))
    if (!authResult.authorized) return authResult.response

    await connectMongoose()

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // Default to current month
    const now = new Date()
    const start = startDate || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
    const end = endDate || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`

    // Convert to Turnover _id format YYYY/MM/DD
    const startFormatted = start.replace(/-/g, '/')
    const endFormatted = end.replace(/-/g, '/')

    // Fetch turnovers for period
    const turnovers = await Turnover.find({
      _id: { $gte: startFormatted, $lte: endFormatted },
    }).lean()

    // Calculate total CA TTC
    const ca = turnovers.reduce((sum, t) => {
      const doc = t as Record<string, unknown>
      const vat20 = doc['vat-20'] as { 'total-ttc': number } | undefined
      const vat10 = doc['vat-10'] as { 'total-ttc': number } | undefined
      const vat55 = doc['vat-55'] as { 'total-ttc': number } | undefined
      const vat0 = doc['vat-0'] as { 'total-ttc': number } | undefined

      return sum
        + (vat20?.['total-ttc'] || 0)
        + (vat10?.['total-ttc'] || 0)
        + (vat55?.['total-ttc'] || 0)
        + (vat0?.['total-ttc'] || 0)
    }, 0)

    // Calculate current stock value
    const stockAgg = await Product.aggregate<{ _id: null; total: number }>([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          total: { $sum: { $multiply: ['$currentStock', '$unitPriceHT'] } },
        },
      },
    ])

    const stockValue = stockAgg[0]?.total || 0
    const ratio = stockValue > 0 ? ca / stockValue : 0
    const rotationRate = Math.round(ratio * 10) / 10

    // Determine status
    let status: CARatioStatus = 'good'
    if (rotationRate < 2 || rotationRate > 8) {
      status = 'critical'
    } else if (rotationRate < 3 || rotationRate > 6) {
      status = 'warning'
    }

    return successResponse({
      ca: Math.round(ca * 100) / 100,
      stockValue: Math.round(stockValue * 100) / 100,
      ratio: Math.round(ratio * 100) / 100,
      rotationRate,
      status,
    })
  } catch (error) {
    console.error('[GET /api/inventory/analytics/ca-ratio] Error:', error)
    return errorResponse(
      'Erreur lors du calcul du ratio CA/Stock',
      error instanceof Error ? error.message : undefined,
      500
    )
  }
}
