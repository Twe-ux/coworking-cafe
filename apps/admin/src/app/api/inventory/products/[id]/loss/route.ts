import { NextRequest } from "next/server"
import { z } from "zod"
import { requireAuth } from "@/lib/api/auth"
import { successResponse, errorResponse, notFoundResponse } from "@/lib/api/response"
import { connectMongoose } from "@/lib/mongodb"
import { Product } from "@/models/inventory/product"
import { StockMovement } from "@/models/inventory/stockMovement"
import { calculateCUMP } from "@/lib/inventory/cumpCalculator"
import { getRequiredRoles } from "@/lib/inventory/permissions"
import { productLossSchema, formatZodError } from "@/lib/inventory/validation"
import type { LossReason } from "@/types/inventory"

export const dynamic = 'force-dynamic'

interface RouteParams {
  params: Promise<{ id: string }>
}

const VALID_REASONS: LossReason[] = ['expiration', 'damage', 'theft', 'error', 'other']

const REASON_LABELS: Record<LossReason, string> = {
  expiration: 'Expiration DLC',
  damage: 'Dommage/Casse',
  theft: 'Vol',
  error: 'Erreur de stock',
  other: 'Autre',
}

/**
 * POST /api/inventory/products/[id]/loss - Declare a product loss
 * Auth: requireAuth(['dev', 'admin'])
 *
 * Body: { quantity: number, reason: LossReason, notes?: string, date: string }
 *
 * Creates a negative StockMovement (type='loss') and decrements product stock.
 * Uses CUMP for loss valuation.
 */
export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const authResult = await requireAuth(getRequiredRoles('declareLoss'))
    if (!authResult.authorized) return authResult.response

    await connectMongoose()

    const { id } = await params
    const userId = authResult.session.user?.id || ''

    // Parse and validate body
    const body = await request.json()

    let validated: z.infer<typeof productLossSchema>
    try {
      validated = productLossSchema.parse(body)
    } catch (err) {
      if (err instanceof z.ZodError) {
        return errorResponse('Validation échouée', formatZodError(err), 400)
      }
      throw err
    }

    const { quantity, reason, notes, date } = validated

    // Fetch product
    const product = await Product.findById(id)
    if (!product) {
      return notFoundResponse('Produit')
    }

    if (!product.isActive) {
      return errorResponse('Impossible de déclarer une perte sur un produit inactif', undefined, 400)
    }

    // Quantity is always in units
    // If packagingType='pack', frontend sends units already
    const lossQuantity = quantity

    if (lossQuantity > product.currentStock) {
      return errorResponse(
        `Stock insuffisant. Stock actuel : ${product.currentStock}, perte déclarée : ${lossQuantity}`,
        undefined,
        400
      )
    }

    // Calculate CUMP for valuation
    const startOfYear = `${new Date().getFullYear()}-01-01`
    const cumpResult = await calculateCUMP(id, startOfYear, date)
    const unitPriceHT = cumpResult.cump > 0 ? cumpResult.cump : product.unitPriceHT

    const totalValue = Math.round(lossQuantity * unitPriceHT * 100) / 100

    console.log(`[POST /api/inventory/products/${id}/loss] Declaring loss:`, {
      productName: product.name,
      quantity: lossQuantity,
      reason,
      unitPriceHT,
      totalValue,
      cumpUsed: cumpResult.cump > 0,
    })

    // Create negative StockMovement
    const movement = await StockMovement.create({
      productId: id,
      type: 'loss',
      quantity: -lossQuantity,
      unitPriceHT,
      totalValue,
      date: new Date(date),
      reference: `LOSS-${reason.toUpperCase()}`,
      notes: notes
        ? `[${REASON_LABELS[reason]}] ${notes}`
        : `[${REASON_LABELS[reason]}]`,
      createdBy: userId,
    })

    // Decrement product stock
    await Product.findByIdAndUpdate(id, {
      $inc: { currentStock: -lossQuantity },
    })

    console.log(`[POST /api/inventory/products/${id}/loss] Loss recorded:`, {
      movementId: movement._id.toString(),
      newStock: product.currentStock - lossQuantity,
    })

    return successResponse(
      {
        movementId: movement._id.toString(),
        productName: product.name,
        quantity: lossQuantity,
        reason,
        unitPriceHT,
        totalValue,
        newStock: product.currentStock - lossQuantity,
        date,
      },
      'Perte déclarée avec succès',
      201
    )
  } catch (error) {
    console.error('[POST /api/inventory/products/[id]/loss] Error:', error)
    return errorResponse(
      'Erreur lors de la déclaration de perte',
      error instanceof Error ? error.message : undefined,
      500
    )
  }
}
