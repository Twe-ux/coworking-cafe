import { NextRequest } from "next/server"
import { requireAuth } from "@/lib/api/auth"
import { successResponse, errorResponse, notFoundResponse } from "@/lib/api/response"
import { toRecord } from "@/lib/api/casting"
import { connectMongoose } from "@/lib/mongodb"
import { InventoryEntry } from "@/models/inventory/inventoryEntry"
import { getRequiredRoles } from "@/lib/inventory/permissions"
import type { UpdateInventoryItemsData } from "@/types/inventory"

export const dynamic = 'force-dynamic'

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * GET /api/inventory/entries/[id] - Get inventory entry detail
 */
export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await requireAuth(getRequiredRoles('viewInventory'))
    if (!authResult.authorized) return authResult.response

    await connectMongoose()

    const { id } = await params
    const entry = await InventoryEntry.findById(id).lean()

    if (!entry) {
      return notFoundResponse('Inventaire')
    }

    // Check if this entry can be unfinalized (only the last finalized inventory)
    let canUnfinalize = false
    if (entry.status === 'finalized') {
      const lastFinalizedInventory = await InventoryEntry.findOne({
        status: 'finalized',
      })
        .sort({ finalizedAt: -1 })
        .lean()

      canUnfinalize = lastFinalizedInventory?._id.toString() === entry._id.toString()
    }

    const transformed = transformEntry(entry as Record<string, unknown>, canUnfinalize)

    return successResponse(transformed)
  } catch (error) {
    console.error('[GET /api/inventory/entries/[id]] Error:', error)

    if (isCastError(error)) {
      return errorResponse('ID inventaire invalide', undefined, 400)
    }

    return errorResponse(
      "Erreur lors de la recuperation de l'inventaire",
      error instanceof Error ? error.message : undefined,
      500
    )
  }
}

/**
 * PUT /api/inventory/entries/[id] - Update item quantities
 * Body: { items: [{ productId: string, actualQuantity: number }] }
 * Auto-calculates variance and varianceValue
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await requireAuth(getRequiredRoles('createInventory'))
    if (!authResult.authorized) return authResult.response

    await connectMongoose()

    const { id } = await params
    const entry = await InventoryEntry.findById(id)

    if (!entry) {
      return notFoundResponse('Inventaire')
    }

    if (entry.status === 'finalized') {
      return errorResponse(
        'Impossible de modifier un inventaire finalise',
        undefined,
        400
      )
    }

    const body = (await request.json()) as UpdateInventoryItemsData

    if (!body.items || !Array.isArray(body.items)) {
      return errorResponse('Liste des items requise', undefined, 400)
    }

    // Update each item's actualQty and recalculate variance
    for (const update of body.items) {
      const item = entry.items.find(
        (i) => i.productId.toString() === update.productId
      )
      if (item) {
        item.actualQty = update.actualQuantity
        item.variance = update.actualQuantity - item.theoreticalQty
        item.varianceValue = item.variance * item.unitPriceHT
      }
    }

    // Recalculate total variance value
    entry.totalVarianceValue = entry.items.reduce(
      (sum, item) => sum + item.varianceValue,
      0
    )

    await entry.save()

    const transformed = transformEntry(toRecord(entry.toObject()))

    return successResponse(transformed, 'Quantites mises a jour')
  } catch (error) {
    console.error('[PUT /api/inventory/entries/[id]] Error:', error)

    if (isCastError(error)) {
      return errorResponse('ID inventaire invalide', undefined, 400)
    }

    return errorResponse(
      'Erreur lors de la mise a jour des quantites',
      error instanceof Error ? error.message : undefined,
      500
    )
  }
}

/**
 * PATCH /api/inventory/entries/[id] - Update metadata (title, type, date)
 * Body: { title?: string, type?: 'monthly' | 'weekly', date?: string }
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await requireAuth(getRequiredRoles('createInventory'))
    if (!authResult.authorized) return authResult.response

    await connectMongoose()

    const { id } = await params
    const entry = await InventoryEntry.findById(id)

    if (!entry) {
      return notFoundResponse('Inventaire')
    }

    if (entry.status === 'finalized') {
      return errorResponse(
        'Impossible de modifier un inventaire finalise',
        undefined,
        400
      )
    }

    const body = (await request.json()) as {
      title?: string
      type?: 'monthly' | 'weekly'
      date?: string
    }

    // Update metadata fields
    if (body.title !== undefined) entry.title = body.title
    if (body.type !== undefined) entry.type = body.type
    if (body.date !== undefined) entry.date = new Date(body.date)

    await entry.save()

    const transformed = transformEntry(toRecord(entry.toObject()))

    return successResponse(transformed, 'Metadonnees mises a jour')
  } catch (error) {
    console.error('[PATCH /api/inventory/entries/[id]] Error:', error)

    if (isCastError(error)) {
      return errorResponse('ID inventaire invalide', undefined, 400)
    }

    return errorResponse(
      'Erreur lors de la mise a jour des metadonnees',
      error instanceof Error ? error.message : undefined,
      500
    )
  }
}

/**
 * DELETE /api/inventory/entries/[id] - Delete a draft entry
 */
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await requireAuth(getRequiredRoles('createInventory'))
    if (!authResult.authorized) return authResult.response

    await connectMongoose()

    const { id } = await params
    const entry = await InventoryEntry.findById(id)

    if (!entry) {
      return notFoundResponse('Inventaire')
    }

    if (entry.status === 'finalized') {
      return errorResponse(
        'Impossible de supprimer un inventaire finalise',
        undefined,
        400
      )
    }

    await InventoryEntry.findByIdAndDelete(id)

    return successResponse({ deleted: true }, 'Inventaire supprime')
  } catch (error) {
    console.error('[DELETE /api/inventory/entries/[id]] Error:', error)

    if (isCastError(error)) {
      return errorResponse('ID inventaire invalide', undefined, 400)
    }

    return errorResponse(
      "Erreur lors de la suppression de l'inventaire",
      error instanceof Error ? error.message : undefined,
      500
    )
  }
}

// Helper: Check if error is a CastError (invalid MongoDB ID)
function isCastError(error: unknown): boolean {
  return (
    error !== null &&
    typeof error === 'object' &&
    'name' in error &&
    (error as { name: string }).name === 'CastError'
  )
}

// Transform DB document to API response format
function transformEntry(entry: Record<string, unknown>, canUnfinalize = false) {
  const date = entry.date as Date | undefined
  const finalizedAt = entry.finalizedAt as Date | undefined
  const createdAt = entry.createdAt as Date | undefined
  const updatedAt = entry.updatedAt as Date | undefined
  const items = (entry.items || []) as Array<Record<string, unknown>>

  return {
    ...entry,
    _id: (entry._id as { toString(): string }).toString(),
    date: date instanceof Date ? date.toISOString().split('T')[0] : String(date || ''),
    finalizedAt: finalizedAt instanceof Date
      ? finalizedAt.toISOString().split('T')[0]
      : undefined,
    createdAt: createdAt instanceof Date ? createdAt.toISOString().split('T')[0] : '',
    updatedAt: updatedAt instanceof Date ? updatedAt.toISOString().split('T')[0] : '',
    items: items.map((item) => ({
      ...item,
      productId: (item.productId as { toString(): string })?.toString() || '',
    })),
    canUnfinalize,
  }
}
