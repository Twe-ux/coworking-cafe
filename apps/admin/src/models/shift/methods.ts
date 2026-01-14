import { ShiftDocument } from './document';

/** Méthodes d'instance pour le modèle Shift */
export interface ShiftMethods {
  getDurationHours(): number;
  hasConflictWith(otherShift: ShiftDocument): boolean;
}

/**
 * Calcule la durée du shift en heures
 * @returns Durée en heures (peut être décimal)
 */
export function getDurationHours(this: ShiftDocument): number {
  const start = new Date(`2000-01-01 ${this.startTime}`);
  let end = new Date(`2000-01-01 ${this.endTime}`);

  // Gérer les shifts qui passent minuit
  if (end <= start) {
    end.setDate(end.getDate() + 1);
  }

  const durationMs = end.getTime() - start.getTime();
  return durationMs / (1000 * 60 * 60);
}

/**
 * Vérifie si ce shift est en conflit avec un autre shift
 * @param otherShift - Autre shift à comparer
 * @returns true si les shifts se chevauchent
 */
export function hasConflictWith(
  this: ShiftDocument,
  otherShift: ShiftDocument
): boolean {
  // Pas de conflit si ce n'est pas le même employé
  if (this.employeeId.toString() !== otherShift.employeeId.toString()) {
    return false;
  }

  // Pas de conflit si ce n'est pas le même jour
  if (this.date.toDateString() !== otherShift.date.toDateString()) {
    return false;
  }

  const thisStart = new Date(`2000-01-01 ${this.startTime}`);
  let thisEnd = new Date(`2000-01-01 ${this.endTime}`);
  const otherStart = new Date(`2000-01-01 ${otherShift.startTime}`);
  let otherEnd = new Date(`2000-01-01 ${otherShift.endTime}`);

  // Gérer les créneaux qui passent minuit
  if (thisEnd <= thisStart) {
    thisEnd.setDate(thisEnd.getDate() + 1);
  }
  if (otherEnd <= otherStart) {
    otherEnd.setDate(otherEnd.getDate() + 1);
  }

  // Vérifier le chevauchement
  return thisStart < otherEnd && thisEnd > otherStart;
}
