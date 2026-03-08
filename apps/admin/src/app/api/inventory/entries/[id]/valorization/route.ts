import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/api/auth'
import { successResponse, errorResponse } from '@/lib/api/response'
import { connectMongoose } from '@/lib/mongodb'
import { InventoryEntry } from '@/models/inventory/inventoryEntry'
import { calculateCUMPBatch } from '@/lib/inventory/cumpCalculator'
import { getRequiredRoles } from '@/lib/inventory/permissions'

export const dynamic = 'force-dynamic'

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * GET /api/inventory/entries/[id]/valorization
 * Calculate valorization for a finalized inventory
 * Returns stock final value + consumption value + total
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await requireAuth(getRequiredRoles('viewInventory'))
    if (!authResult.authorized) return authResult.response

    await connectMongoose()

    const { id } = await params

    // Fetch inventory entry
    const entry = await InventoryEntry.findById(id).lean()
    if (!entry) {
      return errorResponse('Inventaire introuvable', undefined, 404)
    }

    if (entry.status !== 'finalized') {
      return errorResponse('Seuls les inventaires finalisés peuvent être valorisés', undefined, 400)
    }

    // Calculate CUMP for all products in this inventory
    const inventoryDate = new Date(entry.date)
    const monthStart = new Date(inventoryDate.getFullYear(), inventoryDate.getMonth(), 1)
    const monthStartStr = monthStart.toISOString().split('T')[0]
    const dateStr = inventoryDate.toISOString().split('T')[0]

    const productIds = entry.items.map((item) => item.productId.toString())
    const cumpResults = await calculateCUMPBatch(productIds, monthStartStr, dateStr)

    // Calculate valorization
    let stockFinalValue = 0
    let consumptionValue = 0

    for (const item of entry.items) {
      const productId = item.productId.toString()
      const cumpData = cumpResults.get(productId)
      const cump = cumpData?.cump || item.unitPriceHT

      // Stock final = quantity × last unit price
      stockFinalValue += item.actualQty * item.unitPriceHT

      // Consumption = variance (if negative) × CUMP
      if (item.variance < 0) {
        consumptionValue += Math.abs(item.variance) * cump
      }
    }

    const totalValue = stockFinalValue + consumptionValue

    return successResponse({
      stockFinalValue: parseFloat(stockFinalValue.toFixed(2)),
      consumptionValue: parseFloat(consumptionValue.toFixed(2)),
      totalValue: parseFloat(totalValue.toFixed(2)),
      entryId: id,
      entryDate: dateStr,
      entryTitle: entry.title,
    })
  } catch (error) {
    console.error('[GET /api/inventory/entries/[id]/valorization] Error:', error)
    return errorResponse(
      'Erreur lors du calcul de valorisation',
      error instanceof Error ? error.message : undefined,
      500
    )
  }
}
