/**
 * Utilitaires de dates avec timezone Europe/Paris
 *
 * IMPORTANT : Toujours utiliser ces fonctions au lieu de new Date()
 * pour éviter les décalages timezone en production (Vercel = UTC)
 */

/**
 * Retourne la date du jour au format YYYY-MM-DD (timezone Paris)
 *
 * @returns Date string "YYYY-MM-DD" (ex: "2026-02-01")
 *
 * @example
 * const today = getTodayParis() // "2026-02-01"
 */
export function getTodayParis(): string {
  const now = new Date()
  const parisDate = new Intl.DateTimeFormat('fr-FR', {
    timeZone: 'Europe/Paris',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(now).split('/').reverse().join('-')  // DD/MM/YYYY → YYYY-MM-DD

  return parisDate
}

/**
 * Retourne l'heure actuelle au format HH:mm (timezone Paris)
 *
 * @returns Time string "HH:mm" (ex: "14:30")
 *
 * @example
 * const time = getNowTimeParis() // "14:30"
 */
export function getNowTimeParis(): string {
  const now = new Date()
  const parisTime = new Intl.DateTimeFormat('fr-FR', {
    timeZone: 'Europe/Paris',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(now)

  return parisTime
}

/**
 * Retourne la date et l'heure actuelles (timezone Paris)
 *
 * @returns Object avec date (YYYY-MM-DD) et time (HH:mm)
 *
 * @example
 * const { date, time } = getNowParis()
 * // { date: "2026-02-01", time: "14:30" }
 */
export function getNowParis(): { date: string; time: string } {
  return {
    date: getTodayParis(),
    time: getNowTimeParis()
  }
}
