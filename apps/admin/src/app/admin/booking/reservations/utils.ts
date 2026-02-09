import type { BookingStatus } from "@/types/booking"

/**
 * Retourne le label français d'un statut de réservation
 */
export function getStatusLabel(status: BookingStatus): string {
  const labels: Record<BookingStatus, string> = {
    pending: "En attente",
    confirmed: "Confirmée",
    cancelled: "Annulée",
    completed: "Terminée",
  }
  return labels[status]
}

/**
 * Retourne la variante de badge appropriée pour un statut
 * - pending (En attente) → orange
 * - confirmed (Confirmée) → vert
 * - cancelled (Annulée) → rouge
 * - completed (Terminée) → bleu/gris
 */
export function getStatusVariant(
  status: BookingStatus
): "default" | "secondary" | "destructive" | "outline" | "success" | "warning" {
  const variants: Record<BookingStatus, "default" | "secondary" | "destructive" | "outline" | "success" | "warning"> = {
    pending: "warning", // Orange
    confirmed: "success", // Vert
    cancelled: "destructive", // Rouge
    completed: "outline", // Gris
  }
  return variants[status]
}

/**
 * Retourne la classe CSS pour le badge de statut (style outline comme /admin/users)
 */
export function getStatusBadgeClass(status: BookingStatus): string {
  const classes: Record<BookingStatus, string> = {
    pending: "bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-50",
    confirmed: "bg-green-50 text-green-700 border-green-200 hover:bg-green-50",
    cancelled: "bg-red-50 text-red-700 border-red-200 hover:bg-red-50",
    completed: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-50",
  }
  return classes[status]
}

/**
 * Retourne la classe CSS pour le badge de type de réservation
 */
export function getReservationTypeBadgeClass(type: string): string {
  const classes: Record<string, string> = {
    hourly: "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-50",
    daily: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-50",
    weekly: "bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-50",
    monthly: "bg-violet-50 text-violet-700 border-violet-200 hover:bg-violet-50",
  }
  return classes[type] || "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-50"
}

/**
 * Retourne le label français d'un type de réservation
 */
export function getReservationTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    hourly: "Horaire",
    daily: "Journée",
    weekly: "Semaine",
    monthly: "Mois",
  }
  return labels[type] || type
}

/**
 * Formate une date au format français (JJ/MM/AAAA)
 */
export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

/**
 * Formate un prix en euros
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(price)
}

/**
 * Calcule la durée en heures entre deux horaires (format HH:mm)
 */
export function calculateDuration(startTime: string, endTime: string): number {
  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);

  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;

  return (endMinutes - startMinutes) / 60;
}

/**
 * Détermine le type de réservation selon la durée
 * - Si reservationType est weekly/monthly, le garder
 * - endTime vide ou absent : "daily" (forfait jour)
 * - 1h à 5h : "hourly"
 * - > 5h : "daily"
 */
export function getCalculatedReservationType(startTime?: string, endTime?: string, reservationType?: string): string {
  // Si reservationType existe et est weekly/monthly, le garder
  if (reservationType === 'weekly') return 'weekly';
  if (reservationType === 'monthly') return 'monthly';

  // Si endTime vide ou absent → forfait jour
  if (!endTime || endTime.trim() === '') return 'daily';

  // Si pas de startTime → forfait jour
  if (!startTime) return 'daily';

  const duration = calculateDuration(startTime, endTime);

  return duration > 5 ? 'daily' : 'hourly';
}

/**
 * Formate l'affichage des horaires selon la durée
 * - 1h à 5h : affiche "10:00-13:30"
 * - > 5h et endTime !== 20:00 : affiche "Journée (10:00-17:00)"
 * - > 5h et endTime === 20:00 : affiche "Journée"
 */
export function formatTimeDisplay(startTime?: string, endTime?: string): string {
  if (!startTime) return '';
  if (!endTime) return startTime;

  const duration = calculateDuration(startTime, endTime);

  // Forfait heure (1h à 5h)
  if (duration <= 5) {
    return `${startTime}-${endTime}`;
  }

  // Forfait journée (> 5h)
  // Si fermeture à 20h, pas besoin d'afficher l'heure de fin
  if (endTime === '20:00') {
    return 'Journée';
  }

  return `Journée (${startTime}-${endTime})`;
}
