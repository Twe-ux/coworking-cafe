/**
 * Utilitaires pour le calendrier
 */

/**
 * Normaliser une date au timezone français
 */
export function getFrenchDate(date: Date | string): Date {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Date(d.toLocaleString('en-US', { timeZone: 'Europe/Paris' }))
}

/**
 * Calculer le premier jour du mois
 */
export function getFirstDayOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

/**
 * Calculer le dernier jour du mois
 */
export function getLastDayOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0)
}

/**
 * Calculer la date de début du calendrier (premier lundi visible)
 */
export function getCalendarStartDate(firstDayOfMonth: Date): Date {
  const start = new Date(firstDayOfMonth)
  // Ajuster pour commencer par lundi (1) au lieu de dimanche (0)
  const dayOfWeek = firstDayOfMonth.getDay()
  const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1
  start.setDate(start.getDate() - daysToSubtract)
  return start
}

/**
 * Générer tous les jours visibles dans le calendrier
 * Retourne un tableau de dates incluant les jours du mois précédent/suivant
 */
export function generateCalendarDays(currentDate: Date): Date[] {
  const firstDayOfMonth = getFirstDayOfMonth(currentDate)
  const startDate = getCalendarStartDate(firstDayOfMonth)

  const days: Date[] = []
  const current = new Date(startDate)

  let weeksAdded = 0
  const maxWeeks = 6 // Limite de sécurité

  while (weeksAdded < maxWeeks) {
    const weekDays: Date[] = []

    // Générer 7 jours pour cette semaine
    for (let dayInWeek = 0; dayInWeek < 7; dayInWeek++) {
      weekDays.push(new Date(current))
      current.setDate(current.getDate() + 1)
    }

    // Vérifier si cette semaine contient au moins un jour du mois courant
    const hasCurrentMonthDay = weekDays.some(
      (day) =>
        day.getMonth() === currentDate.getMonth() &&
        day.getFullYear() === currentDate.getFullYear()
    )

    if (hasCurrentMonthDay) {
      // Ajouter cette semaine car elle contient au moins un jour du mois
      days.push(...weekDays)
      weeksAdded++
    } else if (weeksAdded > 0) {
      // Si on a déjà ajouté des semaines et qu'aucun jour de cette semaine
      // n'est dans le mois courant, on s'arrête
      break
    } else {
      // Si c'est la première semaine et qu'elle ne contient aucun jour du mois,
      // on continue (cas peu probable avec notre calcul de startDate)
      days.push(...weekDays)
      weeksAdded++
    }
  }

  return days
}

/**
 * Grouper les jours par semaine
 */
export function groupDaysByWeek(days: Date[]): Date[][] {
  const weeks: Date[][] = []
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7))
  }
  return weeks
}

/**
 * Formater le mois et l'année
 */
export function formatMonthYear(date: Date): string {
  return date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
}

/**
 * Vérifier si une date est aujourd'hui
 */
export function isToday(date: Date): boolean {
  const today = new Date()
  return date.toDateString() === today.toDateString()
}

/**
 * Vérifier si une date appartient au mois courant
 */
export function isCurrentMonth(date: Date, currentDate: Date): boolean {
  return (
    date.getMonth() === currentDate.getMonth() &&
    date.getFullYear() === currentDate.getFullYear()
  )
}

/**
 * Helper to normalize date to YYYY-MM-DD string
 */
function formatDateToYMD(date: Date | string): string {
  if (typeof date === 'string') {
    return date.split('T')[0]
  }
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Filtrer les données pour une date spécifique
 */
export function getDataForDate<T>(
  data: T[],
  date: Date,
  getDateForData: (item: T) => Date | string
): T[] {
  const normalizedDateStr = formatDateToYMD(date)

  return data.filter((item) => {
    const itemDate = getDateForData(item)
    const itemDateStr = formatDateToYMD(itemDate)
    return itemDateStr === normalizedDateStr
  })
}

/**
 * Obtenir le début de la semaine (lundi)
 */
export function getWeekStart(date: Date): Date {
  const d = getFrenchDate(date)
  const day = d.getDay()
  const dayAdjusted = day === 0 ? 6 : day - 1
  const diff = d.getDate() - dayAdjusted
  const weekStart = new Date(d.setDate(diff))
  weekStart.setHours(0, 0, 0, 0)
  return weekStart
}

/**
 * Obtenir la fin de la semaine (dimanche)
 */
export function getWeekEnd(date: Date): Date {
  const weekStart = getWeekStart(date)
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekEnd.getDate() + 6)
  weekEnd.setHours(23, 59, 59, 999)
  return weekEnd
}
