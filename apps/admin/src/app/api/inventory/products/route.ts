import { NextRequest } from "next/server"
import { requireAuth } from "@/lib/api/auth"
import { successResponse, errorResponse } from "@/lib/api/response"
import { connectMongoose } from "@/lib/mongodb"
import { Product } from "@/models/inventory/product"
import { Supplier } from "@/models/inventory/supplier"
import { getRequiredRoles } from "@/lib/inventory/permissions"
import { transformProductForAPI } from "@/lib/inventory/helpers"
import type { ProductFormData } from "@/types/inventory"

/**
 * GET /api/inventory/products - List all products with optional filters
 * Query params: ?search=xxx&category=food&supplierId=xxx&lowStock=true
 * Auth: requireAuth(['admin', 'staff', 'dev'])
 */
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Auth check
    const authResult = await requireAuth(getRequiredRoles('viewProducts'))
    if (!authResult.authorized) return authResult.response

    // Connect to database
    await connectMongoose()

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const category = searchParams.get('category')
    const supplierId = searchParams.get('supplierId')
    const lowStock = searchParams.get('lowStock')
    const active = searchParams.get('active')

    // Build filter
    interface QueryFilter {
      name?: { $regex: string; $options: string }
      category?: string
      supplierId?: string
      isActive?: boolean
      $expr?: { $lt: [string, string] }
    }

    const filter: QueryFilter = {}

    // Search by name
    if (search) {
      filter.name = { $regex: search, $options: 'i' }
    }

    // Filter by category
    if (category && (category === 'food' || category === 'cleaning')) {
      filter.category = category
    }

    // Filter by supplier
    if (supplierId) {
      filter.supplierId = supplierId
    }

    // Filter by active status
    if (active !== null && active !== undefined) {
      filter.isActive = active === 'true'
    }

    // Filter by low stock (currentStock < minStock)
    if (lowStock === 'true') {
      filter.$expr = { $lt: ['$currentStock', '$minStock'] }
    }

    // Fetch products with supplier info
    const products = await Product.find(filter)
      .populate('supplierId', 'name')
      .sort({ name: 1 })
      .lean()

    // Transform dates to strings and populate supplier name
    const transformedProducts = products.map((product: {
      [key: string]: unknown
    }) => transformProductForAPI(product))

    return successResponse(transformedProducts)
  } catch (error) {
    console.error('[GET /api/inventory/products] Error:', error)
    return errorResponse(
      'Erreur lors de la récupération des produits',
      error instanceof Error ? error.message : undefined,
      500
    )
  }
}

/**
 * POST /api/inventory/products - Create a new product
 * Body: ProductFormData
 * Auth: requireAuth(['admin', 'dev'])
 */
export async function POST(request: NextRequest) {
  try {
    // Auth check - Only admin and dev can create
    const authResult = await requireAuth(getRequiredRoles('manageProducts'))
    if (!authResult.authorized) return authResult.response

    // Connect to database
    await connectMongoose()

    // Parse and validate body
    const body = (await request.json()) as ProductFormData

    // Validate required fields
    if (!body.name || !body.category || !body.unit || !body.supplierId) {
      return errorResponse('Champs requis manquants', undefined, 400)
    }

    if (body.unitPriceHT <= 0) {
      return errorResponse('Le prix doit être supérieur à 0', undefined, 400)
    }

    if (body.minStock >= body.maxStock) {
      return errorResponse(
        'Le stock minimum doit être inférieur au stock maximum',
        undefined,
        400
      )
    }

    // Check if supplier exists
    const supplier = await Supplier.findById(body.supplierId)
    if (!supplier) {
      return errorResponse('Fournisseur introuvable', undefined, 404)
    }

    // Create new product
    const newProduct = await Product.create({
      name: body.name,
      category: body.category,
      unit: body.unit,
      unitPriceHT: body.unitPriceHT,
      vatRate: body.vatRate,
      supplierId: body.supplierId,
      supplierName: supplier.name,
      minStock: body.minStock,
      maxStock: body.maxStock,
      currentStock: 0, // Start with 0, will be updated via stock movements
      hasShortDLC: body.hasShortDLC || false,
      isActive: true,
    })

    // Populate supplier info
    await newProduct.populate('supplierId', 'name')

    // Transform dates to strings
    const transformedProduct = {
      ...newProduct.toObject(),
      _id: newProduct._id.toString(),
      supplierId: newProduct.supplierId.toString(),
      createdAt: newProduct.createdAt?.toISOString().split('T')[0] || '',
      updatedAt: newProduct.updatedAt?.toISOString().split('T')[0] || '',
    }

    return successResponse(
      transformedProduct,
      'Produit créé avec succès',
      201
    )
  } catch (error) {
    console.error('[POST /api/inventory/products] Error:', error)
    return errorResponse(
      'Erreur lors de la création du produit',
      error instanceof Error ? error.message : undefined,
      500
    )
  }
}
