/**
 * Utilitaires pour le système de suivi du temps de travail (pointage)
 */

import type { TimeEntryDocument, ShiftNumber, TimeEntryStatus } from '@/models/timeEntry';

/**
 * Formate une durée en heures en format HH:MM
 * @param hours - Nombre d'heures (peut être décimal)
 * @returns Format "HH:MM"
 */
export function formatHoursToHHMM(hours: number): string {
  if (!hours || hours < 0) return '0:00';

  const totalMinutes = Math.round(hours * 60);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;

  return `${h}:${m.toString().padStart(2, '0')}`;
}

/**
 * Formate une durée en heures en format lisible
 * @param hours - Nombre d'heures (peut être décimal)
 * @returns Format "Xh Ym" ou "Xh" si pas de minutes
 */
export function formatDuration(hours: number): string {
  if (!hours || hours < 0) return '0h';

  const wholeHours = Math.floor(hours);
  const minutes = Math.round((hours - wholeHours) * 60);

  if (minutes === 0) {
    return `${wholeHours}h`;
  }

  return `${wholeHours}h ${minutes}m`;
}

/**
 * Calcule la différence en heures entre deux dates
 * @param start - Date de début
 * @param end - Date de fin
 * @returns Nombre d'heures (décimal)
 */
export function calculateHoursDifference(start: Date, end: Date): number {
  const diffMs = end.getTime() - start.getTime();
  return Math.max(0, diffMs / (1000 * 60 * 60));
}

/**
 * Vérifie si une date est aujourd'hui
 * @param date - Date à vérifier
 * @returns true si la date est aujourd'hui
 */
export function isToday(date: Date): boolean {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

/**
 * Obtient le début de la journée pour une date donnée
 * @param date - Date source
 * @returns Nouvelle date au début de la journée (00:00:00)
 */
export function getStartOfDay(date: Date = new Date()): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/**
 * Obtient la fin de la journée pour une date donnée
 * @param date - Date source
 * @returns Nouvelle date à la fin de la journée (23:59:59)
 */
export function getEndOfDay(date: Date = new Date()): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
}

/**
 * Détermine le statut d'affichage d'un shift
 * @param timeEntry - Entrée de temps
 * @returns Objet avec statut et couleur pour l'affichage
 */
export function getShiftDisplayStatus(timeEntry: Partial<TimeEntryDocument>): {
  status: string;
  variant: string;
  badge: string;
} {
  if (timeEntry.status === 'active') {
    return {
      status: 'En cours',
      variant: 'success',
      badge: 'success',
    };
  }

  if (timeEntry.status === 'completed') {
    return {
      status: 'Terminé',
      variant: 'secondary',
      badge: 'secondary',
    };
  }

  return {
    status: 'Inconnu',
    variant: 'light',
    badge: 'light',
  };
}

/**
 * Calcule les statistiques pour une liste de time entries
 * @param timeEntries - Liste des entrées de temps
 * @returns Statistiques calculées
 */
export function calculateTimeEntryStats(timeEntries: Partial<TimeEntryDocument>[]): {
  totalHours: number;
  totalShifts: number;
  activeShifts: number;
  completedShifts: number;
  averageHoursPerShift: number;
} {
  const totalShifts = timeEntries.length;
  const activeShifts = timeEntries.filter(entry => entry.status === 'active').length;
  const completedShifts = timeEntries.filter(entry => entry.status === 'completed').length;
  const totalHours = timeEntries.reduce((sum, entry) => sum + (entry.totalHours || 0), 0);
  const averageHoursPerShift = completedShifts > 0 ? totalHours / completedShifts : 0;

  return {
    totalHours,
    totalShifts,
    activeShifts,
    completedShifts,
    averageHoursPerShift,
  };
}

/**
 * Groupe les time entries par date
 * @param timeEntries - Liste des entrées de temps
 * @returns Map groupée par date (string YYYY-MM-DD)
 */
export function groupTimeEntriesByDate(timeEntries: Partial<TimeEntryDocument>[]): Map<string, Partial<TimeEntryDocument>[]> {
  const grouped = new Map<string, Partial<TimeEntryDocument>[]>();

  timeEntries.forEach(entry => {
    if (!entry.date) return;
    const dateKey = new Date(entry.date).toISOString().split('T')[0];
    if (!grouped.has(dateKey)) {
      grouped.set(dateKey, []);
    }
    grouped.get(dateKey)!.push(entry);
  });

  return grouped;
}

/**
 * Groupe les time entries par employé
 * @param timeEntries - Liste des entrées de temps
 * @returns Map groupée par employé ID
 */
export function groupTimeEntriesByEmployee(timeEntries: Partial<TimeEntryDocument>[]): Map<string, Partial<TimeEntryDocument>[]> {
  const grouped = new Map<string, Partial<TimeEntryDocument>[]>();

  timeEntries.forEach(entry => {
    if (!entry.employeeId) return;
    const employeeId = entry.employeeId.toString();
    if (!grouped.has(employeeId)) {
      grouped.set(employeeId, []);
    }
    grouped.get(employeeId)!.push(entry);
  });

  return grouped;
}

/**
 * Valide qu'une plage horaire est logique
 * @param clockIn - Heure d'arrivée
 * @param clockOut - Heure de départ
 * @returns true si la plage est valide
 */
export function validateTimeRange(clockIn: Date, clockOut: Date | null): boolean {
  if (!clockOut) return true; // clockOut peut être null pour un shift actif
  return clockOut.getTime() > clockIn.getTime();
}

/**
 * Calcule le temps de travail restant pour atteindre un objectif
 * @param currentHours - Heures actuellement travaillées
 * @param targetHours - Heures cibles
 * @returns Heures restantes (peut être négatif si objectif dépassé)
 */
export function calculateRemainingHours(currentHours: number, targetHours: number): number {
  return targetHours - currentHours;
}

/**
 * Formate une date au format français
 * @param date - Date à formater
 * @returns Date formatée (ex: "15/03/2024")
 */
export function formatDateFR(date: Date | string): string {
  return new Intl.DateTimeFormat('fr-FR').format(new Date(date));
}

/**
 * Formate une heure au format français
 * @param date - Date contenant l'heure à formater
 * @returns Heure formatée (ex: "14:30")
 */
export function formatTimeFR(date: Date | string): string {
  return new Intl.DateTimeFormat('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

/**
 * Formate une date et heure complète
 * @param date - Date à formater
 * @returns Date et heure formatées (ex: "15/03/2024 à 14:30")
 */
export function formatDateTimeFR(date: Date | string): string {
  return `${formatDateFR(date)} à ${formatTimeFR(date)}`;
}

/**
 * Détermine si un shift est considéré comme long
 * @param hours - Nombre d'heures du shift
 * @returns true si le shift est long (> 8h)
 */
export function isLongShift(hours: number): boolean {
  return hours > 8;
}

/**
 * Détermine si un shift est considéré comme court
 * @param hours - Nombre d'heures du shift
 * @returns true si le shift est court (< 4h)
 */
export function isShortShift(hours: number): boolean {
  return hours < 4;
}

/**
 * Détecte les anomalies dans un time entry
 * @param timeEntry - Entrée de temps à analyser
 * @returns Liste des anomalies détectées
 */
export function detectAnomalies(timeEntry: Partial<TimeEntryDocument>): string[] {
  const anomalies: string[] = [];

  // Shift non clos
  if (timeEntry.status === 'active' && timeEntry.clockIn) {
    const hoursSinceClockIn = calculateHoursDifference(new Date(timeEntry.clockIn), new Date());
    if (hoursSinceClockIn > 12) {
      anomalies.push('Shift actif depuis plus de 12h');
    }
  }

  // Shift très long
  if (timeEntry.totalHours && timeEntry.totalHours > 10) {
    anomalies.push(`Shift très long (${formatDuration(timeEntry.totalHours)})`);
  }

  // Shift très court
  if (timeEntry.totalHours && timeEntry.totalHours < 2) {
    anomalies.push(`Shift très court (${formatDuration(timeEntry.totalHours)})`);
  }

  // Erreurs enregistrées
  if (timeEntry.hasError && timeEntry.errorMessage) {
    anomalies.push(timeEntry.errorMessage);
  }

  return anomalies;
}

/**
 * Calcule le total d'heures pour une période complète (du 1er au dernier jour)
 * @param timeEntries - Liste des time entries
 * @param startDate - Date de début
 * @param endDate - Date de fin
 * @returns Total d'heures sur la période
 */
export function calculatePeriodHours(
  timeEntries: Partial<TimeEntryDocument>[],
  startDate: Date,
  endDate: Date
): number {
  const start = getStartOfDay(startDate);
  const end = getEndOfDay(endDate);

  return timeEntries
    .filter(entry => {
      if (!entry.date) return false;
      const entryDate = new Date(entry.date);
      return entryDate >= start && entryDate <= end;
    })
    .reduce((total, entry) => total + (entry.totalHours || 0), 0);
}
