/**
 * Utilitaires pour le système de planning
 */

import type { ShiftDocument } from '@/models/shift';

/**
 * Formate une heure au format HH:MM
 * @param date - Date à formater
 * @returns Heure formatée (ex: "09:30")
 */
export function formatTime(date: Date): string {
  return new Intl.DateTimeFormat('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Paris',
  }).format(date);
}

/**
 * Formate une date au format français
 * @param date - Date à formater
 * @returns Date formatée (ex: "15/03/2024")
 */
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('fr-FR', {
    timeZone: 'Europe/Paris',
  }).format(date);
}

/**
 * Formate une date et heure complète
 * @param date - Date à formater
 * @returns Date et heure formatées (ex: "15/03/2024 à 14:30")
 */
export function formatDateTime(date: Date): string {
  return `${formatDate(date)} à ${formatTime(date)}`;
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
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    23,
    59,
    59,
    999
  );
}

/**
 * Obtient le début de la semaine (lundi) pour une date donnée
 * @param date - Date source
 * @returns Date du lundi de la semaine
 */
export function getStartOfWeek(date: Date = new Date()): Date {
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Lundi
  return new Date(date.getFullYear(), date.getMonth(), diff);
}

/**
 * Obtient la fin de la semaine (dimanche) pour une date donnée
 * @param date - Date source
 * @returns Date du dimanche de la semaine
 */
export function getEndOfWeek(date: Date = new Date()): Date {
  const startOfWeek = getStartOfWeek(date);
  return new Date(
    startOfWeek.getFullYear(),
    startOfWeek.getMonth(),
    startOfWeek.getDate() + 6
  );
}

/**
 * Calcule la durée en heures entre deux horaires (format HH:MM)
 * @param startTime - Heure de début (ex: "09:00")
 * @param endTime - Heure de fin (ex: "17:00")
 * @returns Nombre d'heures (peut être décimal)
 */
export function calculateDuration(startTime: string, endTime: string): number {
  const start = new Date(`2000-01-01 ${startTime}`);
  let end = new Date(`2000-01-01 ${endTime}`);

  // Gérer les créneaux qui passent minuit
  if (end <= start) {
    end.setDate(end.getDate() + 1);
  }

  const durationMs = end.getTime() - start.getTime();
  return durationMs / (1000 * 60 * 60);
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
 * Vérifie si un shift est le matin (avant 14:30)
 * @param startTime - Heure de début du shift (format HH:MM)
 * @returns true si le shift est le matin
 */
export function isMorningShift(startTime: string): boolean {
  const [hours, minutes] = startTime.split(':').map(Number);
  const totalMinutes = hours * 60 + minutes;
  const cutoffMinutes = 14 * 60 + 30; // 14:30

  return totalMinutes < cutoffMinutes;
}

/**
 * Vérifie si un shift est l'après-midi (après ou égal à 14:30)
 * @param startTime - Heure de début du shift (format HH:MM)
 * @returns true si le shift est l'après-midi
 */
export function isAfternoonShift(startTime: string): boolean {
  return !isMorningShift(startTime);
}

/**
 * Groupe les shifts par date
 * @param shifts - Liste des shifts
 * @returns Map groupée par date (string YYYY-MM-DD)
 */
export function groupShiftsByDate(shifts: ShiftDocument[]): Map<string, ShiftDocument[]> {
  const grouped = new Map<string, ShiftDocument[]>();

  shifts.forEach((shift) => {
    const dateKey = shift.date.toISOString().split('T')[0];
    if (!grouped.has(dateKey)) {
      grouped.set(dateKey, []);
    }
    grouped.get(dateKey)!.push(shift);
  });

  return grouped;
}

/**
 * Groupe les shifts par employé
 * @param shifts - Liste des shifts
 * @returns Map groupée par employé ID
 */
export function groupShiftsByEmployee(shifts: ShiftDocument[]): Map<string, ShiftDocument[]> {
  const grouped = new Map<string, ShiftDocument[]>();

  shifts.forEach((shift) => {
    const employeeId = shift.employeeId.toString();
    if (!grouped.has(employeeId)) {
      grouped.set(employeeId, []);
    }
    grouped.get(employeeId)!.push(shift);
  });

  return grouped;
}

/**
 * Calcule le total d'heures pour une liste de shifts
 * @param shifts - Liste des shifts
 * @returns Nombre total d'heures
 */
export function calculateTotalHours(shifts: ShiftDocument[]): number {
  return shifts.reduce((total, shift) => {
    const duration = calculateDuration(shift.startTime, shift.endTime);
    return total + duration;
  }, 0);
}

/**
 * Génère un tableau de dates pour une semaine
 * @param startDate - Date de début (lundi)
 * @returns Tableau de 7 dates (lundi à dimanche)
 */
export function getWeekDates(startDate: Date): Date[] {
  const dates: Date[] = [];
  const start = getStartOfDay(startDate);

  for (let i = 0; i < 7; i++) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    dates.push(date);
  }

  return dates;
}

/**
 * Obtient le nom du jour en français
 * @param date - Date
 * @returns Nom du jour (ex: "Lundi")
 */
export function getDayName(date: Date): string {
  return new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    timeZone: 'Europe/Paris',
  }).format(date);
}

/**
 * Obtient le nom du jour court en français
 * @param date - Date
 * @returns Nom du jour court (ex: "Lun")
 */
export function getShortDayName(date: Date): string {
  return new Intl.DateTimeFormat('fr-FR', {
    weekday: 'short',
    timeZone: 'Europe/Paris',
  }).format(date);
}

/**
 * Vérifie si deux shifts se chevauchent
 * @param shift1 - Premier shift
 * @param shift2 - Deuxième shift
 * @returns true si les shifts se chevauchent
 */
export function shiftsOverlap(shift1: ShiftDocument, shift2: ShiftDocument): boolean {
  // Pas de chevauchement si ce n'est pas le même jour
  if (shift1.date.toDateString() !== shift2.date.toDateString()) {
    return false;
  }

  const start1 = new Date(`2000-01-01 ${shift1.startTime}`);
  let end1 = new Date(`2000-01-01 ${shift1.endTime}`);
  const start2 = new Date(`2000-01-01 ${shift2.startTime}`);
  let end2 = new Date(`2000-01-01 ${shift2.endTime}`);

  // Gérer les shifts qui passent minuit
  if (end1 <= start1) {
    end1.setDate(end1.getDate() + 1);
  }
  if (end2 <= start2) {
    end2.setDate(end2.getDate() + 1);
  }

  return start1 < end2 && end1 > start2;
}

/**
 * Valide qu'un horaire est au bon format HH:MM
 * @param time - Horaire à valider
 * @returns true si le format est valide
 */
export function validateTimeFormat(time: string): boolean {
  return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time);
}
