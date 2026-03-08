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
 * Query params: ?search=xxx&category=food&supplierId=xxx&lowStock=true&sortBy=order|name
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
    const ids = searchParams.get('ids') // Comma-separated IDs
    const search = searchParams.get('search')
    const category = searchParams.get('category')
    const supplierId = searchParams.get('supplierId')
    const lowStock = searchParams.get('lowStock')
    const active = searchParams.get('active')
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
    if (!body.name || !body.category || !body.supplierId) {
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

    // Validate packaging coherence and calculate real unit price
    const packagingType = body.packagingType || 'unit'
    const priceType = body.priceType || 'unit'
    const unitsPerPackage = body.unitsPerPackage || 1

    if (packagingType !== 'pack' && unitsPerPackage > 1) {
      return errorResponse(
        'unitsPerPackage doit être 1 quand le conditionnement n\'est pas "pack"',
        undefined,
        400
      )
    }

    // Check if supplier exists
    const supplier = await Supplier.findById(body.supplierId)
    if (!supplier) {
      return errorResponse('Fournisseur introuvable', undefined, 404)
    }

    // Calculate real unit price based on priceType
    let realUnitPriceHT = body.unitPriceHT

    if (priceType === 'pack' && unitsPerPackage > 1) {
      // Price entered is for the whole pack, calculate unit price
      realUnitPriceHT = body.unitPriceHT / unitsPerPackage
    }
    // If priceType === 'unit', realUnitPriceHT is already the unit price

    // Create new product
    const newProduct = await Product.create({
      name: body.name,
      category: body.category,
      unitPriceHT: realUnitPriceHT,
      vatRate: body.vatRate,
      supplierId: body.supplierId,
      supplierName: supplier.name,
      supplierReference: body.supplierReference || '',
      packagingType: body.packagingType || 'unit',
      priceType: body.priceType || 'unit',
      unitsPerPackage: body.unitsPerPackage || 1,
      packageUnit: body.packageUnit,
      packagingDescription: body.packagingDescription || '',
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
