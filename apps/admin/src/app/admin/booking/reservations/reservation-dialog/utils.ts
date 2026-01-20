// Utilitaires pour ReservationDialog

import type { SpaceConfiguration, ReservationType } from "@/types/booking"
import type { ReservationFormData } from "./types"

/**
 * Calcule le prix d'une réservation selon le type et l'espace
 */
export function calculateReservationPrice(
  space: SpaceConfiguration | undefined,
  reservationType: ReservationType,
  numberOfPeople: number
): number {
  if (!space) return 0

  let price = 0

  switch (reservationType) {
    case "hourly":
      price = space.pricing.hourly * numberOfPeople
      break
    case "daily":
      price = space.pricing.daily * numberOfPeople
      break
    case "weekly":
      price = space.pricing.weekly * numberOfPeople
      break
    case "monthly":
      price = space.pricing.monthly * numberOfPeople
      break
  }

  return price
}

/**
 * Initialise les données du formulaire pour une nouvelle réservation
 */
export function getInitialFormData(): ReservationFormData {
  const today = new Date().toISOString().split("T")[0]

  return {
    spaceId: "",
    clientName: "",
    clientEmail: "",
    reservationType: "daily",
    startDate: today,
    endDate: today,
    startTime: "09:00",
    endTime: "18:00",
    numberOfPeople: 1,
    status: "pending",
    totalPrice: 0,
    depositPaid: 0,
    notes: "",
  }
}

/**
 * Convertit une réservation existante en données de formulaire
 */
export function bookingToFormData(booking: {
  spaceId: string
  clientName?: string
  clientEmail?: string
  reservationType: ReservationType
  startDate: string
  endDate: string
  startTime?: string
  endTime?: string
  numberOfPeople: number
  status: "pending" | "confirmed" | "cancelled" | "completed"
  totalPrice: number
  depositPaid?: number
  notes?: string
}): ReservationFormData {
  return {
    spaceId: booking.spaceId,
    clientName: booking.clientName || "",
    clientEmail: booking.clientEmail || "",
    reservationType: booking.reservationType,
    startDate: booking.startDate,
    endDate: booking.endDate,
    startTime: booking.startTime || "",
    endTime: booking.endTime || "",
    numberOfPeople: booking.numberOfPeople,
    status: booking.status,
    totalPrice: booking.totalPrice,
    depositPaid: booking.depositPaid || 0,
    notes: booking.notes || "",
  }
}
