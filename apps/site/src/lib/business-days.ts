/**
 * Calcule le nombre de jours calendaires entre deux dates
 */
export function calculateCalendarDays(fromDate: Date, toDate: Date): number {
  const current = new Date(fromDate);
  current.setHours(0, 0, 0, 0);

  const end = new Date(toDate);
  end.setHours(0, 0, 0, 0);

  const diffTime = end.getTime() - current.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
}

/**
 * Calcule le nombre de jours calendaires jusqu'à une date donnée
 * (depuis aujourd'hui)
 */
export function daysUntil(targetDate: Date): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const target = new Date(targetDate);
  target.setHours(0, 0, 0, 0);

  if (target < today) {
    return 0;
  }

  return calculateCalendarDays(today, target);
}

// Garder les anciennes fonctions pour compatibilité
export const businessDaysUntil = daysUntil;
export const calculateBusinessDays = calculateCalendarDays;
