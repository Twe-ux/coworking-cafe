export interface AdditionalService {
  service: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Booking {
  _id: string;
  spaceType: string;
  date: string;
  startTime: string;
  endTime: string;
  numberOfPeople: number;
  basePrice: number;
  servicesPrice: number;
  totalPrice: number;
  status: string;
  paymentStatus: string;
  requiresPayment: boolean;
  confirmationNumber?: string;
  specialRequests?: string;
  additionalServices?: AdditionalService[];
  createdAt: string;
  captureMethod?: "manual" | "automatic";
  stripePaymentIntentId?: string;
  stripeSetupIntentId?: string;
}

export interface SpaceConfig {
  name: string;
  spaceType: string;
  imageUrl?: string;
  depositPolicy?: {
    enabled: boolean;
    percentage?: number;
    fixedAmount?: number;
    minimumAmount?: number;
  };
}

export interface StatusBadge {
  class: string;
  label: string;
}
