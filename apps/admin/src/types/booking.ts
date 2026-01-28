// Types pour le module Booking (espaces + réservations)

// ===== Space Configuration =====

export interface PricingTier {
  minPeople: number
  maxPeople: number
  hourlyRate: number
  dailyRate: number
  extraPersonHourly?: number
  extraPersonDaily?: number
}

export interface PricingStructure {
  hourly: number
  daily: number
  weekly: number
  monthly: number
  perPerson: boolean
  maxHoursBeforeDaily?: number
  dailyRatePerPerson?: number
  tiers?: PricingTier[]
}

export interface AvailableReservationTypes {
  hourly: boolean
  daily: boolean
  weekly: boolean
  monthly: boolean
}

export interface DepositPolicy {
  enabled: boolean
  percentage?: number
  fixedAmount?: number
  minimumAmount?: number
}

export type SpaceType = "open-space" | "salle-verriere" | "salle-etage" | "evenementiel"

export interface SpaceConfiguration {
  _id?: string
  spaceType: SpaceType
  name: string
  slug: string
  description?: string
  pricing: PricingStructure
  availableReservationTypes: AvailableReservationTypes
  requiresQuote: boolean
  depositPolicy?: DepositPolicy
  minCapacity: number
  maxCapacity: number
  isActive: boolean
  imageUrl?: string
  displayOrder: number
  features?: string[]
  createdAt?: string
  updatedAt?: string
  isDeleted?: boolean
}

export interface SpaceConfigurationFormData extends Omit<SpaceConfiguration, '_id' | 'createdAt' | 'updatedAt'> {}

// ===== Bookings (Réservations) =====

export type BookingStatus =
  | "pending"      // En attente de confirmation
  | "confirmed"    // Confirmée
  | "cancelled"    // Annulée
  | "completed"    // Terminée

export type ReservationType = "hourly" | "daily" | "weekly" | "monthly"

export type CaptureMethod = "automatic" | "manual" | "deferred"

export interface Booking {
  _id?: string
  spaceId: string
  spaceName?: string // Denormalized pour affichage
  clientId: string
  clientName?: string // Denormalized pour affichage
  clientEmail?: string
  clientPhone?: string
  clientCompany?: string // Société du client
  reservationType: ReservationType
  startDate: string // YYYY-MM-DD
  endDate: string // YYYY-MM-DD
  startTime?: string // HH:mm (pour hourly)
  endTime?: string // HH:mm (pour hourly)
  numberOfPeople: number
  status: BookingStatus
  totalPrice: number
  depositPaid?: number
  captureMethod?: CaptureMethod // Type de capture: automatic = paiement direct, manual/deferred = empreinte CB
  depositAmount?: number // Montant de l'acompte requis
  depositRequired?: boolean // Acompte requis (pour réservations admin)
  depositFileUrl?: string // URL fichier devis uploadé (Cloudinary)
  isAdminBooking?: boolean // true si réservation créée par admin (pas d'empreinte CB)
  notes?: string
  createdAt?: string
  updatedAt?: string
  cancelledAt?: string
  cancelReason?: string
}

export interface BookingFormData extends Omit<Booking, '_id' | 'createdAt' | 'updatedAt' | 'cancelledAt'> {}

export interface BookingFilter {
  spaceId?: string
  clientId?: string
  status?: BookingStatus
  startDate?: string
  endDate?: string
}
