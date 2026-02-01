// ============================================================================
// BOOKING TYPES - CoworKing Café
// ============================================================================
// Typed interfaces for the booking flow to eliminate `any` types
// Created: 2026-01-29
// ============================================================================

/**
 * Space Types
 * Types d'espaces disponibles dans le coworking café
 */
export type SpaceType =
  | "open-space"
  | "meeting-room-glass"
  | "meeting-room-floor"
  | "event-space";

/**
 * Reservation Types
 * Types de réservation (tarification)
 */
export type ReservationType = "hourly" | "daily" | "weekly" | "monthly";

/**
 * Booking Status
 * États possibles d'une réservation
 */
export type BookingStatus =
  | "pending"
  | "confirmed"
  | "cancelled"
  | "completed"
  | "no-show";

/**
 * Payment Status
 * États possibles d'un paiement
 */
export type PaymentStatus =
  | "pending"
  | "authorized"
  | "captured"
  | "failed"
  | "refunded"
  | "partially_refunded";

/**
 * Additional Service Price Unit
 * Unité de prix pour les services additionnels
 */
export type PriceUnit = "per-person" | "flat-rate";

/**
 * Space Type Info
 * Informations d'affichage pour chaque type d'espace
 */
export interface SpaceTypeInfo {
  title: string;
  subtitle: string;
}

/**
 * Booking Data
 * Données principales d'une réservation
 */
export interface BookingData {
  // Space information
  spaceType: SpaceType;
  reservationType: ReservationType;

  // Date & Time (ALWAYS strings in YYYY-MM-DD and HH:mm format)
  date: string; // Format: YYYY-MM-DD
  startTime: string; // Format: HH:mm
  endTime: string; // Format: HH:mm
  endDate?: string; // Format: YYYY-MM-DD (for weekly/monthly reservations)
  duration: string; // Human-readable duration (e.g., "2h30")

  // Pricing
  basePrice: number; // Prix de base en euros
  isDailyRate?: boolean; // Si tarif à la journée activé

  // Participants
  numberOfPeople: number;

  // Contact Information (filled in step 3)
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  contactCompanyName?: string;
  specialRequests?: string;

  // Account creation (optional)
  createAccount?: boolean;
  subscribeNewsletter?: boolean;
  password?: string;
}

/**
 * Additional Service
 * Service additionnel disponible (nourriture, boissons, équipements)
 */
export interface AdditionalService {
  _id: string;
  name: string;
  description?: string;
  category: string; // e.g., "food", "drinks", "equipment"
  price: number; // Prix TTC en euros
  dailyPrice?: number; // Prix journée si applicable
  priceUnit: PriceUnit; // "per-person" ou "flat-rate"
  vatRate: number; // Taux de TVA (e.g., 20 pour 20%)
  icon?: string; // Icône Bootstrap ou emoji
  isActive?: boolean; // Service actif ou non
}

/**
 * Selected Service
 * Service additionnel sélectionné par l'utilisateur avec sa quantité
 */
export interface SelectedService {
  service: AdditionalService;
  quantity: number;
}

/**
 * Selected Services Map
 * Map des services sélectionnés (clé = serviceId)
 */
export type SelectedServicesMap = Map<string, SelectedService>;

/**
 * Price Breakdown
 * Détail des prix d'une réservation
 */
export interface PriceBreakdown {
  // Base
  basePrice: number; // Prix de base de la réservation (HT)
  basePriceVAT: number; // TVA sur le prix de base
  basePriceTTC: number; // Prix de base TTC

  // Services
  servicesPrice: number; // Total services (HT)
  servicesPriceVAT: number; // TVA sur les services
  servicesPriceTTC: number; // Total services TTC

  // Totals
  totalHT: number; // Total HT (base + services)
  totalVAT: number; // Total TVA
  totalTTC: number; // Total TTC (à payer)

  // Discount (if promo code applied)
  discountAmount?: number; // Montant de la réduction
  promoCode?: string; // Code promo utilisé
}

/**
 * Service Price Detail
 * Détail du prix d'un service individuel
 */
export interface ServicePriceDetail {
  serviceId: string;
  serviceName: string;
  quantity: number;
  unitPrice: number; // Prix unitaire HT
  unitPriceTTC: number; // Prix unitaire TTC
  totalHT: number; // Total HT (unitPrice * quantity)
  totalVAT: number; // Total TVA
  totalTTC: number; // Total TTC
  vatRate: number; // Taux de TVA
}

/**
 * Booking Form Data
 * Données du formulaire de réservation (étape 1)
 */
export interface BookingFormData {
  spaceType: SpaceType;
  reservationType: ReservationType;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  numberOfPeople: number;
}

/**
 * Contact Form Data
 * Données du formulaire de contact (étape 3)
 */
export interface ContactFormData {
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  contactCompanyName?: string;
  specialRequests?: string;
  createAccount?: boolean;
  subscribeNewsletter?: boolean;
  password?: string;
  confirmPassword?: string;
}

/**
 * Validation Errors
 * Erreurs de validation des formulaires
 */
export interface ValidationErrors {
  spaceType?: string;
  reservationType?: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  numberOfPeople?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
}

/**
 * Payment Intent Data
 * Données du Payment Intent Stripe
 */
export interface PaymentIntentData {
  clientSecret: string;
  paymentIntentId: string;
  amount: number; // En centimes
  currency: string; // e.g., "eur"
}

/**
 * Booking Creation Payload
 * Payload pour créer une réservation via l'API
 */
export interface BookingCreationPayload {
  // Space & Time
  spaceType: SpaceType;
  reservationType: ReservationType;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  numberOfPeople: number;

  // Contact
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  contactCompanyName?: string;
  specialRequests?: string;

  // Services
  selectedServices?: Array<{
    serviceId: string;
    quantity: number;
  }>;

  // Account
  createAccount?: boolean;
  subscribeNewsletter?: boolean;
  password?: string;

  // Payment
  paymentIntentId?: string;
}

/**
 * Booking Response
 * Réponse de l'API après création/mise à jour d'une réservation
 */
export interface BookingResponse {
  success: boolean;
  data?: {
    booking: {
      _id: string;
      userId: string;
      spaceType: SpaceType;
      reservationType: ReservationType;
      date: string;
      startTime: string;
      endTime: string;
      numberOfPeople: number;
      basePrice: number;
      servicesPrice: number;
      totalPrice: number;
      status: BookingStatus;
      paymentStatus?: PaymentStatus;
      createdAt: Date;
      updatedAt: Date;
    };
    paymentIntent?: PaymentIntentData;
  };
  error?: string;
}

/**
 * Availability Check Payload
 * Payload pour vérifier la disponibilité
 */
export interface AvailabilityCheckPayload {
  spaceType: SpaceType;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
}

/**
 * Availability Response
 * Réponse de l'API pour vérification de disponibilité
 */
export interface AvailabilityResponse {
  success: boolean;
  data?: {
    available: boolean;
    conflicts?: Array<{
      bookingId: string;
      startTime: string;
      endTime: string;
    }>;
  };
  error?: string;
}

/**
 * Additional Services Response
 * Réponse de l'API pour récupérer les services additionnels
 */
export interface AdditionalServicesResponse {
  success: boolean;
  data?: AdditionalService[];
  error?: string;
}

/**
 * Calculate Price Payload
 * Payload pour calculer le prix d'une réservation
 */
export interface CalculatePricePayload {
  spaceType: SpaceType;
  reservationType: ReservationType;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  numberOfPeople: number;
  selectedServices?: Array<{
    serviceId: string;
    quantity: number;
  }>;
  promoCode?: string;
}

/**
 * Calculate Price Response
 * Réponse de l'API pour calcul de prix
 */
export interface CalculatePriceResponse {
  success: boolean;
  data?: {
    breakdown: PriceBreakdown;
    services: ServicePriceDetail[];
  };
  error?: string;
}

/**
 * Stripe Elements Options
 * Options pour Stripe Elements
 */
export interface StripeElementsOptions {
  clientSecret: string;
  appearance?: {
    theme?: "stripe" | "night" | "flat";
    variables?: Record<string, string>;
  };
}

/**
 * Payment Form Props
 * Props pour le composant de paiement
 */
export interface PaymentFormProps {
  bookingId?: string;
  intentType: "manual_capture" | "setup_intent";
  bookingData: BookingData;
  onSuccess: () => void;
  onError: (error: string) => void;
  acceptedTerms: boolean;
}

/**
 * Booking Summary Props
 * Props pour le composant récapitulatif
 */
export interface BookingSummaryProps {
  bookingData: BookingData;
  selectedServices: SelectedServicesMap;
  priceBreakdown: PriceBreakdown;
  showTTC: boolean;
}

// ============================================================================
// Helper Type Guards
// ============================================================================

/**
 * Type guard to check if a value is a valid SpaceType
 */
export function isValidSpaceType(value: string): value is SpaceType {
  return ["open-space", "meeting-room-glass", "meeting-room-floor", "event-space"].includes(value);
}

/**
 * Type guard to check if a value is a valid ReservationType
 */
export function isValidReservationType(value: string): value is ReservationType {
  return ["hourly", "daily", "weekly", "monthly"].includes(value);
}

/**
 * Type guard to check if a value is a valid BookingStatus
 */
export function isValidBookingStatus(value: string): value is BookingStatus {
  return ["pending", "confirmed", "cancelled", "completed", "no-show"].includes(value);
}

// ============================================================================
// Constants
// ============================================================================

/**
 * Space Type Labels for display
 */
export const SPACE_TYPE_LABELS: Record<SpaceType, string> = {
  "open-space": "Place - Open-space",
  "meeting-room-glass": "Salle de réunion - Verrière",
  "meeting-room-floor": "Salle de réunion - Étage",
  "event-space": "Événementiel",
};

/**
 * Space Type Info for display
 */
export const SPACE_TYPE_INFO: Record<SpaceType, SpaceTypeInfo> = {
  "open-space": { title: "Place", subtitle: "Open-space" },
  "meeting-room-glass": { title: "Salle de réunion", subtitle: "Verrière" },
  "meeting-room-floor": { title: "Salle de réunion", subtitle: "Étage" },
  "event-space": { title: "Événementiel", subtitle: "Grand espace" },
};

/**
 * Reservation Type Labels for display
 */
export const RESERVATION_TYPE_LABELS: Record<ReservationType, string> = {
  hourly: "À l'heure",
  daily: "À la journée",
  weekly: "À la semaine",
  monthly: "Au mois",
};

/**
 * Booking Status Labels for display
 */
export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  pending: "En attente",
  confirmed: "Confirmée",
  cancelled: "Annulée",
  completed: "Terminée",
  "no-show": "Absence",
};
