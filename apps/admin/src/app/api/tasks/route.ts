import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api/auth';
import { successResponse, errorResponse } from '@/lib/api/response';
import { connectMongoose } from '@/lib/mongodb';
import { Task } from '@coworking-cafe/database';
import type { ApiResponse } from '@/types/timeEntry';
import type { Task as TaskType, TaskCreateData, TaskFilters } from '@/types/task';

/**
 * GET /api/tasks - Récupérer la liste des tâches
 * PUBLIC - Accessible sans authentification (lecture seule)
 */
export async function GET(
  request: NextRequest
): Promise<NextResponse<ApiResponse<TaskType[]>>> {
  // Pas d'authentification requise - les tâches sont publiques (lecture seule)
  await connectMongoose();

  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status') as TaskFilters['status'];
    const priority = searchParams.get('priority') as TaskFilters['priority'];
    const createdBy = searchParams.get('createdBy');

    // Construire le filtre
    const filter: Record<string, unknown> = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (createdBy) filter.createdBy = createdBy;

    // Récupérer les tâches
    const tasks = await Task.find(filter).lean();

    // Ordre de priorité pour le tri
    const priorityOrder = { high: 1, medium: 2, low: 3 };

    // Transformer les ObjectId en strings
    const tasksFormatted = tasks.map((task) => ({
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
    }));

    // Tri : Priorité (high > medium > low), puis date d'échéance, puis date de création
    tasksFormatted.sort((a, b) => {
      // 1. Tri par priorité
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;

      // 2. Tri par date d'échéance (si présente, les tâches avec date viennent avant)
      if (a.dueDate && !b.dueDate) return -1;
      if (!a.dueDate && b.dueDate) return 1;
      if (a.dueDate && b.dueDate) {
        const dueDateDiff = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        if (dueDateDiff !== 0) return dueDateDiff;
      }

      // 3. Tri par date de création (plus récent d'abord)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return successResponse(tasksFormatted, 'Tâches récupérées avec succès');
  } catch (error) {
    console.error('GET /api/tasks error:', error);
    return errorResponse(
      'Erreur lors de la récupération des tâches',
      error instanceof Error ? error.message : 'Erreur inconnue'
    );
  }
}

/**
 * POST /api/tasks - Créer une nouvelle tâche
 */
export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse<TaskType>>> {
  // Auth : seuls dev et admin peuvent créer des tâches
  const authResult = await requireAuth(['dev', 'admin']);
  if (!authResult.authorized) {
    return authResult.response;
  }

  await connectMongoose();

  try {
    const body: TaskCreateData = await request.json();

    // Validation
    if (!body.title || body.title.trim().length === 0) {
      return errorResponse('Le titre est requis', 'title manquant', 400);
    }

    if (body.title.length > 100) {
      return errorResponse(
        'Le titre est trop long',
        'title dépasse 100 caractères',
        400
      );
    }

    // Valider la date si fournie
    if (body.dueDate && !/^\d{4}-\d{2}-\d{2}$/.test(body.dueDate)) {
      return errorResponse(
        'Format de date invalide',
        'dueDate doit être au format YYYY-MM-DD',
        400
      );
    }

    // Créer la tâche
    const task = await Task.create({
      title: body.title.trim(),
      description: body.description?.trim(),
      priority: body.priority || 'medium',
      dueDate: body.dueDate,
      createdBy: authResult.session.user.id,
      status: 'pending',
    });

    // Formater la réponse
    const taskFormatted: TaskType = {
      id: task._id.toString(),
      title: task.title,
      description: task.description,
      priority: task.priority,
      status: task.status,
      dueDate: task.dueDate,
      createdBy: task.createdBy.toString(),
      recurringTaskId: task.recurringTaskId?.toString(),
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString(),
    };

    return successResponse(taskFormatted, 'Tâche créée avec succès', 201);
  } catch (error) {
    console.error('POST /api/tasks error:', error);
    return errorResponse(
      'Erreur lors de la création de la tâche',
      error instanceof Error ? error.message : 'Erreur inconnue'
    );
  }
}
