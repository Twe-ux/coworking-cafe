// ============================================================================
// useBookingCalculations Hook
// ============================================================================
// Handles price calculations for booking
// Extracted from useBookingForm for better separation of concerns
// ============================================================================

import { useState, useCallback } from "react";
import type {
  BookingData,
  SelectedServicesMap,
  PriceBreakdown,
  CalculatePriceResponse,
} from "@/types/booking";

// ============================================================================
// Hook Return Type
// ============================================================================

export interface UseBookingCalculationsReturn {
  // Price state
  showTTC: boolean;
  setShowTTC: (show: boolean) => void;
  priceBreakdown: PriceBreakdown | null;

  // Calculation functions
  calculatePrice: () => Promise<void>;
  convertPrice: (priceTTC: number, vatRate: number, toTTC: boolean) => number;
  resetPriceBreakdown: () => void;
}

// ============================================================================
// Hook Implementation
// ============================================================================

export function useBookingCalculations(
  bookingData: BookingData | null,
  selectedServices: SelectedServicesMap
): UseBookingCalculationsReturn {
  // ========================================
  // State: Price Display
  // ========================================

  const [showTTC, setShowTTC] = useState(true);
  const [priceBreakdown, setPriceBreakdown] = useState<PriceBreakdown | null>(
    null
  );

  // ========================================
  // Price Conversion (TTC <-> HT)
  // ========================================

  const convertPrice = useCallback(
    (priceTTC: number, vatRate: number, toTTC: boolean): number => {
      if (toTTC) {
        return priceTTC; // Already TTC
      } else {
        return priceTTC / (1 + vatRate / 100); // Convert to HT
      }
    },
    []
  );

  // ========================================
  // Calculate Price via API
  // ========================================

  const calculatePrice = useCallback(async () => {
    if (!bookingData) {
      console.warn("[useBookingCalculations] Cannot calculate price: no booking data");
      return;
    }

    try {
      // Convert selected services Map to API format
      const selectedServicesArray = Array.from(selectedServices.values()).map(
        (s) => ({
          serviceId: s.service._id,
          quantity: s.quantity,
        })
      );

      const response = await fetch("/api/booking/calculate-price", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          spaceType: bookingData.spaceType,
          reservationType: bookingData.reservationType,
          date: bookingData.date,
          startTime: bookingData.startTime,
          endTime: bookingData.endTime,
          numberOfPeople: bookingData.numberOfPeople,
          selectedServices: selectedServicesArray,
        }),
      });

      const data: CalculatePriceResponse = await response.json();

      if (data.success && data.data) {
        setPriceBreakdown(data.data.breakdown);
        console.log("[useBookingCalculations] Price calculated:", data.data.breakdown);
      } else {
        console.error("[useBookingCalculations] API error:", data.error);
      }
    } catch (error) {
      console.error("[useBookingCalculations] Error calculating price:", error);
    }
  }, [bookingData, selectedServices]);

  // ========================================
  // Reset Price Breakdown
  // ========================================

  const resetPriceBreakdown = useCallback(() => {
    setPriceBreakdown(null);
  }, []);

  // ========================================
  // Return Hook Interface
  // ========================================

  return {
    showTTC,
    setShowTTC,
    priceBreakdown,
    calculatePrice,
    convertPrice,
    resetPriceBreakdown,
  };
}
