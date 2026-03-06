import { NextRequest } from "next/server"
import { requireAuth } from "@/lib/api/auth"
import { successResponse, errorResponse } from "@/lib/api/response"
import { connectMongoose } from "@/lib/mongodb"
import { Supplier } from "@/models/inventory/supplier"
import { getRequiredRoles } from "@/lib/inventory/permissions"

/**
 * PATCH /api/inventory/suppliers/reorder - Update supplier display order
 * Body: { supplierIds: string[] }
 * Auth: requireAuth(['admin', 'dev'])
 */
export async function PATCH(request: NextRequest) {
  try {
    const authResult = await requireAuth(getRequiredRoles('manageSuppliers'))
    if (!authResult.authorized) return authResult.response

    await connectMongoose()

    const body = (await request.json()) as { supplierIds: string[] }

    if (!body.supplierIds || !Array.isArray(body.supplierIds) || body.supplierIds.length === 0) {
      return errorResponse('supplierIds array is required', undefined, 400)
    }

    // Update order for each supplier in parallel
    const updates = body.supplierIds.map((id, index) =>
      Supplier.findByIdAndUpdate(id, { order: index })
    )
    await Promise.all(updates)

    return successResponse(
      { updated: body.supplierIds.length },
      'Ordre des fournisseurs mis à jour'
    )
  } catch (error) {
    console.error('[PATCH /api/inventory/suppliers/reorder] Error:', error)
    return errorResponse(
      "Erreur lors de la mise à jour de l'ordre",
      error instanceof Error ? error.message : undefined,
      500
    )
  }
}
