import type { BookingData, SelectedServicesMap } from "@/types/booking";

/**
 * useBookingPricing - Price calculations for booking
 *
 * Handles all pricing logic including:
 * - Base price
 * - Additional services pricing (daily/hourly rates, per-person)
 * - Total price calculation
 * - Deposit calculation with policies
 */

interface SpaceConfig {
  depositPolicy: {
    enabled: boolean;
    percentage?: number;
    fixedAmount?: number;
    minimumAmount?: number;
  };
}

interface UseBookingPricingProps {
  bookingData: BookingData | null;
  selectedServices: SelectedServicesMap;
  spaceConfig: SpaceConfig | null;
}

export function useBookingPricing({
  bookingData,
  selectedServices,
  spaceConfig,
}: UseBookingPricingProps) {
  const isDailyRate = (): boolean => {
    return bookingData?.isDailyRate === true;
  };

  const calculateServicesPrice = (): number => {
    if (!bookingData) return 0;
    let total = 0;
    const isDaily = isDailyRate();

    selectedServices.forEach((selected) => {
      const service = selected.service;
      const quantity = selected.quantity;

      const priceToUse =
        isDaily && service.dailyPrice !== undefined
          ? service.dailyPrice
          : service.price;

      if (service.priceUnit === "per-person") {
        total += priceToUse * bookingData.numberOfPeople * quantity;
      } else {
        total += priceToUse * quantity;
      }
    });
    return total;
  };

  const getTotalPrice = (): number => {
    if (!bookingData) return 0;
    return bookingData.basePrice + calculateServicesPrice();
  };

  const calculateDepositAmount = (): number => {
    const totalPrice = getTotalPrice();
    if (!spaceConfig?.depositPolicy?.enabled) {
      return totalPrice * 100;
    }

    const totalPriceInCents = totalPrice * 100;
    const policy = spaceConfig.depositPolicy;

    let depositInCents = totalPriceInCents;

    if (policy.fixedAmount) {
      depositInCents = policy.fixedAmount;
    } else if (policy.percentage) {
      depositInCents = Math.round(
        totalPriceInCents * (policy.percentage / 100),
      );
    }

    if (policy.minimumAmount && depositInCents < policy.minimumAmount) {
      depositInCents = policy.minimumAmount;
    }
    return depositInCents;
  };

  return {
    isDailyRate,
    calculateServicesPrice,
    getTotalPrice,
    calculateDepositAmount,
  };
}
