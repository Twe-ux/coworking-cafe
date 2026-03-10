import { NextRequest } from "next/server"
import { requireAuth } from "@/lib/api/auth"
import { successResponse, errorResponse } from "@/lib/api/response"
import { connectMongoose } from "@/lib/mongodb"
import { DirectPurchase } from "@/models/inventory/directPurchase"
import { Product } from "@/models/inventory/product"
import { StockMovement } from "@/models/inventory/stockMovement"
import { getRequiredRoles } from "@/lib/inventory/permissions"
import type { CreateDirectPurchaseData } from "@/types/inventory"

export const dynamic = 'force-dynamic'

/**
 * Generate a unique purchase number: DP-YYYYMMDD-XXX
 */
async function generatePurchaseNumber(date: string): Promise<string> {
  const dateStr = date.replace(/-/g, '')
  const prefix = `DP-${dateStr}`

  const lastPurchase = await DirectPurchase.findOne({
    purchaseNumber: { $regex: `^${prefix}` },
  })
    .sort({ purchaseNumber: -1 })
    .lean()

  let sequence = 1
  if (lastPurchase) {
    const lastSeq = parseInt(lastPurchase.purchaseNumber.split('-')[2], 10)
    if (!isNaN(lastSeq)) {
      sequence = lastSeq + 1
    }
  }

  return `${prefix}-${String(sequence).padStart(3, '0')}`
}

function transformDirectPurchase(doc: Record<string, unknown>) {
  const d = doc as Record<string, unknown> & {
    _id: { toString: () => string }
    date?: Date
    createdAt?: Date
    updatedAt?: Date
  }
  return {
    ...d,
    _id: d._id.toString(),
    date: d.date instanceof Date ? d.date.toISOString().split('T')[0] : d.date,
    createdAt: d.createdAt instanceof Date
      ? d.createdAt.toISOString()
      : d.createdAt,
    updatedAt: d.updatedAt instanceof Date
      ? d.updatedAt.toISOString()
      : d.updatedAt,
  }
}

/**
 * GET /api/inventory/direct-purchases - List direct purchases
 * Auth: requireAuth(['dev', 'admin', 'staff'])
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(getRequiredRoles('viewDirectPurchases'))
    if (!authResult.authorized) return authResult.response

    await connectMongoose()

    const purchases = await DirectPurchase.find()
      .sort({ date: -1, createdAt: -1 })
      .lean()

    const transformed = purchases.map((p) =>
      transformDirectPurchase(p as unknown as Record<string, unknown>)
    )

    return successResponse(transformed)
  } catch (error) {
    console.error('[GET /api/inventory/direct-purchases] Error:', error)
    return errorResponse(
      'Erreur lors de la récupération des achats directs',
      error instanceof Error ? error.message : undefined,
      500
    )
  }
}

/**
 * POST /api/inventory/direct-purchases - Create a direct purchase
 * Auth: requireAuth(['dev', 'admin'])
 *
 * Creates the DirectPurchase, StockMovements, and updates product stock.
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(getRequiredRoles('createDirectPurchase'))
    if (!authResult.authorized) return authResult.response

    await connectMongoose()

    const userId = authResult.session.user?.id || ''
    const body = (await request.json()) as CreateDirectPurchaseData

    // Validate required fields
    if (!body.supplier || !body.supplier.trim()) {
      return errorResponse('Le nom du fournisseur est requis', undefined, 400)
    }
    if (!body.date || !/^\d{4}-\d{2}-\d{2}$/.test(body.date)) {
      return errorResponse('Date requise au format YYYY-MM-DD', undefined, 400)
    }
    if (!body.items || body.items.length === 0) {
      return errorResponse('Au moins un article est requis', undefined, 400)
    }

    const purchaseNumber = await generatePurchaseNumber(body.date)

    console.log(`[POST /api/inventory/direct-purchases] Creating ${purchaseNumber}:`, {
      supplier: body.supplier,
      itemCount: body.items.length,
      date: body.date,
    })

    // Process each item
    const processedItems = await Promise.all(
      body.items.map(async (item) => {
        const product = await Product.findById(item.productId)
        if (!product) {
          throw new Error(`Produit ${item.productId} introuvable`)
        }

        // Calculate pricing
        const unitPriceHT = item.unitPriceHT
        const totalHT = Math.round(item.quantity * unitPriceHT * 100) / 100
        const totalTTC = Math.round(totalHT * (1 + product.vatRate / 100) * 100) / 100

        // Convert to units for stock (if pack, multiply by unitsPerPackage)
        const quantityInUnits =
          product.packagingType === 'pack' && product.unitsPerPackage
            ? item.quantity * product.unitsPerPackage
            : item.quantity

        // Unit price for stock movement (price per unit)
        const unitPriceHTForMovement =
          product.packagingType === 'pack' && product.unitsPerPackage
            ? unitPriceHT / product.unitsPerPackage
            : unitPriceHT

        // Create StockMovement (positive = stock increase)
        await StockMovement.create({
          productId: item.productId,
          type: 'direct_purchase',
          quantity: quantityInUnits,
          unitPriceHT: unitPriceHTForMovement,
          totalValue: totalHT,
          date: new Date(body.date),
          reference: purchaseNumber,
          notes: `Achat direct ${purchaseNumber} - ${product.name}`,
          createdBy: userId,
        })

        // Update product stock
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { currentStock: quantityInUnits },
        })

        return {
          productId: product._id,
          productName: product.name,
          quantity: item.quantity,
          packagingType: product.packagingType,
          unitPriceHT,
          totalHT,
          vatRate: product.vatRate,
          totalTTC,
          unitsPerPackage: product.packagingType === 'pack'
            ? product.unitsPerPackage
            : undefined,
        }
      })
    )

    // Calculate totals
    const totalHT = Math.round(
      processedItems.reduce((sum, item) => sum + item.totalHT, 0) * 100
    ) / 100
    const totalTTC = Math.round(
      processedItems.reduce((sum, item) => sum + item.totalTTC, 0) * 100
    ) / 100

    // Create DirectPurchase document
    const directPurchase = await DirectPurchase.create({
      purchaseNumber,
      supplier: body.supplier.trim(),
      items: processedItems,
      totalHT,
      totalTTC,
      date: new Date(body.date),
      invoiceNumber: body.invoiceNumber?.trim() || undefined,
      notes: body.notes?.trim() || undefined,
      createdBy: userId,
    })

    console.log(`[POST /api/inventory/direct-purchases] Created:`, {
      purchaseNumber,
      totalHT,
      totalTTC,
      itemCount: processedItems.length,
    })

    const transformed = transformDirectPurchase(
      directPurchase.toObject() as unknown as Record<string, unknown>
    )

    return successResponse(transformed, 'Achat direct créé avec succès', 201)
  } catch (error) {
    console.error('[POST /api/inventory/direct-purchases] Error:', error)
    return errorResponse(
      'Erreur lors de la création de l\'achat direct',
      error instanceof Error ? error.message : undefined,
      500
    )
  }
}
