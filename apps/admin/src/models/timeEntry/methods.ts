import { TimeEntryDocument } from './document';

/** Méthodes d'instance pour le modèle TimeEntry */
export interface TimeEntryMethods {
  calculateTotalHours(): number;
  completeShift(): Promise<void>;
}

/**
 * Calcule le total d'heures travaillées
 * @returns Nombre d'heures (arrondi à 2 décimales)
 */
export function calculateTotalHours(this: TimeEntryDocument): number {
  if (!this.clockOut) {
    return 0;
  }

  const durationMs = this.clockOut.getTime() - this.clockIn.getTime();
  const hours = durationMs / (1000 * 60 * 60);

  // Arrondir à 2 décimales
  return Math.round(hours * 100) / 100;
}

/**
 * Termine le shift en cours (clock-out)
 */
export async function completeShift(this: TimeEntryDocument & TimeEntryMethods): Promise<void> {
  if (this.status === 'completed') {
    throw new Error('Ce shift est déjà terminé');
  }

  this.clockOut = new Date();
  this.totalHours = this.calculateTotalHours();
  this.status = 'completed';

  await this.save();
}
