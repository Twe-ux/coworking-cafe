import { NextRequest } from "next/server"
import { z } from "zod"
import { requireAuth } from "@/lib/api/auth"
import {
  successResponse,
  errorResponse,
  notFoundResponse,
} from "@/lib/api/response"
import { connectMongoose } from "@/lib/mongodb"
import { Product } from "@/models/inventory/product"
import { PurchaseOrder } from "@/models/inventory/purchaseOrder"
import { InventoryEntry } from "@/models/inventory/inventoryEntry"
import { Supplier } from "@/models/inventory/supplier"
import { getRequiredRoles } from "@/lib/inventory/permissions"
import { transformProductForAPI } from "@/lib/inventory/helpers"
import { productUpdateSchema, formatZodError } from "@/lib/inventory/validation"

export const dynamic = 'force-dynamic'

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * GET /api/inventory/products/[id] - Get a single product by ID
 * Auth: requireAuth(['admin', 'staff', 'dev'])
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    // Auth check
    const authResult = await requireAuth(getRequiredRoles('viewProducts'))
    if (!authResult.authorized) return authResult.response

    // Connect to database
    await connectMongoose()

    const { id } = await params

    // Fetch product with supplier info
    const product = await Product.findById(id)
      .populate('supplierId', 'name')
      .lean()

    if (!product) {
      return notFoundResponse('Produit')
    }

    // Transform dates to strings
    const transformedProduct = transformProductForAPI(product)

    return successResponse(transformedProduct)
  } catch (error) {
    const { id } = await params
    console.error(`[GET /api/inventory/products/${id}] Error:`, error)
    return errorResponse(
      'Erreur lors de la récupération du produit',
      error instanceof Error ? error.message : undefined,
      500
    )
  }
}

/**
 * PUT /api/inventory/products/[id] - Update a product
 * Body: Partial<ProductFormData>
 * Auth: requireAuth(['admin', 'dev'])
 */
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    // Auth check - Only admin and dev can update
    const authResult = await requireAuth(getRequiredRoles('manageProducts'))
    if (!authResult.authorized) return authResult.response

    // Connect to database
    await connectMongoose()

    const { id } = await params

    // Parse and validate body
    const body = await request.json()

    let validated: z.infer<typeof productUpdateSchema>
    try {
      validated = productUpdateSchema.parse(body)
    } catch (err) {
      if (err instanceof z.ZodError) {
        return errorResponse('Validation échouée', formatZodError(err), 400)
      }
      throw err
    }

    // Check if product exists
    const existingProduct = await Product.findById(id)
    if (!existingProduct) {
      return notFoundResponse('Produit')
    }

    // Check supplier's stock management requirement
    const supplierId = validated.supplierId ?? existingProduct.supplierId
    const supplier = await Supplier.findById(supplierId)
    if (!supplier) {
      return errorResponse('Fournisseur introuvable', undefined, 404)
    }
    const requiresStockManagement = supplier.requiresStockManagement ?? true

    // Validate stock thresholds if required
    const minStock = validated.minStock ?? existingProduct.minStock
    const maxStock = validated.maxStock ?? existingProduct.maxStock

    if (requiresStockManagement && minStock >= maxStock) {
      return errorResponse(
        'Le stock minimum doit être inférieur au stock maximum',
        undefined,
        400
      )
    }

    // Validate packaging coherence
    const packagingType = validated.packagingType ?? existingProduct.packagingType ?? 'unit'
    const unitsPerPkg = validated.unitsPerPackage ?? existingProduct.unitsPerPackage ?? 1
    if (packagingType !== 'pack' && unitsPerPkg > 1) {
      return errorResponse(
        'unitsPerPackage doit être 1 quand le conditionnement n\'est pas "pack"',
        undefined,
        400
      )
    }

    // Update supplier name if supplier changed
    let supplierName = existingProduct.supplierName
    if (validated.supplierId && validated.supplierId !== existingProduct.supplierId.toString()) {
      supplierName = supplier.name
    }

    // Calculate real unit price based on priceType if price is being updated
    let realUnitPriceHT: number | undefined = undefined
    if (validated.unitPriceHT !== undefined) {
      const priceType = validated.priceType ?? existingProduct.priceType ?? 'unit'
      const unitsPerPackage = validated.unitsPerPackage ?? existingProduct.unitsPerPackage ?? 1

      if (priceType === 'pack' && unitsPerPackage > 1) {
        realUnitPriceHT = validated.unitPriceHT / unitsPerPackage
      } else {
        realUnitPriceHT = validated.unitPriceHT
      }
    }

    // Build update fields from validated data
    const updateFields: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(validated)) {
      if (value !== undefined && key !== 'unitPriceHT') {
        updateFields[key] = value
      }
    }
    if (realUnitPriceHT !== undefined) {
      updateFields.unitPriceHT = realUnitPriceHT
    }
    if (validated.supplierId) {
      updateFields.supplierName = supplierName
    }

    // Update product
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true, runValidators: true }
    )
      .populate('supplierId', 'name')
      .lean()

    if (!updatedProduct) {
      return notFoundResponse('Produit')
    }

    // Transform dates to strings
    const transformedProduct = transformProductForAPI(updatedProduct)

    return successResponse(
      transformedProduct,
      'Produit mis à jour avec succès'
    )
  } catch (error) {
    const { id } = await params
    console.error(`[PUT /api/inventory/products/${id}] Error:`, error)
    return errorResponse(
      'Erreur lors de la mise à jour du produit',
      error instanceof Error ? error.message : undefined,
      500
    )
  }
}

/**
 * DELETE /api/inventory/products/[id] - Soft delete a product (set isActive = false)
 * Auth: requireAuth(['admin', 'dev'])
 */
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    // Auth check - Only admin and dev can delete
    const authResult = await requireAuth(getRequiredRoles('manageProducts'))
    if (!authResult.authorized) return authResult.response

    // Connect to database
    await connectMongoose()

    const { id } = await params

    // Check if product exists
    const existingProduct = await Product.findById(id)
    if (!existingProduct) {
      return notFoundResponse('Produit')
    }

    // Check usage in orders and inventory entries
    const [orderCount, inventoryCount] = await Promise.all([
      PurchaseOrder.countDocuments({ 'items.productId': id }),
      InventoryEntry.countDocuments({ 'items.productId': id }),
    ])

    // Soft delete - set isActive to false
    await Product.findByIdAndUpdate(id, {
      $set: { isActive: false },
    })

    const warnings: string[] = []
    if (orderCount > 0) {
      warnings.push(`Produit référencé dans ${orderCount} commande(s)`)
    }
    if (inventoryCount > 0) {
      warnings.push(`Produit référencé dans ${inventoryCount} inventaire(s)`)
    }

    return successResponse(
      {
        message: 'Produit désactivé avec succès',
        ...(warnings.length > 0 && { warnings }),
      },
      'Produit désactivé avec succès'
    )
  } catch (error) {
    const { id } = await params
    console.error(
      `[DELETE /api/inventory/products/${id}] Error:`,
      error
    )
    return errorResponse(
      'Erreur lors de la suppression du produit',
      error instanceof Error ? error.message : undefined,
      500
    )
  }
}
