import { NextRequest } from "next/server"
import { requireAuth } from "@/lib/api/auth"
import {
  successResponse,
  errorResponse,
  notFoundResponse,
} from "@/lib/api/response"
import { connectMongoose } from "@/lib/mongodb"
import { Supplier } from "@/models/inventory/supplier"
import { getRequiredRoles } from "@/lib/inventory/permissions"
import type { SupplierFormData } from "@/types/inventory"

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

    // Parse body
    const body = (await request.json()) as Partial<SupplierFormData>

    // Check if supplier exists
    const existingSupplier = await Supplier.findById(params.id)
    if (!existingSupplier) {
      return notFoundResponse('Fournisseur')
    }

    // If email is being updated, check for duplicates
    if (body.email && body.email !== existingSupplier.email) {
      const duplicateEmail = await Supplier.findOne({ email: body.email })
      if (duplicateEmail) {
        return errorResponse(
          'Un fournisseur avec cet email existe déjà',
          undefined,
          409
        )
      }
    }

    // Update supplier
    const updatedSupplier = await Supplier.findByIdAndUpdate(
      params.id,
      {
        $set: {
          ...(body.name && { name: body.name }),
          ...(body.contact && { contact: body.contact }),
          ...(body.email && { email: body.email }),
          ...(body.phone && { phone: body.phone }),
          ...(body.address !== undefined && { address: body.address }),
          ...(body.categories && { categories: body.categories }),
          ...(body.paymentTerms !== undefined && {
            paymentTerms: body.paymentTerms,
          }),
          ...(body.notes !== undefined && { notes: body.notes }),
        },
      },
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
 * DELETE /api/inventory/suppliers/[id] - Soft delete a supplier (set isActive = false)
 * Auth: requireAuth(['admin', 'dev'])
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

    // Soft delete - set isActive to false
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
      'Erreur lors de la suppression du fournisseur',
      error instanceof Error ? error.message : undefined,
      500
    )
  }
}
