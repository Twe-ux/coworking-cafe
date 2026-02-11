import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api/auth';
import { successResponse, errorResponse } from '@/lib/api/response';
import { connectMongoose } from '@/lib/mongodb';
import { Task } from '@coworking-cafe/database';
import type { ApiResponse } from '@/types/timeEntry';
import type { Task as TaskType, TaskUpdateData } from '@/types/task';
import type { TaskDocument } from '@coworking-cafe/database';

function formatTask(task: TaskDocument): TaskType {
  return {
    id: task._id.toString(),
    title: task.title,
    description: task.description,
    priority: task.priority,
    status: task.status,
    dueDate: task.dueDate,
    createdBy: task.createdBy.toString(),
    completedBy: task.completedBy?.toString(),
    completedAt: task.completedAt?.toISOString(),
    recurringTaskId: task.recurringTaskId?.toString(),
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
  };
}

/**
 * PATCH /api/tasks/[id] - Mettre à jour une tâche
 * PUBLIC pour le toggle status (cocher/décocher)
 * PROTÉGÉ pour les autres modifications (titre, description, etc.)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<ApiResponse<TaskType>>> {
  await connectMongoose();

  const body: TaskUpdateData = await request.json();

  // Si modification autre que status → Auth requise (admin/dev uniquement)
  const isStatusOnlyUpdate = Object.keys(body).length === 1 && 'status' in body;

  if (!isStatusOnlyUpdate) {
    // Modifications avancées : Auth requise
    const authResult = await requireAuth(['dev', 'admin']);
    if (!authResult.authorized) {
      return authResult.response;
    }
  }
  // Sinon : toggle status public (pas d'auth requise)

  try {
    const { id } = params;

    // Trouver la tâche
    const task = await Task.findById(id);
    if (!task) {
      return errorResponse('Tâche introuvable', `Aucune tâche avec l'ID ${id}`, 404);
    }

    // Validation des champs modifiables
    if (body.title !== undefined) {
      if (body.title.trim().length === 0) {
        return errorResponse('Le titre ne peut pas être vide', 'title vide', 400);
      }
      if (body.title.length > 100) {
        return errorResponse(
          'Le titre est trop long',
          'title dépasse 100 caractères',
          400
        );
      }
      task.title = body.title.trim();
    }

    if (body.description !== undefined) {
      task.description = body.description?.trim();
    }

    if (body.priority !== undefined) {
      task.priority = body.priority;
    }

    if (body.dueDate !== undefined) {
      if (body.dueDate && !/^\d{4}-\d{2}-\d{2}$/.test(body.dueDate)) {
        return errorResponse(
          'Format de date invalide',
          'dueDate doit être au format YYYY-MM-DD',
          400
        );
      }
      task.dueDate = body.dueDate || undefined;
    }

    // Si on marque comme complétée
    if (body.status === 'completed' && task.status !== 'completed') {
      // Recurring task: delete instance instead of completing
      if (task.recurringTaskId) {
        await Task.findByIdAndDelete(task._id);
        return successResponse(
          { ...formatTask(task), status: 'completed' } as TaskType,
          'Tache recurrente completee'
        );
      }

      task.status = 'completed';
      // completedBy reste undefined si pas d'auth (utilisateur non connecté)
      task.completedBy = undefined;
      task.completedAt = new Date();
    }

    // Si on marque comme pending (réouvrir la tâche)
    if (body.status === 'pending' && task.status !== 'pending') {
      task.status = 'pending';
      task.completedBy = undefined;
      task.completedAt = undefined;
    }

    // Sauvegarder
    await task.save();

    return successResponse(formatTask(task), 'Tâche mise à jour avec succès');
  } catch (error) {
    console.error('PATCH /api/tasks/[id] error:', error);
    return errorResponse(
      'Erreur lors de la mise à jour de la tâche',
      error instanceof Error ? error.message : 'Erreur inconnue'
    );
  }
}

/**
 * DELETE /api/tasks/[id] - Supprimer une tâche
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<ApiResponse<null>>> {
  // Auth : seuls dev et admin peuvent supprimer des tâches
  const authResult = await requireAuth(['dev', 'admin']);
  if (!authResult.authorized) {
    return authResult.response;
  }

  await connectMongoose();

  try {
    const { id } = params;

    // Supprimer la tâche
    const result = await Task.findByIdAndDelete(id);

    if (!result) {
      return errorResponse('Tâche introuvable', `Aucune tâche avec l'ID ${id}`, 404);
    }

    return successResponse(null, 'Tâche supprimée avec succès');
  } catch (error) {
    console.error('DELETE /api/tasks/[id] error:', error);
    return errorResponse(
      'Erreur lors de la suppression de la tâche',
      error instanceof Error ? error.message : 'Erreur inconnue'
    );
  }
}
