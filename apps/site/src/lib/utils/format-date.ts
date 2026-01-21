/**
 * Date Formatting Utilities - apps/site
 * Fonctions pour manipuler et formater les dates
 *
 * RÈGLE: Toujours utiliser des strings (YYYY-MM-DD, HH:mm)
 * Jamais de timestamps ISO pour éviter les bugs de timezone
 */

/**
 * Formater Date → String YYYY-MM-DD
 * @param date Date object
 * @returns String au format YYYY-MM-DD
 * @example formatDate(new Date('2026-01-21')) => '2026-01-21'
 */
export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Formater Date → String HH:mm
 * @param date Date object
 * @returns String au format HH:mm
 * @example formatTime(new Date('2026-01-21T09:30:00')) => '09:30'
 */
export function formatTime(date: Date): string {
  return date.toTimeString().slice(0, 5);
}

/**
 * Parser String YYYY-MM-DD → Date
 * @param dateStr String au format YYYY-MM-DD
 * @returns Date object à minuit (UTC)
 * @example parseDate('2026-01-21') => Date object
 */
export function parseDate(dateStr: string): Date {
  return new Date(dateStr + 'T00:00:00');
}

/**
 * Parser Date + Time → Date
 * @param date String au format YYYY-MM-DD
 * @param time String au format HH:mm
 * @returns Date object
 * @example parseDateTime('2026-01-21', '09:30') => Date object
 */
export function parseDateTime(date: string, time: string): Date {
  return new Date(`${date}T${time}:00`);
}

/**
 * Calculer différence en heures entre deux horaires
 * @param startTime String au format HH:mm
 * @param endTime String au format HH:mm
 * @returns Nombre d'heures (décimal)
 * @example calculateHours('09:00', '17:30') => 8.5
 */
export function calculateHours(startTime: string, endTime: string): number {
  const start = new Date(`2000-01-01T${startTime}`);
  const end = new Date(`2000-01-01T${endTime}`);
  const diffMs = end.getTime() - start.getTime();
  return diffMs / (1000 * 60 * 60);
}

/**
 * Formater date en français lisible
 * @param dateStr String au format YYYY-MM-DD
 * @returns String formaté (ex: "21 janvier 2026")
 * @example formatDateFr('2026-01-21') => '21 janvier 2026'
 */
export function formatDateFr(dateStr: string): string {
  const date = parseDate(dateStr);
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Formater date en français court
 * @param dateStr String au format YYYY-MM-DD
 * @returns String formaté (ex: "21/01/2026")
 * @example formatDateShortFr('2026-01-21') => '21/01/2026'
 */
export function formatDateShortFr(dateStr: string): string {
  const date = parseDate(dateStr);
  return date.toLocaleDateString('fr-FR');
}

/**
 * Obtenir la date du jour au format YYYY-MM-DD
 * @returns String au format YYYY-MM-DD
 * @example getToday() => '2026-01-21'
 */
export function getToday(): string {
  return formatDate(new Date());
}

/**
 * Ajouter des jours à une date
 * @param dateStr String au format YYYY-MM-DD
 * @param days Nombre de jours à ajouter
 * @returns String au format YYYY-MM-DD
 * @example addDays('2026-01-21', 7) => '2026-01-28'
 */
export function addDays(dateStr: string, days: number): string {
  const date = parseDate(dateStr);
  date.setDate(date.getDate() + days);
  return formatDate(date);
}

/**
 * Vérifier si une date est dans le passé
 * @param dateStr String au format YYYY-MM-DD
 * @returns true si la date est dans le passé
 * @example isPastDate('2020-01-01') => true
 */
export function isPastDate(dateStr: string): boolean {
  const date = parseDate(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < today;
}

/**
 * Vérifier si une date est aujourd'hui
 * @param dateStr String au format YYYY-MM-DD
 * @returns true si la date est aujourd'hui
 * @example isToday('2026-01-21') => true (si aujourd'hui)
 */
export function isToday(dateStr: string): boolean {
  return dateStr === getToday();
}

/**
 * Obtenir le nom du jour de la semaine
 * @param dateStr String au format YYYY-MM-DD
 * @returns Nom du jour en français
 * @example getDayName('2026-01-21') => 'mercredi'
 */
export function getDayName(dateStr: string): string {
  const date = parseDate(dateStr);
  return date.toLocaleDateString('fr-FR', { weekday: 'long' });
}

/**
 * Formater une plage de dates
 * @param startDate String au format YYYY-MM-DD
 * @param endDate String au format YYYY-MM-DD
 * @returns String formaté
 * @example formatDateRange('2026-01-21', '2026-01-23') => 'du 21 au 23 janvier 2026'
 */
export function formatDateRange(startDate: string, endDate: string): string {
  const start = parseDate(startDate);
  const end = parseDate(endDate);

  const startDay = start.getDate();
  const endDay = end.getDate();
  const month = start.toLocaleDateString('fr-FR', { month: 'long' });
  const year = start.getFullYear();

  if (start.getMonth() === end.getMonth()) {
    return `du ${startDay} au ${endDay} ${month} ${year}`;
  }

  return `du ${formatDateFr(startDate)} au ${formatDateFr(endDate)}`;
}

/**
 * Calculer l'âge à partir d'une date de naissance
 * @param birthDate String au format YYYY-MM-DD
 * @returns Âge en années
 * @example calculateAge('2000-01-21') => 26
 */
export function calculateAge(birthDate: string): number {
  const birth = parseDate(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age;
}
