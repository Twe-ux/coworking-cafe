// ============================================================================
// useBookingHandlers Hook
// ============================================================================
// Centralized handlers for booking flow interactions
// ============================================================================

import { useRouter } from "next/navigation";
import type { GlobalHours, ReservationType } from "@/types/booking";

export interface UseBookingHandlersParams {
  bookingState: {
    selectedDate: string;
    reservationType: ReservationType;
    setSelectedDate: (date: string) => void;
    setStartTime: (time: string) => void;
    setEndTime: (time: string) => void;
    setArrivalTime: (time: string) => void;
    saveToSessionStorage: (price: number, duration: string) => void;
  };
  accordion: {
    closeDateSection: () => void;
    openTimeSection: () => void;
    scrollToTimeSection: () => void;
    scrollToPriceSection: () => void;
  };
  validation: {
    canContinue: boolean;
  };
  pricing: {
    calculatedPrice: number;
    duration: string;
  };
  globalHours: GlobalHours | null;
}

export interface UseBookingHandlersReturn {
  handleDateChange: (date: string) => void;
  handleStartTimeSelection: (time: string) => void;
  handleContinue: () => void;
  handleResetTimeSelections: () => void;
}

/**
 * Hook providing all booking interaction handlers
 */
export function useBookingHandlers({
  bookingState,
  accordion,
  validation,
  pricing,
  globalHours,
}: UseBookingHandlersParams): UseBookingHandlersReturn {
  const router = useRouter();

  const handleDateChange = (date: string) => {
    bookingState.setSelectedDate(date);
    // Auto-close date section and open time section
    accordion.closeDateSection();
    setTimeout(() => {
      accordion.openTimeSection();
      accordion.scrollToTimeSection();
    }, 350); // Wait for date section to close
  };

  const handleStartTimeSelection = (time: string) => {
    bookingState.setStartTime(time);

    // Auto-select end time (+1h) for hourly reservations
    if (bookingState.reservationType === "hourly" && globalHours && bookingState.selectedDate) {
      const [hour, minute] = time.split(":").map(Number);
      const endHour = hour + 1;
      const endTime = `${String(endHour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;

      // Get day's closing time
      const [year, month, day] = bookingState.selectedDate.split("-").map(Number);
      const selectedDateObj = new Date(year, month - 1, day);
      const dayOfWeek = selectedDateObj
        .toLocaleDateString("en-US", { weekday: "long" })
        .toLowerCase();
      const dayHours = globalHours.defaultHours?.[dayOfWeek];

      // Check if end time is valid (before closing time)
      if (dayHours?.closeTime && endTime <= dayHours.closeTime) {
        bookingState.setEndTime(endTime);
      }
    }

    // Auto-open price section after selecting start time
    setTimeout(() => {
      accordion.scrollToPriceSection();
    }, 300);
  };

  const handleContinue = () => {
    if (!validation.canContinue) return;

    // Save to sessionStorage with calculated price from usePriceCalculation
    bookingState.saveToSessionStorage(pricing.calculatedPrice, pricing.duration);

    // Navigate to details page
    router.push("/booking/details");
  };

  const handleResetTimeSelections = () => {
    bookingState.setStartTime("");
    bookingState.setEndTime("");
    bookingState.setArrivalTime("");
  };

  return {
    handleDateChange,
    handleStartTimeSelection,
    handleContinue,
    handleResetTimeSelections,
  };
}
