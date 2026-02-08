// ============================================================================
// useBookingState Hook
// ============================================================================
// Hook personnalisé pour gérer tout le state d'une réservation
// ============================================================================

import { useState, useEffect } from "react";
import type { ReservationType } from "@/types/booking";

/**
 * Props du hook useBookingState
 */
interface UseBookingStateProps {
  spaceType: string; // Type d'espace (URL slug: open-space, meeting-room-glass, etc.)
}

/**
 * État de réservation complet
 */
export interface BookingState {
  // Reservation type
  reservationType: ReservationType;
  setReservationType: (type: ReservationType) => void;

  // Dates
  selectedDate: string; // YYYY-MM-DD
  setSelectedDate: (date: string) => void;
  endDate: string; // YYYY-MM-DD (for weekly/monthly)
  setEndDate: (date: string) => void;

  // Times
  arrivalTime: string; // HH:mm (for daily)
  setArrivalTime: (time: string) => void;
  startTime: string; // HH:mm (for hourly)
  setStartTime: (time: string) => void;
  endTime: string; // HH:mm
  setEndTime: (time: string) => void;

  // Pricing
  calculatedPrice: number;
  setCalculatedPrice: (price: number) => void;
  duration: string;
  setDuration: (duration: string) => void;
  appliedDailyRate: boolean;
  setAppliedDailyRate: (applied: boolean) => void;

  // Participants
  numberOfPeople: number;
  setNumberOfPeople: (count: number) => void;

  // UI State
  showTTC: boolean;
  setShowTTC: (show: boolean) => void;

  // Actions
  resetState: () => void;
  saveToSessionStorage: (overridePrice?: number, overrideDuration?: string) => void;
}

/**
 * Hook personnalisé pour gérer l'état d'une réservation
 * Inclut la restauration depuis sessionStorage
 *
 * @param spaceType - Type d'espace (URL slug)
 * @returns État de réservation complet avec setters
 *
 * @example
 * ```tsx
 * const bookingState = useBookingState({ spaceType: "open-space" });
 *
 * // Utilisation
 * bookingState.setReservationType("hourly");
 * bookingState.setSelectedDate("2026-02-10");
 * ```
 */
export function useBookingState({
  spaceType,
}: UseBookingStateProps): BookingState {
  // Reservation type
  const [reservationType, setReservationType] = useState<ReservationType>("hourly");

  // Dates
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  // Times
  const [arrivalTime, setArrivalTime] = useState<string>("");
  const [startTime, setStartTime] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("");

  // Pricing
  const [calculatedPrice, setCalculatedPrice] = useState<number>(0);
  const [duration, setDuration] = useState<string>("");
  const [appliedDailyRate, setAppliedDailyRate] = useState(false);

  // Participants
  const [numberOfPeople, setNumberOfPeople] = useState(1);

  // UI State
  const [showTTC, setShowTTC] = useState(true);

  // Restore from sessionStorage on mount
  useEffect(() => {
    const storedData = sessionStorage.getItem("bookingData");
    if (!storedData) return;

    try {
      const data = JSON.parse(storedData);

      // Only restore if it's the same space type
      if (data.spaceType !== spaceType) return;

      // Restore all fields if present
      if (data.reservationType) setReservationType(data.reservationType);
      if (data.date) setSelectedDate(data.date);
      if (data.endDate) setEndDate(data.endDate);

      // Handle startTime based on reservation type
      if (data.startTime) {
        if (data.reservationType === "hourly") {
          setStartTime(data.startTime);
        } else if (data.reservationType === "daily") {
          setArrivalTime(data.startTime);
        }
      }

      if (data.endTime) setEndTime(data.endTime);
      if (data.numberOfPeople) setNumberOfPeople(data.numberOfPeople);
      if (data.basePrice) setCalculatedPrice(data.basePrice);
      if (data.duration) setDuration(data.duration);
    } catch (error) {
      console.error("Error restoring booking data from sessionStorage:", error);
    }
  }, [spaceType]);

  // Calculate end date for weekly/monthly reservations
  useEffect(() => {
    if (!selectedDate) return;

    // Parse date manually to avoid timezone issues
    const [year, month, day] = selectedDate.split("-").map(Number);

    if (reservationType === "weekly") {
      const start = new Date(year, month - 1, day);
      const end = new Date(start);
      end.setDate(end.getDate() + 6); // 7 days total (including start day)

      const endDateStr = `${end.getFullYear()}-${String(
        end.getMonth() + 1
      ).padStart(2, "0")}-${String(end.getDate()).padStart(2, "0")}`;

      setEndDate(endDateStr);
    } else if (reservationType === "monthly") {
      const start = new Date(year, month - 1, day);
      const end = new Date(start);
      end.setDate(end.getDate() + 29); // 30 days total

      const endDateStr = `${end.getFullYear()}-${String(
        end.getMonth() + 1
      ).padStart(2, "0")}-${String(end.getDate()).padStart(2, "0")}`;

      setEndDate(endDateStr);
    } else {
      // Reset endDate for hourly/daily
      setEndDate("");
    }
  }, [selectedDate, reservationType]);

  /**
   * Reset all state to initial values
   */
  const resetState = () => {
    setReservationType("hourly");
    setSelectedDate("");
    setEndDate("");
    setArrivalTime("");
    setStartTime("");
    setEndTime("");
    setCalculatedPrice(0);
    setDuration("");
    setAppliedDailyRate(false);
    setNumberOfPeople(1);
    setShowTTC(true);
  };

  /**
   * Save current state to sessionStorage
   */
  const saveToSessionStorage = (overridePrice?: number, overrideDuration?: string) => {
    const bookingData = {
      spaceType,
      reservationType,
      date: selectedDate,
      endDate: endDate || undefined,
      startTime: reservationType === "hourly" ? startTime : arrivalTime,
      endTime,
      numberOfPeople,
      basePrice: overridePrice !== undefined ? overridePrice : calculatedPrice,
      duration: overrideDuration || duration,
    };

    console.log('[useBookingState] Saving to sessionStorage:', bookingData);
    sessionStorage.setItem("bookingData", JSON.stringify(bookingData));
  };

  return {
    // Reservation type
    reservationType,
    setReservationType,

    // Dates
    selectedDate,
    setSelectedDate,
    endDate,
    setEndDate,

    // Times
    arrivalTime,
    setArrivalTime,
    startTime,
    setStartTime,
    endTime,
    setEndTime,

    // Pricing
    calculatedPrice,
    setCalculatedPrice,
    duration,
    setDuration,
    appliedDailyRate,
    setAppliedDailyRate,

    // Participants
    numberOfPeople,
    setNumberOfPeople,

    // UI State
    showTTC,
    setShowTTC,

    // Actions
    resetState,
    saveToSessionStorage,
  };
}
