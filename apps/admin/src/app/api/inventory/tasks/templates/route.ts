import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAuth } from '@/lib/api/auth'
import { successResponse, errorResponse } from '@/lib/api/response'
import { connectMongoose } from '@/lib/mongodb'
import { RecurringTask } from '@coworking-cafe/database'
import { getRequiredRoles } from '@/lib/inventory/permissions'

export const dynamic = 'force-dynamic'

const templateCreateSchema = z.object({
  title: z.string().min(1, 'Titre requis').max(100),
  description: z.string().max(500).optional(),
  priority: z.enum(['low', 'medium', 'high']),
  recurrenceType: z.enum(['weekly', 'monthly']),
  recurrenceDays: z.array(z.number()).min(1, 'Au moins un jour requis'),
  inventoryType: z.enum(['weekly', 'monthly']),
  supplierIds: z.array(z.string()).optional(),
  active: z.boolean().default(true),
})

/**
 * GET /api/inventory/tasks/templates
 * Get all inventory recurring task templates (weekly and monthly)
 */
export async function GET() {
  try {
    const authResult = await requireAuth(getRequiredRoles('viewInventory'))
    if (!authResult.authorized) return authResult.response

    await connectMongoose()

    const templates = await RecurringTask.find({
      'metadata.type': 'inventory',
    })
      .sort({ 'metadata.inventoryType': 1 })
      .lean()

    const formatted = templates.map((t) => {
      const metadata = (t.metadata || {}) as Record<string, unknown>
      return {
        id: t._id.toString(),
        title: t.title,
        description: t.description,
        priority: t.priority,
        recurrenceType: t.recurrenceType,
        recurrenceDays: t.recurrenceDays || [],
        active: t.active,
        inventoryType: metadata.inventoryType as 'weekly' | 'monthly',
        supplierIds: (metadata.supplierIds as string[]) || [],
        createdAt: t.createdAt?.toISOString(),
        updatedAt: t.updatedAt?.toISOString(),
      }
    })

    return successResponse(formatted)
  } catch (error) {
    console.error('[GET /api/inventory/tasks/templates] Error:', error)
    return errorResponse(
      'Erreur lors de la récupération des templates',
      error instanceof Error ? error.message : undefined,
      500
    )
  }
}

/**
 * POST /api/inventory/tasks/templates
 * Create a new recurring task template
 * Body: { title, description?, priority, recurrenceType, recurrenceDays, inventoryType, supplierIds?, active? }
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(getRequiredRoles('manageInventory'))
    if (!authResult.authorized) return authResult.response

    await connectMongoose()

    const body = await request.json()

    let validated: z.infer<typeof templateCreateSchema>
    try {
      validated = templateCreateSchema.parse(body)
    } catch (err) {
      if (err instanceof z.ZodError) {
        return errorResponse(
          'Validation échouée',
          err.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', '),
          400
        )
      }
      throw err
    }

    const newTemplate = await RecurringTask.create({
      title: validated.title,
      description: validated.description || '',
      priority: validated.priority,
      recurrenceType: validated.recurrenceType,
      recurrenceDays: validated.recurrenceDays,
      active: validated.active,
      metadata: {
        type: 'inventory',
        inventoryType: validated.inventoryType,
        supplierIds: validated.supplierIds || [],
      },
      createdBy: authResult.session.user?.id || 'system',
    })

    const metadata = (newTemplate.metadata || {}) as Record<string, unknown>
    const formatted = {
      id: newTemplate._id.toString(),
      title: newTemplate.title,
      description: newTemplate.description,
      priority: newTemplate.priority,
      recurrenceType: newTemplate.recurrenceType,
      recurrenceDays: newTemplate.recurrenceDays || [],
      active: newTemplate.active,
      inventoryType: metadata.inventoryType as 'weekly' | 'monthly',
      supplierIds: (metadata.supplierIds as string[]) || [],
      createdAt: newTemplate.createdAt?.toISOString(),
      updatedAt: newTemplate.updatedAt?.toISOString(),
    }

    return successResponse(formatted, 'Template créé avec succès', 201)
  } catch (error) {
    console.error('[POST /api/inventory/tasks/templates] Error:', error)
    return errorResponse(
      'Erreur lors de la création du template',
      error instanceof Error ? error.message : undefined,
      500
    )
  }
}
