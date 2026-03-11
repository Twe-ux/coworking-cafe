import { NextRequest } from 'next/server'
import { z } from 'zod'
import { requireAuth } from '@/lib/api/auth'
import { successResponse, errorResponse } from '@/lib/api/response'
import { connectMongoose } from '@/lib/mongodb'
import { Supplier } from '@/models/inventory/supplier'
import { getRequiredRoles } from '@/lib/inventory/permissions'

export const dynamic = 'force-dynamic'

const checkEmailSchema = z.object({
  email: z.string().email('Email invalide'),
  excludeId: z.string().optional(),
})

/**
 * POST /api/inventory/suppliers/check-email
 * Check if a supplier email already exists (exact match).
 * Body: { email: string, excludeId?: string }
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(getRequiredRoles('viewSuppliers'))
    if (!authResult.authorized) return authResult.response

    await connectMongoose()

    const body = await request.json()

    let validated: z.infer<typeof checkEmailSchema>
    try {
      validated = checkEmailSchema.parse(body)
    } catch (err) {
      if (err instanceof z.ZodError) {
        return errorResponse('Validation échouée', err.issues[0].message, 400)
      }
      throw err
    }

    const query: Record<string, unknown> = {
      email: validated.email.toLowerCase(),
    }

    if (validated.excludeId) {
      const mongoose = await import('mongoose')
      query._id = { $ne: new mongoose.Types.ObjectId(validated.excludeId) }
    }

    const exists = await Supplier.findOne(query).lean()

    return successResponse({ exists: !!exists })
  } catch (error) {
    console.error('[POST /api/inventory/suppliers/check-email] Error:', error)
    return errorResponse(
      'Erreur lors de la vérification',
      error instanceof Error ? error.message : undefined,
      500
    )
  }
}
