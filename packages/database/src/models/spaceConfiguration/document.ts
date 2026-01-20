import { Document } from "mongoose";

export interface PricingTier {
  minPeople: number;
  maxPeople: number;
  hourlyRate: number;
  dailyRate: number;
  extraPersonHourly?: number;
  extraPersonDaily?: number;
}

export interface PricingStructure {
  hourly: number;
  daily: number;
  weekly: number;
  monthly: number;
  perPerson: boolean;
  maxHoursBeforeDaily?: number;
  dailyRatePerPerson?: number;
  tiers?: PricingTier[];
}

export interface AvailableReservationTypes {
  hourly: boolean;
  daily: boolean;
  weekly: boolean;
  monthly: boolean;
}

export interface DepositPolicy {
  enabled: boolean;
  percentage?: number;
  fixedAmount?: number;
  minimumAmount?: number;
}

export interface SpaceConfigurationDocument extends Document {
  spaceType: "open-space" | "salle-verriere" | "salle-etage" | "evenementiel";
  name: string;
  slug: string;
  description?: string;
  pricing: PricingStructure;
  availableReservationTypes: AvailableReservationTypes;
  requiresQuote: boolean;
  depositPolicy?: DepositPolicy;
  minCapacity: number;
  maxCapacity: number;
  isActive: boolean;
  imageUrl?: string;
  displayOrder: number;
  features?: string[];
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
}
