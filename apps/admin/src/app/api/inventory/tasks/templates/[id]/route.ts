import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/api/auth'
import { successResponse, errorResponse, notFoundResponse } from '@/lib/api/response'
import { connectMongoose } from '@/lib/mongodb'
import { RecurringTask } from '@coworking-cafe/database'
import { getRequiredRoles } from '@/lib/inventory/permissions'

export const dynamic = 'force-dynamic'

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * PUT /api/inventory/tasks/templates/[id]
 * Update a recurring task template
 * Body: { recurrenceDays?: number[], active?: boolean, title?: string, description?: string, priority?: string, supplierIds?: string[] }
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await requireAuth(getRequiredRoles('manageInventory'))
    if (!authResult.authorized) return authResult.response

    await connectMongoose()

    const { id } = await params
    const body = await request.json()

    const template = await RecurringTask.findById(id)
    if (!template) {
      return notFoundResponse('Template')
    }

    // Update allowed fields
    if (body.recurrenceDays !== undefined) {
      template.recurrenceDays = body.recurrenceDays
    }
    if (body.active !== undefined) {
      template.active = body.active
    }
    if (body.title) {
      template.title = body.title
    }
    if (body.description) {
      template.description = body.description
    }
    if (body.priority) {
      template.priority = body.priority
    }

    // Update supplier filter in metadata
    if (body.supplierIds !== undefined) {
      const currentMetadata = (template.metadata || {}) as Record<string, unknown>
      template.metadata = {
        ...currentMetadata,
        supplierIds: body.supplierIds,
      }
      template.markModified('metadata')
    }

    await template.save()

    const metadata = (template.metadata || {}) as Record<string, unknown>
    const formatted = {
      id: template._id.toString(),
      title: template.title,
      description: template.description,
      priority: template.priority,
      recurrenceType: template.recurrenceType,
      recurrenceDays: template.recurrenceDays || [],
      active: template.active,
      inventoryType: metadata.inventoryType as 'weekly' | 'monthly',
      supplierIds: (metadata.supplierIds as string[]) || [],
      updatedAt: template.updatedAt?.toISOString(),
    }

    return successResponse(formatted, 'Template mis à jour')
  } catch (error) {
    console.error('[PUT /api/inventory/tasks/templates/[id]] Error:', error)
    return errorResponse(
      'Erreur lors de la mise à jour du template',
      error instanceof Error ? error.message : undefined,
      500
    )
  }
}

/**
 * PATCH /api/inventory/tasks/templates/[id]
 * Toggle active status
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await requireAuth(getRequiredRoles('manageInventory'))
    if (!authResult.authorized) return authResult.response

    await connectMongoose()

    const { id } = await params

    const template = await RecurringTask.findById(id)
    if (!template) {
      return notFoundResponse('Template')
    }

    // Toggle active status
    template.active = !template.active
    await template.save()

    return successResponse(
      { active: template.active },
      template.active ? 'Template activé' : 'Template désactivé'
    )
  } catch (error) {
    console.error('[PATCH /api/inventory/tasks/templates/[id]] Error:', error)
    return errorResponse(
      'Erreur lors du changement de statut',
      error instanceof Error ? error.message : undefined,
      500
    )
  }
}
