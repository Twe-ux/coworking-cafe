import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api/auth';
import { successResponse, errorResponse } from '@/lib/api/response';
import { connectMongoose } from '@/lib/mongodb';
import { RecurringTask, Task } from '@coworking-cafe/database';
import type { ApiResponse } from '@/types/timeEntry';
import type {
  RecurringTask as RecurringTaskType,
  RecurringTaskUpdateData,
} from '@/types/task';

/**
 * PATCH /api/tasks/recurring/[id] - Update a recurring task template
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<ApiResponse<RecurringTaskType>>> {
  const authResult = await requireAuth(['dev', 'admin']);
  if (!authResult.authorized) return authResult.response;

  await connectMongoose();

  try {
    const { id } = params;
    const body: RecurringTaskUpdateData = await request.json();

    const template = await RecurringTask.findById(id);
    if (!template) {
      return errorResponse('Tache recurrente introuvable', `ID ${id}`, 404);
    }

    if (body.title !== undefined) {
      if (body.title.trim().length === 0) {
        return errorResponse('Le titre ne peut pas etre vide', 'title vide', 400);
      }
      template.title = body.title.trim();
    }
    if (body.description !== undefined) {
      template.description = body.description?.trim();
    }
    if (body.priority !== undefined) {
      template.priority = body.priority;
    }
    if (body.recurrenceType !== undefined) {
      template.recurrenceType = body.recurrenceType;
    }
    if (body.recurrenceDays !== undefined) {
      if (body.recurrenceDays.length === 0) {
        return errorResponse('Au moins un jour requis', 'recurrenceDays vide', 400);
      }
      template.recurrenceDays = body.recurrenceDays;
    }
    if (body.active !== undefined) {
      template.active = body.active;
    }

    await template.save();

    const formatted: RecurringTaskType = {
      id: template._id.toString(),
      title: template.title,
      description: template.description,
      priority: template.priority,
      recurrenceType: template.recurrenceType,
      recurrenceDays: template.recurrenceDays,
      active: template.active,
      createdBy: template.createdBy.toString(),
      createdAt: template.createdAt.toISOString(),
      updatedAt: template.updatedAt.toISOString(),
    };

    return successResponse(formatted, 'Tache recurrente mise a jour');
  } catch (error) {
    console.error('PATCH /api/tasks/recurring/[id] error:', error);
    return errorResponse(
      'Erreur lors de la mise a jour',
      error instanceof Error ? error.message : 'Erreur inconnue'
    );
  }
}

/**
 * DELETE /api/tasks/recurring/[id] - Delete template + pending instances
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<ApiResponse<null>>> {
  const authResult = await requireAuth(['dev', 'admin']);
  if (!authResult.authorized) return authResult.response;

  await connectMongoose();

  try {
    const { id } = params;

    const template = await RecurringTask.findByIdAndDelete(id);
    if (!template) {
      return errorResponse('Tache recurrente introuvable', `ID ${id}`, 404);
    }

    // Delete all pending task instances linked to this template
    await Task.deleteMany({ recurringTaskId: id, status: 'pending' });

    return successResponse(null, 'Tache recurrente supprimee');
  } catch (error) {
    console.error('DELETE /api/tasks/recurring/[id] error:', error);
    return errorResponse(
      'Erreur lors de la suppression',
      error instanceof Error ? error.message : 'Erreur inconnue'
    );
  }
}
