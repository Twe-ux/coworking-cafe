import { NextRequest } from "next/server"
import { requireAuth } from "@/lib/api/auth"
import { successResponse, errorResponse, notFoundResponse } from "@/lib/api/response"
import { toRecord } from "@/lib/api/casting"
import { connectMongoose } from "@/lib/mongodb"
import { DirectPurchase } from "@/models/inventory/directPurchase"
import { Product } from "@/models/inventory/product"
import { StockMovement } from "@/models/inventory/stockMovement"
import { getRequiredRoles } from "@/lib/inventory/permissions"

export const dynamic = 'force-dynamic'

interface RouteParams {
  params: Promise<{ id: string }>
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
 * GET /api/inventory/direct-purchases/[id] - Get a single direct purchase
 * Auth: requireAuth(['dev', 'admin', 'staff'])
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const authResult = await requireAuth(getRequiredRoles('viewDirectPurchases'))
    if (!authResult.authorized) return authResult.response

    await connectMongoose()

    const { id } = await params

    const purchase = await DirectPurchase.findById(id).lean()
    if (!purchase) {
      return notFoundResponse('Achat direct')
    }

    const transformed = transformDirectPurchase(
      toRecord(purchase)
    )

    return successResponse(transformed)
  } catch (error) {
    console.error('[GET /api/inventory/direct-purchases/[id]] Error:', error)
    return errorResponse(
      'Erreur lors de la récupération de l\'achat direct',
      error instanceof Error ? error.message : undefined,
      500
    )
  }
}

/**
 * DELETE /api/inventory/direct-purchases/[id] - Delete a direct purchase
 * Auth: requireAuth(['dev', 'admin'])
 */
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const authResult = await requireAuth(getRequiredRoles('createDirectPurchase'))
    if (!authResult.authorized) return authResult.response

    await connectMongoose()

    const { id } = await params

    const purchase = await DirectPurchase.findByIdAndDelete(id)
    if (!purchase) {
      return notFoundResponse('Achat direct')
    }

    return successResponse({ message: 'Achat direct supprimé avec succès' })
  } catch (error) {
    console.error('[DELETE /api/inventory/direct-purchases/[id]] Error:', error)
    return errorResponse(
      'Erreur lors de la suppression de l\'achat direct',
      error instanceof Error ? error.message : undefined,
      500
    )
  }
}

/**
 * PUT /api/inventory/direct-purchases/[id] - Update a direct purchase
 * Auth: requireAuth(['dev', 'admin'])
 */
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const authResult = await requireAuth(getRequiredRoles('createDirectPurchase'))
    if (!authResult.authorized) return authResult.response

    await connectMongoose()

    const { id } = await params
    const body = await request.json()

    const purchase = await DirectPurchase.findById(id)
    if (!purchase) {
      return notFoundResponse('Achat direct')
    }

    const userId = authResult.session.user?.id || ''

    // Update fields
    if (body.date) purchase.date = body.date
    if (body.invoiceNumber !== undefined) purchase.invoiceNumber = body.invoiceNumber
    if (body.notes !== undefined) purchase.notes = body.notes
    if (body.items) {
      // Save old items to calculate stock differences
      const oldItemsMap = new Map(
        purchase.items.map((item) => [
          item.productId.toString(),
          {
            quantity: item.quantity,
            packagingType: item.packagingType,
            unitsPerPackage: item.unitsPerPackage || 1,
          },
        ])
      )

      // Enrich items with product data from database
      const enrichedItems = await Promise.all(
        body.items.map(async (item: {
          productId: string;
          productName: string;
          quantity: number;
          unitPriceHT: number;
          vatRate: number;
        }) => {
          // Fetch product to get packaging info
          const product = await Product.findById(item.productId)
          if (!product) {
            throw new Error(`Produit ${item.productId} introuvable`)
          }

          const totalHT = Math.round(item.quantity * item.unitPriceHT * 100) / 100
          const totalTTC = Math.round(totalHT * (1 + item.vatRate / 100) * 100) / 100

          return {
            productId: item.productId,
            productName: item.productName,
            quantity: item.quantity,
            packagingType: product.packagingType,
            unitPriceHT: item.unitPriceHT,
            totalHT,
            vatRate: item.vatRate,
            totalTTC,
            ...(product.packagingType === 'pack' && product.unitsPerPackage && {
              unitsPerPackage: product.unitsPerPackage,
            }),
          }
        })
      )

      // Calculate stock adjustments
      const newItemsMap = new Map(
        enrichedItems.map((item) => [
          item.productId,
          {
            quantity: item.quantity,
            packagingType: item.packagingType,
            unitsPerPackage: item.unitsPerPackage || 1,
          },
        ])
      )

      // Process stock adjustments
      const allProductIds = new Set([
        ...oldItemsMap.keys(),
        ...newItemsMap.keys(),
      ])

      for (const productId of allProductIds) {
        const oldItem = oldItemsMap.get(productId)
        const newItem = newItemsMap.get(productId)

        let stockDiff = 0

        if (!oldItem && newItem) {
          // Product added to purchase
          stockDiff =
            newItem.packagingType === 'pack' && newItem.unitsPerPackage > 1
              ? newItem.quantity * newItem.unitsPerPackage
              : newItem.quantity
        } else if (oldItem && !newItem) {
          // Product removed from purchase
          stockDiff =
            oldItem.packagingType === 'pack' && oldItem.unitsPerPackage > 1
              ? -(oldItem.quantity * oldItem.unitsPerPackage)
              : -oldItem.quantity
        } else if (oldItem && newItem) {
          // Product quantity changed
          const oldQtyInUnits =
            oldItem.packagingType === 'pack' && oldItem.unitsPerPackage > 1
              ? oldItem.quantity * oldItem.unitsPerPackage
              : oldItem.quantity

          const newQtyInUnits =
            newItem.packagingType === 'pack' && newItem.unitsPerPackage > 1
              ? newItem.quantity * newItem.unitsPerPackage
              : newItem.quantity

          stockDiff = newQtyInUnits - oldQtyInUnits
        }

        // Apply stock adjustment if needed
        if (stockDiff !== 0) {
          const product = await Product.findById(productId)
          if (product) {
            await Product.findByIdAndUpdate(productId, {
              $inc: { currentStock: stockDiff },
            })

            // Create adjustment stock movement
            await StockMovement.create({
              productId,
              type: 'direct_purchase',
              quantity: stockDiff,
              unitPriceHT:
                newItem?.packagingType === 'pack' && newItem.unitsPerPackage > 1
                  ? (enrichedItems.find((i) => i.productId === productId)
                      ?.unitPriceHT || 0) / newItem.unitsPerPackage
                  : enrichedItems.find((i) => i.productId === productId)
                      ?.unitPriceHT || 0,
              totalValue: Math.abs(stockDiff) * product.unitPriceHT,
              date: new Date(),
              reference: `${purchase.purchaseNumber}-EDIT`,
              notes: `Ajustement achat direct ${purchase.purchaseNumber} - ${product.name}`,
              createdBy: userId,
            })
          }
        }
      }

      purchase.items = enrichedItems
      // Recalculate totals
      purchase.totalHT = Math.round(
        enrichedItems.reduce((sum, item) => sum + item.totalHT, 0) * 100
      ) / 100
      purchase.totalTTC = Math.round(
        enrichedItems.reduce((sum, item) => sum + item.totalTTC, 0) * 100
      ) / 100
    }

    await purchase.save()

    const transformed = transformDirectPurchase(toRecord(purchase.toObject()))

    return successResponse(transformed)
  } catch (error) {
    console.error('[PUT /api/inventory/direct-purchases/[id]] Error:', error)
    return errorResponse(
      'Erreur lors de la modification de l\'achat direct',
      error instanceof Error ? error.message : undefined,
      500
    )
  }
}
