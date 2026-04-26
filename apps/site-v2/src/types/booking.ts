import type { IconName } from "@/components/ui/Icon"

export type BookingType = "hourly" | "daily" | "weekly" | "monthly"
export type BookingStep = 0 | 1 | 2 | 3 | 4

export interface Space {
  id: string
  name: string
  description: string
  pricePerHour: number
  maxPeople: number
  icon: IconName
}

export interface BookingService {
  id: string
  label: string
  price: number
  icon: IconName
}

export interface BookingState {
  venueId: string | null
  spaceId: string | null
  bookingType: BookingType
  date: string | null        // "YYYY-MM-DD"
  startTime: string | null   // "HH:mm"
  people: number
  services: string[]         // service ids
  specialRequest: string
  step: BookingStep
}

export interface PriceBreakdown {
  base: number
  servicesTotal: number
  total: number
  discount: number           // 0, 0.15 or 0.40
  hours: number
}

export const SPACES: Space[] = [
  { id: "open-space", name: "Open Space", description: "Bureau partagé face aux grandes fenêtres", pricePerHour: 9, maxPeople: 1, icon: "monitor" },
  { id: "salle-verriere", name: "Salle Verrière", description: "Lumière naturelle, 6 à 8 personnes", pricePerHour: 24, maxPeople: 8, icon: "users" },
  { id: "salle-etage", name: "Salle Étage", description: "Salle de réunion fermée, 4 personnes", pricePerHour: 30, maxPeople: 4, icon: "layout" },
  { id: "evenementiel", name: "Espace Événementiel", description: "Privatisation complète, événements", pricePerHour: 80, maxPeople: 50, icon: "star" },
]

export const BOOKING_SERVICES: BookingService[] = [
  { id: "coffee", label: "Café illimité", price: 5, icon: "coffee" },
  { id: "lunch", label: "Déjeuner traiteur", price: 14, icon: "utensils" },
  { id: "parking", label: "Place de parking", price: 8, icon: "car" },
  { id: "screen", label: "Écran additionnel", price: 10, icon: "monitor" },
]

export const TYPE_MULTIPLIERS: Record<BookingType, number> = {
  hourly: 1,
  daily: 10,    // forfait 10h
  weekly: 0.85,
  monthly: 0.60,
}

export const TYPE_LABELS: Record<BookingType, { label: string; sublabel: string }> = {
  hourly: { label: "Horaire", sublabel: "À la carte" },
  daily: { label: "Journée", sublabel: "9h — 19h" },
  weekly: { label: "Semaine", sublabel: "-15%" },
  monthly: { label: "Mois", sublabel: "-40%" },
}
