import { NextRequest } from "next/server"
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
import type { ProductFormData } from "@/types/inventory"

export const dynamic = 'force-dynamic'

/**
 * GET /api/inventory/products/[id] - Get a single product by ID
 * Auth: requireAuth(['admin', 'staff', 'dev'])
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Auth check
    const authResult = await requireAuth(getRequiredRoles('viewProducts'))
    if (!authResult.authorized) return authResult.response

    // Connect to database
    await connectMongoose()

    // Fetch product with supplier info
    const product = await Product.findById(params.id)
      .populate('supplierId', 'name')
      .lean()

    if (!product) {
      return notFoundResponse('Produit')
    }

    // Transform dates to strings
    const transformedProduct = transformProductForAPI(product)

    return successResponse(transformedProduct)
  } catch (error) {
    console.error(`[GET /api/inventory/products/${params.id}] Error:`, error)
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
  { params }: { params: { id: string } }
) {
  try {
    // Auth check - Only admin and dev can update
    const authResult = await requireAuth(getRequiredRoles('manageProducts'))
    if (!authResult.authorized) return authResult.response

    // Connect to database
    await connectMongoose()

    // Parse body (isActive allowed for reactivation)
    const body = (await request.json()) as Partial<ProductFormData> & { isActive?: boolean }

    // Check if product exists
    const existingProduct = await Product.findById(params.id)
    if (!existingProduct) {
      return notFoundResponse('Produit')
    }

    // Validate price if provided
    if (body.unitPriceHT !== undefined && body.unitPriceHT <= 0) {
      return errorResponse('Le prix doit être supérieur à 0', undefined, 400)
    }

    // Validate stock thresholds if provided
    const minStock = body.minStock ?? existingProduct.minStock
    const maxStock = body.maxStock ?? existingProduct.maxStock

    if (minStock >= maxStock) {
      return errorResponse(
        'Le stock minimum doit être inférieur au stock maximum',
        undefined,
        400
      )
    }

    // Validate packaging coherence
    const packagingType = body.packagingType ?? existingProduct.packagingType ?? 'unit'
    const unitsPerPkg = body.unitsPerPackage ?? existingProduct.unitsPerPackage ?? 1
    if (packagingType !== 'pack' && unitsPerPkg > 1) {
      return errorResponse(
        'unitsPerPackage doit être 1 quand le conditionnement n\'est pas "pack"',
        undefined,
        400
      )
    }

    // If supplier is being updated, check it exists and update supplier name
    let supplierName = existingProduct.supplierName
    if (body.supplierId && body.supplierId !== existingProduct.supplierId.toString()) {
      const supplier = await Supplier.findById(body.supplierId)
      if (!supplier) {
        return errorResponse('Fournisseur introuvable', undefined, 404)
      }
      supplierName = supplier.name
    }

    // Update product
    const updatedProduct = await Product.findByIdAndUpdate(
      params.id,
      {
        $set: {
          ...(body.name && { name: body.name }),
          ...(body.category && { category: body.category }),
          ...(body.unit && { unit: body.unit }),
          ...(body.unitPriceHT !== undefined && { unitPriceHT: body.unitPriceHT }),
          ...(body.vatRate !== undefined && { vatRate: body.vatRate }),
          ...(body.supplierId && { supplierId: body.supplierId, supplierName }),
          ...(body.supplierReference !== undefined && { supplierReference: body.supplierReference }),
          ...(body.packagingType && { packagingType: body.packagingType }),
          ...(body.unitsPerPackage !== undefined && { unitsPerPackage: body.unitsPerPackage }),
          ...(body.packagingDescription !== undefined && { packagingDescription: body.packagingDescription }),
          ...(body.minStockUnit && { minStockUnit: body.minStockUnit }),
          ...(body.order !== undefined && { order: body.order }),
          ...(body.minStock !== undefined && { minStock: body.minStock }),
          ...(body.maxStock !== undefined && { maxStock: body.maxStock }),
          ...(body.hasShortDLC !== undefined && { hasShortDLC: body.hasShortDLC }),
          ...(body.isActive !== undefined && { isActive: body.isActive }),
        },
      },
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
    console.error(`[PUT /api/inventory/products/${params.id}] Error:`, error)
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
  { params }: { params: { id: string } }
) {
  try {
    // Auth check - Only admin and dev can delete
    const authResult = await requireAuth(getRequiredRoles('manageProducts'))
    if (!authResult.authorized) return authResult.response

    // Connect to database
    await connectMongoose()

    // Check if product exists
    const existingProduct = await Product.findById(params.id)
    if (!existingProduct) {
      return notFoundResponse('Produit')
    }

    // Check usage in orders and inventory entries
    const [orderCount, inventoryCount] = await Promise.all([
      PurchaseOrder.countDocuments({ 'items.productId': params.id }),
      InventoryEntry.countDocuments({ 'items.productId': params.id }),
    ])

    // Soft delete - set isActive to false
    await Product.findByIdAndUpdate(params.id, {
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
    console.error(
      `[DELETE /api/inventory/products/${params.id}] Error:`,
      error
    )
    return errorResponse(
      'Erreur lors de la suppression du produit',
      error instanceof Error ? error.message : undefined,
      500
    )
  }
}
