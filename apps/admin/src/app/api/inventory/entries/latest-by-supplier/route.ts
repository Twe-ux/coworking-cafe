import { NextRequest } from "next/server"
import { requireAuth } from "@/lib/api/auth"
import { successResponse, errorResponse } from "@/lib/api/response"
import { toRecord } from "@/lib/api/casting"
import { connectMongoose } from "@/lib/mongodb"
import { InventoryEntry } from "@/models/inventory/inventoryEntry"
import { getRequiredRoles } from "@/lib/inventory/permissions"

export const dynamic = 'force-dynamic'

/**
 * GET /api/inventory/entries/latest-by-supplier?supplierId=XXX
 *
 * Get the latest finalized inventory entry for a specific supplier
 * Returns the actualQty values to pre-fill real stock in order creation
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(getRequiredRoles('viewInventory'))
    if (!authResult.authorized) return authResult.response

    await connectMongoose()

    const { searchParams } = request.nextUrl
    const supplierId = searchParams.get('supplierId')

    if (!supplierId) {
      return errorResponse('supplierId est requis', undefined, 400)
    }

    // Find the latest finalized inventory
    const latestInventory = await InventoryEntry.findOne({
      status: 'finalized'
    })
      .sort({ finalizedAt: -1 }) // Most recent first
      .limit(1)

    if (!latestInventory) {
      // No finalized inventory found - return empty data
      return successResponse({
        hasInventory: false,
        stockData: {}
      })
    }

    // Extract actualQty for each product from the supplier
    const stockData: Record<string, number> = {}

    for (const item of latestInventory.items) {
      const productId = item.productId.toString()
      // Store actualQty (defaulting to 0 if null/undefined)
      stockData[productId] = item.actualQty ?? 0
    }

    const transformed = {
      hasInventory: true,
      inventoryId: latestInventory._id.toString(),
      inventoryDate: latestInventory.date.toISOString().split('T')[0],
      finalizedAt: latestInventory.finalizedAt?.toISOString().split('T')[0] || '',
      stockData, // { productId: actualQty }
    }

    return successResponse(transformed)
  } catch (error) {
    console.error('[GET /api/inventory/entries/latest-by-supplier] Error:', error)
    return errorResponse(
      "Erreur lors de la récupération de l'inventaire",
      error instanceof Error ? error.message : undefined,
      500
    )
  }
}
