import { NextRequest } from "next/server"
import { requireAuth } from "@/lib/api/auth"
import { successResponse, errorResponse } from "@/lib/api/response"
import { connectMongoose } from "@/lib/mongodb"
import { Supplier } from "@/models/inventory/supplier"
import { getRequiredRoles } from "@/lib/inventory/permissions"
import type { SupplierFormData } from "@/types/inventory"

/**
 * GET /api/inventory/suppliers - List all suppliers with optional filters
 * Query params: ?search=xxx&category=food&active=true
 * Auth: requireAuth(['admin', 'staff'])
 */
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Auth check
    const authResult = await requireAuth(getRequiredRoles('viewSuppliers'))
    if (!authResult.authorized) return authResult.response

    // Connect to database
    await connectMongoose()

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const category = searchParams.get('category')
    const active = searchParams.get('active')

    // Build filter
    interface QueryFilter {
      name?: { $regex: string; $options: string }
      email?: { $regex: string; $options: string }
      categories?: string
      isActive?: boolean
      $or?: Array<{
        name?: { $regex: string; $options: string }
        email?: { $regex: string; $options: string }
      }>
    }

    const filter: QueryFilter = {}

    // Search by name or email
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ]
    }

    // Filter by category
    if (category && (category === 'food' || category === 'cleaning')) {
      filter.categories = category
    }

    // Filter by active status
    if (active !== null && active !== undefined) {
      filter.isActive = active === 'true'
    }

    // Fetch suppliers
    const suppliers = await Supplier.find(filter)
      .sort({ name: 1 })
      .lean()

    // Transform dates to strings
    const transformedSuppliers = suppliers.map((supplier: Record<string, unknown> & {
      _id: { toString: () => string }
      createdAt?: Date
      updatedAt?: Date
    }) => ({
      ...supplier,
      _id: supplier._id.toString(),
      createdAt: supplier.createdAt?.toISOString().split('T')[0] || '',
      updatedAt: supplier.updatedAt?.toISOString().split('T')[0] || '',
    }))

    return successResponse(transformedSuppliers)
  } catch (error) {
    console.error('[GET /api/inventory/suppliers] Error:', error)
    return errorResponse(
      'Erreur lors de la récupération des fournisseurs',
      error instanceof Error ? error.message : undefined,
      500
    )
  }
}

/**
 * POST /api/inventory/suppliers - Create a new supplier
 * Body: SupplierFormData
 * Auth: requireAuth(['admin', 'dev'])
 */
export async function POST(request: NextRequest) {
  try {
    // Auth check - Only admin and dev can create
    const authResult = await requireAuth(getRequiredRoles('manageSuppliers'))
    if (!authResult.authorized) return authResult.response

    // Connect to database
    await connectMongoose()

    // Parse and validate body
    const body = (await request.json()) as SupplierFormData

    // Validate required fields
    if (!body.name || !body.contact || !body.email || !body.phone) {
      return errorResponse('Champs requis manquants', undefined, 400)
    }

    if (!body.categories || body.categories.length === 0) {
      return errorResponse(
        'Au moins une catégorie est requise',
        undefined,
        400
      )
    }

    // Check if supplier with same email already exists
    const existingSupplier = await Supplier.findOne({ email: body.email })
    if (existingSupplier) {
      return errorResponse(
        'Un fournisseur avec cet email existe déjà',
        undefined,
        409
      )
    }

    // Create new supplier
    const newSupplier = await Supplier.create({
      name: body.name,
      contact: body.contact,
      email: body.email,
      phone: body.phone,
      address: body.address,
      categories: body.categories,
      paymentTerms: body.paymentTerms,
      notes: body.notes,
      isActive: true,
    })

    // Transform dates to strings
    const transformedSupplier = {
      ...newSupplier.toObject(),
      _id: newSupplier._id.toString(),
      createdAt: newSupplier.createdAt?.toISOString().split('T')[0] || '',
      updatedAt: newSupplier.updatedAt?.toISOString().split('T')[0] || '',
    }

    return successResponse(
      transformedSupplier,
      'Fournisseur créé avec succès',
      201
    )
  } catch (error) {
    console.error('[POST /api/inventory/suppliers] Error:', error)
    return errorResponse(
      'Erreur lors de la création du fournisseur',
      error instanceof Error ? error.message : undefined,
      500
    )
  }
}
