import { TaskDocument, TaskSchema } from './document';

/**
 * Marquer la tâche comme complétée
 * @param userId - ID de l'utilisateur qui complète la tâche
 */
TaskSchema.methods.markAsCompleted = function (
  this: TaskDocument,
  userId: string
): Promise<TaskDocument> {
  this.status = 'completed';
  this.completedBy = userId as any;
  this.completedAt = new Date();
  return this.save();
};

/**
 * Vérifier si la tâche est en retard
 */
TaskSchema.methods.isOverdue = function (this: TaskDocument): boolean {
  if (!this.dueDate || this.status === 'completed') {
    return false;
  }

  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  return this.dueDate < today;
};

/**
 * Obtenir le nombre de jours restants avant la deadline
 * @returns nombre de jours (négatif si en retard, null si pas de deadline)
 */
TaskSchema.methods.getDaysUntilDue = function (this: TaskDocument): number | null {
  if (!this.dueDate) {
    return null;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dueDate = new Date(this.dueDate);
  dueDate.setHours(0, 0, 0, 0);

  const diffTime = dueDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
};
