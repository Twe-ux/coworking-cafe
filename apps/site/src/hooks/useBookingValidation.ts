// ============================================================================
// useBookingValidation Hook
// ============================================================================
// Hook personnalisé pour valider une réservation
// ============================================================================

import { useMemo } from "react";
import type { ReservationType, SpaceConfiguration, GlobalHours } from "@/types/booking";

/**
 * Props du hook useBookingValidation
 */
interface UseBookingValidationProps {
  reservationType: ReservationType;
  selectedDate: string; // YYYY-MM-DD
  startTime: string; // HH:mm (hourly)
  endTime: string; // HH:mm
  arrivalTime: string; // HH:mm (daily)
  numberOfPeople: number;
  spaceConfig: SpaceConfiguration | null;
  globalHours: GlobalHours | null;
}

/**
 * Validation errors
 */
interface ValidationErrors {
  date?: string;
  time?: string;
  people?: string;
  general?: string;
}

/**
 * Return type du hook useBookingValidation
 */
interface UseBookingValidationReturn {
  isValid: boolean;
  errors: ValidationErrors;
  canContinue: boolean; // True si tous les champs obligatoires sont remplis
}

/**
 * Hook personnalisé pour valider une réservation
 *
 * @param props - Paramètres de validation
 * @returns État de validation et erreurs
 *
 * @example
 * ```tsx
 * const { isValid, errors, canContinue } = useBookingValidation({
 *   reservationType: "hourly",
 *   selectedDate: "2026-02-10",
 *   startTime: "09:00",
 *   endTime: "12:00",
 *   // ...
 * });
 * ```
 */
export function useBookingValidation({
  reservationType,
  selectedDate,
  startTime,
  endTime,
  arrivalTime,
  numberOfPeople,
  spaceConfig,
  globalHours,
}: UseBookingValidationProps): UseBookingValidationReturn {
  const errors: ValidationErrors = useMemo(() => {
    const newErrors: ValidationErrors = {};

    // Validate date
    if (selectedDate) {
      const [year, month, day] = selectedDate.split("-").map(Number);
      const selectedDateObj = new Date(year, month - 1, day);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      selectedDateObj.setHours(0, 0, 0, 0);

      // Check if date is in the past
      if (selectedDateObj < today) {
        newErrors.date = "La date ne peut pas être dans le passé";
      }

      // Check if day is open
      if (globalHours) {
        const dayOfWeek = selectedDateObj
          .toLocaleDateString("en-US", { weekday: "long" })
          .toLowerCase();
        const dayHours = globalHours.defaultHours?.[dayOfWeek];

        if (!dayHours || !dayHours.isOpen) {
          newErrors.date = "Le coworking est fermé ce jour-là";
        }

        // Check exceptional closures
        if (globalHours.exceptionalClosures) {
          const closure = globalHours.exceptionalClosures.find(
            (c) => c.date === selectedDate
          );
          if (closure && closure.isFullDay) {
            newErrors.date = `Fermeture exceptionnelle${
              closure.reason ? `: ${closure.reason}` : ""
            }`;
          }
        }
      }
    }

    // Validate time for hourly reservations
    if (reservationType === "hourly" && startTime && endTime) {
      const [startHour, startMinute] = startTime.split(":").map(Number);
      const [endHour, endMinute] = endTime.split(":").map(Number);

      const startMinutes = startHour * 60 + startMinute;
      const endMinutes = endHour * 60 + endMinute;

      if (endMinutes <= startMinutes) {
        newErrors.time = "L'heure de fin doit être après l'heure de début";
      }

      // Check minimum duration (30 minutes)
      const durationMinutes = endMinutes - startMinutes;
      if (durationMinutes < 30) {
        newErrors.time = "Durée minimale : 30 minutes";
      }

      // Check if time is within opening hours
      if (globalHours && selectedDate) {
        const [year, month, day] = selectedDate.split("-").map(Number);
        const dateObj = new Date(year, month - 1, day);
        const dayOfWeek = dateObj
          .toLocaleDateString("en-US", { weekday: "long" })
          .toLowerCase();
        const dayHours = globalHours.defaultHours?.[dayOfWeek];

        if (dayHours && dayHours.openTime && dayHours.closeTime) {
          const [openHour, openMinute] = dayHours.openTime.split(":").map(Number);
          const [closeHour, closeMinute] = dayHours.closeTime.split(":").map(Number);

          const openMinutes = openHour * 60 + openMinute;
          const closeMinutes = closeHour * 60 + closeMinute;

          if (startMinutes < openMinutes || endMinutes > closeMinutes) {
            newErrors.time = `Horaires d'ouverture : ${dayHours.openTime} - ${dayHours.closeTime}`;
          }
        }
      }
    }

    // Validate time for daily reservations
    if (reservationType === "daily" && arrivalTime) {
      if (globalHours && selectedDate) {
        const [year, month, day] = selectedDate.split("-").map(Number);
        const dateObj = new Date(year, month - 1, day);
        const dayOfWeek = dateObj
          .toLocaleDateString("en-US", { weekday: "long" })
          .toLowerCase();
        const dayHours = globalHours.defaultHours?.[dayOfWeek];

        if (dayHours && dayHours.openTime && dayHours.closeTime) {
          const [arriveHour, arriveMinute] = arrivalTime.split(":").map(Number);
          const [openHour, openMinute] = dayHours.openTime.split(":").map(Number);
          const [closeHour, closeMinute] = dayHours.closeTime.split(":").map(Number);

          const arriveMinutes = arriveHour * 60 + arriveMinute;
          const openMinutes = openHour * 60 + openMinute;
          const closeMinutes = closeHour * 60 + closeMinute;

          if (arriveMinutes < openMinutes || arriveMinutes >= closeMinutes) {
            newErrors.time = `Horaires d'ouverture : ${dayHours.openTime} - ${dayHours.closeTime}`;
          }
        }
      }
    }

    // Validate number of people
    if (spaceConfig) {
      if (numberOfPeople < spaceConfig.minCapacity) {
        newErrors.people = `Minimum ${spaceConfig.minCapacity} personne${
          spaceConfig.minCapacity > 1 ? "s" : ""
        }`;
      }
      if (numberOfPeople > spaceConfig.maxCapacity) {
        newErrors.people = `Maximum ${spaceConfig.maxCapacity} personnes`;
      }
    }

    return newErrors;
  }, [
    reservationType,
    selectedDate,
    startTime,
    endTime,
    arrivalTime,
    numberOfPeople,
    spaceConfig,
    globalHours,
  ]);

  // Check if all required fields are filled
  const canContinue = useMemo(() => {
    if (!selectedDate) return false;

    if (reservationType === "hourly") {
      if (!startTime || !endTime) return false;
    } else if (reservationType === "daily") {
      if (!arrivalTime) return false;
    }

    // Check for validation errors
    if (Object.keys(errors).length > 0) return false;

    return true;
  }, [reservationType, selectedDate, startTime, endTime, arrivalTime, errors]);

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    canContinue,
  };
}
