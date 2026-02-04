import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api/auth';
import { successResponse, errorResponse } from '@/lib/api/response';
import { connectMongoose } from '@/lib/mongodb';
import { Task } from '@coworking-cafe/database';
import type { ApiResponse } from '@/types/timeEntry';
import type { Task as TaskType, TaskCreateData, TaskFilters } from '@/types/task';

/**
 * GET /api/tasks - Récupérer la liste des tâches
 */
export async function GET(
  request: NextRequest
): Promise<NextResponse<ApiResponse<TaskType[]>>> {
  // Auth : tous les rôles peuvent voir les tâches
  const authResult = await requireAuth(['dev', 'admin', 'staff']);
  if (!authResult.authorized) {
    return authResult.response;
  }

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
    const tasks = await Task.find(filter)
      .sort({ priority: -1, createdAt: -1 }) // high > medium > low, puis par date
      .lean();

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
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString(),
    }));

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
  // Auth : tous les rôles peuvent créer des tâches
  const authResult = await requireAuth(['dev', 'admin', 'staff']);
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
