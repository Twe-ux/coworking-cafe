import { NextRequest } from "next/server"
import { z } from "zod"
import { requireAuth } from "@/lib/api/auth"
import {
  successResponse,
  errorResponse,
  notFoundResponse,
} from "@/lib/api/response"
import { connectMongoose } from "@/lib/mongodb"
import { Supplier } from "@/models/inventory/supplier"
import { getRequiredRoles } from "@/lib/inventory/permissions"
import { supplierUpdateSchema, formatZodError } from "@/lib/inventory/validation"

export const dynamic = 'force-dynamic'

/**
 * GET /api/inventory/suppliers/[id] - Get a single supplier by ID
 * Auth: requireAuth(['admin', 'staff', 'dev'])
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Auth check
    const authResult = await requireAuth(getRequiredRoles('viewSuppliers'))
    if (!authResult.authorized) return authResult.response

    // Connect to database
    await connectMongoose()

    // Fetch supplier
    const supplier = await Supplier.findById(params.id).lean()

    if (!supplier) {
      return notFoundResponse('Fournisseur')
    }

    // Transform dates to strings
    const transformedSupplier = {
      ...supplier,
      _id: supplier._id.toString(),
      createdAt: supplier.createdAt?.toISOString().split('T')[0] || '',
      updatedAt: supplier.updatedAt?.toISOString().split('T')[0] || '',
    }

    return successResponse(transformedSupplier)
  } catch (error) {
    console.error(`[GET /api/inventory/suppliers/${params.id}] Error:`, error)
    return errorResponse(
      'Erreur lors de la récupération du fournisseur',
      error instanceof Error ? error.message : undefined,
      500
    )
  }
}

/**
 * PUT /api/inventory/suppliers/[id] - Update a supplier
 * Body: Partial<SupplierFormData>
 * Auth: requireAuth(['admin', 'dev'])
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Auth check - Only admin and dev can update
    const authResult = await requireAuth(getRequiredRoles('manageSuppliers'))
    if (!authResult.authorized) return authResult.response

    // Connect to database
    await connectMongoose()

    // Parse and validate body
    const body = await request.json()

    let validated: z.infer<typeof supplierUpdateSchema>
    try {
      validated = supplierUpdateSchema.parse(body)
    } catch (err) {
      if (err instanceof z.ZodError) {
        return errorResponse('Validation échouée', formatZodError(err), 400)
      }
      throw err
    }

    // Check if supplier exists
    const existingSupplier = await Supplier.findById(params.id)
    if (!existingSupplier) {
      return notFoundResponse('Fournisseur')
    }

    // If email is being updated, check for duplicates
    if (validated.email && validated.email !== existingSupplier.email) {
      const duplicateEmail = await Supplier.findOne({ email: validated.email })
      if (duplicateEmail) {
        return errorResponse(
          'Un fournisseur avec cet email existe déjà',
          undefined,
          409
        )
      }
    }

    // Update supplier - only set fields that are provided
    const updateFields: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(validated)) {
      if (value !== undefined) {
        updateFields[key] = value
      }
    }

    const updatedSupplier = await Supplier.findByIdAndUpdate(
      params.id,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).lean()

    if (!updatedSupplier) {
      return notFoundResponse('Fournisseur')
    }

    // Transform dates to strings
    const transformedSupplier = {
      ...updatedSupplier,
      _id: updatedSupplier._id.toString(),
      createdAt: updatedSupplier.createdAt?.toISOString().split('T')[0] || '',
      updatedAt: updatedSupplier.updatedAt?.toISOString().split('T')[0] || '',
    }

    return successResponse(
      transformedSupplier,
      'Fournisseur mis à jour avec succès'
    )
  } catch (error) {
    console.error(`[PUT /api/inventory/suppliers/${params.id}] Error:`, error)
    return errorResponse(
      'Erreur lors de la mise à jour du fournisseur',
      error instanceof Error ? error.message : undefined,
      500
    )
  }
}

/**
 * DELETE /api/inventory/suppliers/[id] - Soft delete (deactivate) a supplier
 * Auth: requireAuth(['admin', 'dev'])
 *
 * Note: Soft delete to preserve data integrity for products and orders history
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Auth check - Only admin and dev can delete
    const authResult = await requireAuth(getRequiredRoles('manageSuppliers'))
    if (!authResult.authorized) return authResult.response

    // Connect to database
    await connectMongoose()

    // Check if supplier exists
    const existingSupplier = await Supplier.findById(params.id)
    if (!existingSupplier) {
      return notFoundResponse('Fournisseur')
    }

    // Soft delete - deactivate the supplier
    await Supplier.findByIdAndUpdate(params.id, {
      $set: { isActive: false },
    })

    return successResponse(
      { message: 'Fournisseur désactivé avec succès' },
      'Fournisseur désactivé avec succès'
    )
  } catch (error) {
    console.error(
      `[DELETE /api/inventory/suppliers/${params.id}] Error:`,
      error
    )
    return errorResponse(
      'Erreur lors de la désactivation du fournisseur',
      error instanceof Error ? error.message : undefined,
      500
    )
  }
}
