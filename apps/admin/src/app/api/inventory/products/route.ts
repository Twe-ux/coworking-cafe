import { NextRequest } from "next/server"
import { z } from "zod"
import { requireAuth } from "@/lib/api/auth"
import { successResponse, errorResponse } from "@/lib/api/response"
import { connectMongoose } from "@/lib/mongodb"
import { Product } from "@/models/inventory/product"
import { Supplier } from "@/models/inventory/supplier"
import { getRequiredRoles } from "@/lib/inventory/permissions"
import { transformProductForAPI } from "@/lib/inventory/helpers"
import { productCreateSchema, formatZodError } from "@/lib/inventory/validation"

/**
 * GET /api/inventory/products - List all products with optional filters
 * Query params: ?search=xxx&category=food&supplierId=xxx&lowStock=true&sortBy=order|name
 * Auth: requireAuth(['admin', 'staff', 'dev'])
 */
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Parse query parameters first
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const active = searchParams.get('active')

    // Public access for simple search (for out-of-stock widget)
    // Only requires search param and active=true
    const isPublicSearch = search && active === 'true'

    // Auth check - skip for public search
    let isAuthenticated = false
    if (!isPublicSearch) {
      const authResult = await requireAuth(getRequiredRoles('viewProducts'))
      if (!authResult.authorized) return authResult.response
      isAuthenticated = true
    }

    // Connect to database
    await connectMongoose()

    // Parse remaining query parameters
    const ids = searchParams.get('ids') // Comma-separated IDs
    const category = searchParams.get('category')
    const supplierId = searchParams.get('supplierId')
    const lowStock = searchParams.get('lowStock')
    const sortBy = searchParams.get('sortBy')

    // Build filter
    const filter: Record<string, unknown> = {}

    // Filter by IDs (for fetching specific products)
    if (ids) {
      const idArray = ids.split(',').filter(Boolean)
      filter._id = { $in: idArray }
    }

    // Search by name
    if (search) {
      filter.name = { $regex: search, $options: 'i' }
    }

    // Filter by category
    const validCategories = ['food', 'cleaning', 'emballage', 'papeterie', 'divers']
    if (category && validCategories.includes(category)) {
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

    // Filter by low stock: accounts for minStockUnit (package vs unit)
    if (lowStock === 'true') {
      filter.$expr = {
        $lt: [
          '$currentStock',
          {
            $cond: {
              if: { $eq: ['$minStockUnit', 'package'] },
              then: { $multiply: ['$minStock', { $ifNull: ['$unitsPerPackage', 1] }] },
              else: '$minStock',
            },
          },
        ],
      }
    }

    // Build sort order
    const sortOrder: Record<string, 1 | -1> = sortBy === 'order'
      ? { order: 1, name: 1 }
      : { name: 1 }

    // Fetch products with supplier info
    const products = await Product.find(filter)
      .populate('supplierId', 'name')
      .sort(sortOrder)
      .lean()

    // Transform products based on authentication status
    let transformedProducts
    if (isPublicSearch) {
      // Public access: return only basic info (no prices, no supplier details)
      transformedProducts = products.map((product: {
        [key: string]: unknown
      }) => ({
        _id: product._id?.toString() || '',
        name: product.name || '',
        currentStock: product.currentStock || 0,
        category: product.category || '',
      }))
    } else {
      // Authenticated access: return full details
      transformedProducts = products.map((product: {
        [key: string]: unknown
      }) => transformProductForAPI(product))
    }

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
    const body = await request.json()

    let validated: z.infer<typeof productCreateSchema>
    try {
      validated = productCreateSchema.parse(body)
    } catch (err) {
      if (err instanceof z.ZodError) {
        return errorResponse('Validation échouée', formatZodError(err), 400)
      }
      throw err
    }

    // Validate packaging coherence
    const packagingType = validated.packagingType
    const priceType = validated.priceType
    const unitsPerPackage = validated.unitsPerPackage

    if (packagingType !== 'pack' && unitsPerPackage > 1) {
      return errorResponse(
        'unitsPerPackage doit être 1 quand le conditionnement n\'est pas "pack"',
        undefined,
        400
      )
    }

    // Check if supplier exists
    const supplier = await Supplier.findById(validated.supplierId)
    if (!supplier) {
      return errorResponse('Fournisseur introuvable', undefined, 404)
    }

    // Check if supplier requires stock management
    const requiresStockManagement = supplier.requiresStockManagement ?? true

    // Validate stock fields if required
    if (requiresStockManagement) {
      if (validated.minStock === undefined || validated.maxStock === undefined) {
        return errorResponse(
          'Stock min et max requis pour ce fournisseur',
          undefined,
          400
        )
      }
      if (validated.minStock >= validated.maxStock) {
        return errorResponse(
          'Le stock minimum doit être inférieur au stock maximum',
          undefined,
          400
        )
      }
    }

    // Calculate real unit price based on priceType
    let realUnitPriceHT = validated.unitPriceHT

    if (priceType === 'pack' && unitsPerPackage > 1) {
      realUnitPriceHT = validated.unitPriceHT / unitsPerPackage
    }

    // Set stock values (0 if not required)
    const minStock = requiresStockManagement ? validated.minStock! : 0
    const maxStock = requiresStockManagement ? validated.maxStock! : 0

    // Create new product
    const newProduct = await Product.create({
      ...validated,
      unitPriceHT: realUnitPriceHT,
      supplierName: supplier.name,
      supplierReference: validated.supplierReference || '',
      packagingDescription: validated.packagingDescription || '',
      minStock,
      maxStock,
      currentStock: 0,
      hasShortDLC: validated.hasShortDLC || false,
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
