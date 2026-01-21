import { Document } from "mongoose";

/**
 * Pricing tier for capacity-based pricing
 */
export interface PricingTier {
  minPeople: number;
  maxPeople: number;
  hourlyRate: number; // Price per hour for this tier
  dailyRate: number; // Price per day for this tier
  extraPersonHourly?: number; // Additional cost per extra person per hour
  extraPersonDaily?: number; // Additional cost per extra person per day
}

/**
 * Pricing structure for different reservation types
 */
export interface PricingStructure {
  hourly: number; // Base price per hour (0 if not available or quote-based)
  daily: number; // Base price per day (0 if not available or quote-based)
  weekly: number; // Price per week (0 if not available or quote-based)
  monthly: number; // Price per month (0 if not available or quote-based)
  perPerson: boolean; // If true, multiply by number of people
  maxHoursBeforeDaily?: number; // Max hours before switching to daily rate (e.g., 5 for open-space)
  dailyRatePerPerson?: number; // Daily rate per person if > maxHoursBeforeDaily
  tiers?: PricingTier[]; // Capacity-based pricing tiers
}

/**
 * Available reservation types per space
 */
export interface AvailableReservationTypes {
  hourly: boolean;
  daily: boolean;
  weekly: boolean;
  monthly: boolean;
}

/**
 * Deposit policy for payment holds
 */
export interface DepositPolicy {
  enabled: boolean;
  percentage?: number; // Ex: 30% du montant total
  fixedAmount?: number; // Ou montant fixe en centimes
  minimumAmount?: number; // Montant minimum d'empreinte en centimes
}

/**
 * Space configuration document
 */
export interface SpaceConfigurationDocument extends Document {
  spaceType: "open-space" | "salle-verriere" | "salle-etage" | "evenementiel";
  name: string;
  slug: string;
  description?: string;

  // Pricing
  pricing: PricingStructure;
  availableReservationTypes: AvailableReservationTypes;
  requiresQuote: boolean; // If true, show "sur devis" instead of booking
  depositPolicy?: DepositPolicy; // Payment hold configuration

  // Capacity
  minCapacity: number;
  maxCapacity: number;

  // Availability
  isActive: boolean;

  // Display
  imageUrl?: string;
  displayOrder: number;
  features?: string[]; // Tags/features displayed on the site (e.g., WiFi, Café, Écran)

  // Metadata
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
}
