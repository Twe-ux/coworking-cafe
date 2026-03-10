import { NextRequest } from "next/server"
import { requireAuth } from "@/lib/api/auth"
import { successResponse, errorResponse, notFoundResponse } from "@/lib/api/response"
import { connectMongoose } from "@/lib/mongodb"
import { DirectPurchase } from "@/models/inventory/directPurchase"
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
      purchase as unknown as Record<string, unknown>
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
