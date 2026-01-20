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
 */
export function getStatusVariant(
  status: BookingStatus
): "default" | "secondary" | "destructive" | "outline" {
  const variants: Record<BookingStatus, "default" | "secondary" | "destructive" | "outline"> = {
    pending: "secondary",
    confirmed: "default",
    cancelled: "destructive",
    completed: "outline",
  }
  return variants[status]
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
