import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api/auth';
import { successResponse, errorResponse } from '@/lib/api/response';
import { connectMongoose } from '@/lib/mongodb';
import { RecurringTask } from '@coworking-cafe/database';
import type { ApiResponse } from '@/types/timeEntry';
import type {
  RecurringTask as RecurringTaskType,
  RecurringTaskCreateData,
} from '@/types/task';

function formatRecurringTask(
  doc: InstanceType<typeof RecurringTask>
): RecurringTaskType {
  return {
    id: doc._id.toString(),
    title: doc.title,
    description: doc.description,
    priority: doc.priority,
    recurrenceType: doc.recurrenceType,
    recurrenceDays: doc.recurrenceDays,
    active: doc.active,
    createdBy: doc.createdBy.toString(),
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

/**
 * GET /api/tasks/recurring - List recurring task templates
 */
export async function GET(): Promise<NextResponse<ApiResponse<RecurringTaskType[]>>> {
  const authResult = await requireAuth(['dev', 'admin']);
  if (!authResult.authorized) return authResult.response;

  await connectMongoose();

  try {
    const templates = await RecurringTask.find()
      .sort({ active: -1, title: 1 })
      .lean();

    const formatted = templates.map((t) => ({
      id: t._id.toString(),
      title: t.title,
      description: t.description,
      priority: t.priority,
      recurrenceType: t.recurrenceType,
      recurrenceDays: t.recurrenceDays,
      active: t.active,
      createdBy: t.createdBy.toString(),
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
    }));

    return successResponse(formatted);
  } catch (error) {
    console.error('GET /api/tasks/recurring error:', error);
    return errorResponse(
      'Erreur lors de la recuperation des taches recurrentes',
      error instanceof Error ? error.message : 'Erreur inconnue'
    );
  }
}

/**
 * POST /api/tasks/recurring - Create a recurring task template
 */
export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse<RecurringTaskType>>> {
  const authResult = await requireAuth(['dev', 'admin']);
  if (!authResult.authorized) return authResult.response;

  await connectMongoose();

  try {
    const body: RecurringTaskCreateData = await request.json();

    if (!body.title || body.title.trim().length === 0) {
      return errorResponse('Le titre est requis', 'title manquant', 400);
    }
    if (body.title.length > 100) {
      return errorResponse('Le titre est trop long', 'title > 100', 400);
    }
    if (!body.recurrenceType || !['weekly', 'monthly'].includes(body.recurrenceType)) {
      return errorResponse('Type de recurrence invalide', 'weekly ou monthly', 400);
    }
    if (!body.recurrenceDays || body.recurrenceDays.length === 0) {
      return errorResponse('Au moins un jour est requis', 'recurrenceDays vide', 400);
    }

    const template = await RecurringTask.create({
      title: body.title.trim(),
      description: body.description?.trim(),
      priority: body.priority || 'medium',
      recurrenceType: body.recurrenceType,
      recurrenceDays: body.recurrenceDays,
      active: true,
      createdBy: authResult.session.user.id,
    });

    return successResponse(formatRecurringTask(template), 'Tache recurrente creee', 201);
  } catch (error) {
    console.error('POST /api/tasks/recurring error:', error);
    return errorResponse(
      'Erreur lors de la creation de la tache recurrente',
      error instanceof Error ? error.message : 'Erreur inconnue'
    );
  }
}
