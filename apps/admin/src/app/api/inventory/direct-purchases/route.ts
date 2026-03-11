import { NextRequest } from "next/server"
import { z } from "zod"
import { requireAuth } from "@/lib/api/auth"
import { successResponse, errorResponse } from "@/lib/api/response"
import { toRecord } from "@/lib/api/casting"
import { connectMongoose } from "@/lib/mongodb"
import { DirectPurchase } from "@/models/inventory/directPurchase"
import { Product } from "@/models/inventory/product"
import { StockMovement } from "@/models/inventory/stockMovement"
import { getRequiredRoles } from "@/lib/inventory/permissions"
import { directPurchaseSchema, formatZodError } from "@/lib/inventory/validation"

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
      transformDirectPurchase(toRecord(p))
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
    const body = await request.json()

    let validated: z.infer<typeof directPurchaseSchema>
    try {
      validated = directPurchaseSchema.parse(body)
    } catch (err) {
      if (err instanceof z.ZodError) {
        return errorResponse('Validation échouée', formatZodError(err), 400)
      }
      throw err
    }

    const purchaseNumber = await generatePurchaseNumber(validated.date)

    console.log(`[POST /api/inventory/direct-purchases] Creating ${purchaseNumber}:`, {
      supplier: validated.supplier,
      itemCount: validated.items.length,
      date: validated.date,
    })

    // Process each item
    const processedItems = await Promise.all(
      validated.items.map(async (item) => {
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
          date: new Date(validated.date),
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
      supplier: validated.supplier.trim(),
      items: processedItems,
      totalHT,
      totalTTC,
      date: new Date(validated.date),
      invoiceNumber: validated.invoiceNumber?.trim() || undefined,
      notes: validated.notes?.trim() || undefined,
      createdBy: userId,
    })

    console.log(`[POST /api/inventory/direct-purchases] Created:`, {
      purchaseNumber,
      totalHT,
      totalTTC,
      itemCount: processedItems.length,
    })

    const transformed = transformDirectPurchase(
      toRecord(directPurchase.toObject())
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
