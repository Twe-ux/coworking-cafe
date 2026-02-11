import { NextResponse } from 'next/server';
import { successResponse, errorResponse } from '@/lib/api/response';
import { connectMongoose } from '@/lib/mongodb';
import { RecurringTask, Task } from '@coworking-cafe/database';
import type { ApiResponse } from '@/types/timeEntry';

/**
 * POST /api/tasks/recurring/sync
 * Generates task instances for today from active recurring templates.
 * - For each active template matching today's day, checks if a pending instance exists.
 * - If no pending instance → creates one with dueDate = today.
 * - If pending instance exists → does nothing (no duplicate).
 */
export async function POST(): Promise<NextResponse<ApiResponse<{ created: number }>>> {
  await connectMongoose();

  try {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0=Sunday, 6=Saturday
    const dayOfMonth = now.getDate(); // 1-31
    const today = now.toISOString().split('T')[0]; // YYYY-MM-DD

    // Get all active templates
    const templates = await RecurringTask.find({ active: true }).lean();

    let created = 0;

    for (const template of templates) {
      // Check if today matches a recurrence day
      const matchesDay =
        template.recurrenceType === 'weekly'
          ? template.recurrenceDays.includes(dayOfWeek)
          : template.recurrenceDays.includes(dayOfMonth);

      if (!matchesDay) continue;

      // Check if there's already a pending task for this template
      const existingPending = await Task.findOne({
        recurringTaskId: template._id,
        status: 'pending',
      }).lean();

      if (existingPending) continue;

      // Create new task instance
      await Task.create({
        title: template.title,
        description: template.description,
        priority: template.priority,
        status: 'pending',
        dueDate: today,
        recurringTaskId: template._id,
        createdBy: template.createdBy,
      });

      created++;
    }

    return successResponse({ created });
  } catch (error) {
    console.error('POST /api/tasks/recurring/sync error:', error);
    return errorResponse(
      'Erreur lors de la synchronisation',
      error instanceof Error ? error.message : 'Erreur inconnue'
    );
  }
}
