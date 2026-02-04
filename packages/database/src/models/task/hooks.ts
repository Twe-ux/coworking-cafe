import { TaskSchema } from './document';

export function attachHooks() {
  // Hook avant sauvegarde pour validation
  TaskSchema.pre('save', function (next) {
    // Si la tâche est marquée comme complétée, s'assurer que completedAt est défini
    if (this.status === 'completed' && !this.completedAt) {
      this.completedAt = new Date();
    }

    // Si la tâche repasse en pending, nettoyer les champs de complétion
    if (this.status === 'pending') {
      this.completedBy = undefined;
      this.completedAt = undefined;
    }

    next();
  });
}
