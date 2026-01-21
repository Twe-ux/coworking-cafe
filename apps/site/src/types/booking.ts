/**
 * Booking Types - apps/site
 * Types pour le système de réservation
 */

/**
 * Données du formulaire de réservation
 */
export interface BookingFormData {
  spaceId: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  numberOfPeople: number;
  promoCode?: string;
  specialRequests?: string;
}

/**
 * Erreurs de validation du formulaire
 */
export interface ValidationErrors {
  [key: string]: string | undefined;
  spaceId?: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  numberOfPeople?: string;
  promoCode?: string;
  general?: string;
}

/**
 * Détails de calcul de prix
 */
export interface PriceCalculation {
  basePrice: number;
  discount: number;
  totalPrice: number;
  hours: number;
  promo: PromoDetails | null;
}

/**
 * Détails du code promo appliqué
 */
export interface PromoDetails {
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
}

/**
 * Détails complets d'une réservation
 */
export interface ReservationDetails {
  id: string;
  userId: string;
  spaceId: string;
  spaceName: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  numberOfPeople: number;
  totalPrice: number;
  status: BookingStatus;
  paymentIntentId?: string;
  specialRequests?: string;
  promoCode?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Statut d'une réservation
 */
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no-show';

/**
 * Données de disponibilité d'un espace
 */
export interface AvailabilitySlot {
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  available: boolean;
  reason?: string; // Si non disponible
}

/**
 * Réponse API pour le calcul de prix
 */
export interface CalculatePriceResponse {
  available: boolean;
  space: {
    id: string;
    name: string;
    pricePerHour: number;
  };
  booking: {
    date: string;
    startTime: string;
    endTime: string;
    numberOfPeople: number;
    hours: number;
  };
  pricing: PriceCalculation;
}

/**
 * Réponse API pour la création de Payment Intent
 */
export interface CreatePaymentIntentResponse {
  clientSecret: string;
  bookingId: string;
}
