import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/api/auth'
import { successResponse, errorResponse } from '@/lib/api/response'
import { connectMongoose } from '@/lib/mongodb'
import { RecurringTask } from '@coworking-cafe/database'
import { getRequiredRoles } from '@/lib/inventory/permissions'
import type { ApiResponse } from '@/types/timeEntry'
import type { InventoryTaskSetupResult } from '@/types/inventory'

export const dynamic = 'force-dynamic'

/**
 * POST /api/inventory/tasks/setup
 * Creates recurring task templates for weekly and monthly inventory.
 * Idempotent: skips if templates already exist.
 */
export async function POST(): Promise<NextResponse<ApiResponse<InventoryTaskSetupResult>>> {
  try {
    const authResult = await requireAuth(getRequiredRoles('createInventory'))
    if (!authResult.authorized) return authResult.response

    await connectMongoose()

    const userId = authResult.session.user?.id || ''
    let created = 0
    let existing = 0
    let weeklyTemplateId = ''
    let monthlyTemplateId = ''

    // Check/Create weekly template (every Monday = day 1)
    const existingWeekly = await RecurringTask.findOne({
      'metadata.type': 'inventory',
      'metadata.inventoryType': 'weekly',
      active: true,
    }).lean()

    if (existingWeekly) {
      weeklyTemplateId = existingWeekly._id.toString()
      existing++
    } else {
      const weekly = await RecurringTask.create({
        title: 'Inventaire hebdomadaire - DLC courte',
        description: 'Inventaire hebdomadaire des produits a DLC courte',
        priority: 'high',
        recurrenceType: 'weekly',
        recurrenceDays: [1], // Monday
        active: true,
        metadata: { type: 'inventory', inventoryType: 'weekly' },
        createdBy: userId,
      })
      weeklyTemplateId = weekly._id.toString()
      created++
    }

    // Check/Create monthly template (1st of month = day 1)
    const existingMonthly = await RecurringTask.findOne({
      'metadata.type': 'inventory',
      'metadata.inventoryType': 'monthly',
      active: true,
    }).lean()

    if (existingMonthly) {
      monthlyTemplateId = existingMonthly._id.toString()
      existing++
    } else {
      const monthly = await RecurringTask.create({
        title: 'Inventaire mensuel - Tous produits',
        description: 'Inventaire mensuel complet de tous les produits',
        priority: 'medium',
        recurrenceType: 'monthly',
        recurrenceDays: [1], // 1st of month
        active: true,
        metadata: { type: 'inventory', inventoryType: 'monthly' },
        createdBy: userId,
      })
      monthlyTemplateId = monthly._id.toString()
      created++
    }

    return successResponse(
      { weeklyTemplateId, monthlyTemplateId, created, existing },
      `Templates configures: ${created} crees, ${existing} existants`,
      created > 0 ? 201 : 200
    )
  } catch (error) {
    console.error('[POST /api/inventory/tasks/setup] Error:', error)
    return errorResponse(
      'Erreur lors de la configuration des taches inventaire',
      error instanceof Error ? error.message : undefined,
      500
    )
  }
}
