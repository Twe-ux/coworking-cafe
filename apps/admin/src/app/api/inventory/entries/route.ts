import { NextRequest } from "next/server"
import { z } from "zod"
import { requireAuth } from "@/lib/api/auth"
import { successResponse, errorResponse } from "@/lib/api/response"
import { connectMongoose } from "@/lib/mongodb"
import { InventoryEntry } from "@/models/inventory/inventoryEntry"
import { Product } from "@/models/inventory/product"
import { getRequiredRoles } from "@/lib/inventory/permissions"
import { inventoryEntryCreateSchema, formatZodError } from "@/lib/inventory/validation"

export const dynamic = 'force-dynamic'

/**
 * GET /api/inventory/entries - List inventory entries with optional filters
 * Query: ?status=draft|finalized&type=monthly|weekly&startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(getRequiredRoles('viewInventory'))
    if (!authResult.authorized) return authResult.response

    await connectMongoose()

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const type = searchParams.get('type')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    interface QueryFilter {
      status?: string
      type?: string
      date?: { $gte?: Date; $lte?: Date }
    }

    const filter: QueryFilter = {}

    if (status === 'draft' || status === 'finalized') {
      filter.status = status
    }

    if (type === 'monthly' || type === 'weekly') {
      filter.type = type
    }

    if (startDate || endDate) {
      filter.date = {}
      if (startDate) filter.date.$gte = new Date(startDate)
      if (endDate) filter.date.$lte = new Date(endDate)
    }

    const entries = await InventoryEntry.find(filter)
      .sort({ date: -1 })
      .lean()

    const transformedEntries = (entries as Array<Record<string, unknown>>).map(
      (entry) => transformEntry(entry)
    )

    return successResponse(transformedEntries)
  } catch (error) {
    console.error('[GET /api/inventory/entries] Error:', error)
    return errorResponse(
      'Erreur lors de la recuperation des inventaires',
      error instanceof Error ? error.message : undefined,
      500
    )
  }
}

/**
 * POST /api/inventory/entries - Create a new inventory session (draft)
 * Body: { type: "monthly" | "weekly", date: "YYYY-MM-DD" }
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(getRequiredRoles('createInventory'))
    if (!authResult.authorized) return authResult.response

    await connectMongoose()

    const body = await request.json()

    let validated: z.infer<typeof inventoryEntryCreateSchema>
    try {
      validated = inventoryEntryCreateSchema.parse(body)
    } catch (err) {
      if (err instanceof z.ZodError) {
        return errorResponse('Validation échouée', formatZodError(err), 400)
      }
      throw err
    }

    // Prevent duplicate drafts for same date
    const existingDraft = await InventoryEntry.findOne({
      date: new Date(validated.date),
      status: 'draft',
    })

    if (existingDraft) {
      return errorResponse(
        'Un inventaire en brouillon existe deja pour cette date',
        undefined,
        409
      )
    }

    // Fetch products: monthly = all active, weekly = short DLC only
    const productFilter: { isActive: boolean; hasShortDLC?: boolean } = {
      isActive: true,
    }
    if (validated.type === 'weekly') {
      productFilter.hasShortDLC = true
    }

    const products = await Product.find(productFilter)
      .sort({ category: 1, name: 1 })
      .lean()

    if (products.length === 0) {
      return errorResponse(
        "Aucun produit actif trouve pour ce type d'inventaire",
        undefined,
        400
      )
    }

    // Pre-fill items with currentStock as theoretical quantity
    const items = (products as Array<Record<string, unknown>>).map((p) => ({
      productId: (p._id as { toString(): string }).toString(),
      productName: (p.name as string) || '',
      theoreticalQty: (p.currentStock as number) || 0,
      actualQty: 0,
      variance: 0,
      varianceValue: 0,
      unitPriceHT: (p.unitPriceHT as number) || 0,
    }))

    const newEntry = await InventoryEntry.create({
      date: new Date(validated.date),
      type: validated.type,
      title: validated.title || undefined,
      items,
      totalVarianceValue: 0,
      createdBy: authResult.session.user?.id || '',
      staffName: authResult.session.user?.name || '',
      taskId: validated.taskId || undefined,
      status: 'draft',
    })

    const transformed = transformEntry({
      ...newEntry.toObject(),
    })

    return successResponse(transformed, 'Inventaire cree avec succes', 201)
  } catch (error) {
    console.error('[POST /api/inventory/entries] Error:', error)
    return errorResponse(
      "Erreur lors de la creation de l'inventaire",
      error instanceof Error ? error.message : undefined,
      500
    )
  }
}

// Transform DB document to API response format
function transformEntry(entry: Record<string, unknown>) {
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
  }
}
