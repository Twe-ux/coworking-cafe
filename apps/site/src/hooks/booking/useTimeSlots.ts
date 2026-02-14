// ============================================================================
// useTimeSlots Hook
// ============================================================================
// Calculate available time slots based on global hours and selected date
// ============================================================================

import { useMemo } from "react";
import type { GlobalHours } from "@/types/booking";
import { ALL_TIME_SLOTS } from "@/types/booking";

export interface UseTimeSlotsParams {
  globalHours: GlobalHours | null;
  selectedDate: string;
  startTime: string;
  reservationType: string;
}

export interface UseTimeSlotsReturn {
  availableStartSlots: string[];
  availableEndSlots: string[];
}

/**
 * Hook to calculate available time slots for booking
 */
export function useTimeSlots({
  globalHours,
  selectedDate,
  startTime,
  reservationType,
}: UseTimeSlotsParams): UseTimeSlotsReturn {
  // Calculate available start time slots
  const availableStartSlots = useMemo(() => {
    if (!globalHours || !selectedDate) {
      return ALL_TIME_SLOTS;
    }

    const [year, month, day] = selectedDate.split("-").map(Number);
    const selectedDateObj = new Date(year, month - 1, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    selectedDateObj.setHours(0, 0, 0, 0);
    const isToday = selectedDateObj.getTime() === today.getTime();

    const dayOfWeek = selectedDateObj
      .toLocaleDateString("en-US", { weekday: "long" })
      .toLowerCase();
    const dayHours = globalHours.defaultHours?.[dayOfWeek];

    if (!dayHours || !dayHours.isOpen || !dayHours.openTime || !dayHours.closeTime) {
      return ALL_TIME_SLOTS;
    }

    // Calculate latest start time (1h before closing for hourly)
    const [closeHour, closeMinute] = dayHours.closeTime.split(":").map(Number);
    const latestStartMinutes = closeHour * 60 + closeMinute - 60;
    const latestStartHour = Math.floor(latestStartMinutes / 60);
    const latestStartMinuteRemainder = latestStartMinutes % 60;
    const latestStartTime = `${String(latestStartHour).padStart(2, "0")}:${String(
      latestStartMinuteRemainder
    ).padStart(2, "0")}`;

    let filteredSlots = ALL_TIME_SLOTS.filter((slot) => {
      return slot >= dayHours.openTime! && slot <= latestStartTime;
    });

    // For daily reservations, limit start time to 15:00
    if (reservationType === "daily") {
      filteredSlots = filteredSlots.filter((slot) => slot <= "15:00");
    }

    // Filter past times if today
    if (isToday) {
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();

      filteredSlots = filteredSlots.filter((slot) => {
        const [hour, minute] = slot.split(":").map(Number);
        const slotMinutes = hour * 60 + minute;
        return slotMinutes > currentMinutes;
      });
    }

    return filteredSlots;
  }, [globalHours, selectedDate, reservationType]);

  // Calculate available end time slots
  const availableEndSlots = useMemo(() => {
    if (!globalHours || !selectedDate || !startTime) {
      return ALL_TIME_SLOTS;
    }

    const [year, month, day] = selectedDate.split("-").map(Number);
    const selectedDateObj = new Date(year, month - 1, day);
    const dayOfWeek = selectedDateObj
      .toLocaleDateString("en-US", { weekday: "long" })
      .toLowerCase();
    const dayHours = globalHours.defaultHours?.[dayOfWeek];

    if (!dayHours || !dayHours.closeTime) {
      return ALL_TIME_SLOTS;
    }

    const [startHour, startMinute] = startTime.split(":").map(Number);
    const startMinutes = startHour * 60 + startMinute;

    return ALL_TIME_SLOTS.filter((slot) => {
      const [endHour, endMinute] = slot.split(":").map(Number);
      const endMinutes = endHour * 60 + endMinute;

      // Must be after start time and before/at closing time
      return (
        endMinutes > startMinutes &&
        slot <= dayHours.closeTime! &&
        endMinutes - startMinutes >= 60 // Minimum 1 hour
      );
    });
  }, [globalHours, selectedDate, startTime]);

  return {
    availableStartSlots,
    availableEndSlots,
  };
}
