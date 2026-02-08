// ============================================================================
// usePriceCalculation Hook
// ============================================================================
// Hook personnalisé pour gérer le calcul des prix (TTC/HT) avec API
// ============================================================================

import { useState, useEffect, useCallback } from "react";
import type { ReservationType, SpaceConfiguration, GlobalHours } from "@/types/booking";

/**
 * Props du hook usePriceCalculation
 */
interface UsePriceCalculationProps {
  spaceType: string; // Type d'espace (valeur DB)
  reservationType: ReservationType;
  selectedDate: string; // YYYY-MM-DD
  startTime: string; // HH:mm (hourly)
  endTime: string; // HH:mm
  arrivalTime: string; // HH:mm (daily)
  numberOfPeople: number;
  spaceConfig: SpaceConfiguration | null;
  globalHours: GlobalHours | null;
  showTTC: boolean;
}

/**
 * Return type du hook usePriceCalculation
 */
interface UsePriceCalculationReturn {
  calculatedPrice: number;
  displayPrice: number;
  duration: string;
  appliedDailyRate: boolean;
  calculating: boolean;
  error: string;
}

/**
 * Hook personnalisé pour calculer le prix d'une réservation
 * Gère la conversion TTC/HT et la règle des 5h
 *
 * @param props - Paramètres de calcul
 * @returns Prix calculé, durée, et état
 *
 * @example
 * ```tsx
 * const { calculatedPrice, displayPrice, duration } = usePriceCalculation({
 *   spaceType: "open-space",
 *   reservationType: "hourly",
 *   startTime: "09:00",
 *   endTime: "12:00",
 *   // ...
 * });
 * ```
 */
export function usePriceCalculation({
  spaceType,
  reservationType,
  selectedDate,
  startTime,
  endTime,
  arrivalTime,
  numberOfPeople,
  spaceConfig,
  globalHours,
  showTTC,
}: UsePriceCalculationProps): UsePriceCalculationReturn {
  const [calculatedPrice, setCalculatedPrice] = useState<number>(0);
  const [duration, setDuration] = useState<string>("");
  const [appliedDailyRate, setAppliedDailyRate] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [error, setError] = useState<string>("");

  /**
   * Calcule le prix d'affichage (TTC ou HT)
   * Hourly rate (<5h) = 10% VAT, Daily rate = 20% VAT
   */
  const getDisplayPrice = useCallback((): number => {
    if (!showTTC) {
      // Calculate HT based on reservation type
      const vatRate =
        appliedDailyRate ||
        reservationType === "daily" ||
        reservationType === "weekly" ||
        reservationType === "monthly"
          ? 1.2 // 20% VAT
          : 1.1; // 10% VAT

      return calculatedPrice / vatRate;
    }
    return calculatedPrice;
  }, [calculatedPrice, showTTC, appliedDailyRate, reservationType]);

  /**
   * Calcule le prix pour une réservation à la journée
   */
  const calculateDailyPrice = useCallback(async () => {
    if (!spaceConfig || !globalHours || !selectedDate || !arrivalTime) {
      setCalculatedPrice(0);
      setDuration("");
      return;
    }

    // Parse date manually to avoid timezone issues
    const [year, month, day] = selectedDate.split("-").map(Number);
    const dateObj = new Date(year, month - 1, day);
    const dayOfWeek = dateObj
      .toLocaleDateString("en-US", { weekday: "long" })
      .toLowerCase();
    const dayHours = globalHours.defaultHours?.[dayOfWeek];

    if (!dayHours || !dayHours.closeTime) {
      setError("Horaires non disponibles pour ce jour");
      return;
    }

    setDuration(`${arrivalTime} - ${dayHours.closeTime}`);
    setCalculating(true);
    setError("");

    // Call API to calculate price with tier support
    try {
      const startDateTime = new Date(
        year,
        month - 1,
        day,
        parseInt(arrivalTime.split(":")[0]),
        parseInt(arrivalTime.split(":")[1])
      ).toISOString();

      const endDateTime = new Date(
        year,
        month - 1,
        day,
        parseInt(dayHours.closeTime.split(":")[0]),
        parseInt(dayHours.closeTime.split(":")[1])
      ).toISOString();

      const response = await fetch("/api/calculate-price", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          spaceType: spaceType,
          reservationType: "daily",
          startTime: startDateTime,
          endTime: endDateTime,
          numberOfPeople: numberOfPeople,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setCalculatedPrice(data.data.totalPrice);
        setError("");
      } else {
        throw new Error(data.error || "Erreur de calcul");
      }
    } catch (err) {
      console.error("Error calculating daily price:", err);
      // Fallback to simple calculation
      const basePrice = spaceConfig.pricing.daily;
      setCalculatedPrice(
        spaceConfig.pricing.perPerson ? basePrice * numberOfPeople : basePrice
      );
      setError("Calcul approximatif (API indisponible)");
    } finally {
      setCalculating(false);
    }
  }, [spaceType, selectedDate, arrivalTime, numberOfPeople, spaceConfig, globalHours]);

  /**
   * Calcule le prix et la durée pour une réservation à l'heure
   */
  const calculatePriceAndDuration = useCallback(async () => {
    if (!startTime || !endTime || !spaceConfig || !selectedDate) {
      setCalculatedPrice(0);
      setDuration("");
      return;
    }

    const [startHour, startMinute] = startTime.split(":").map(Number);
    const [endHour, endMinute] = endTime.split(":").map(Number);

    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;

    if (endMinutes <= startMinutes) {
      setDuration("");
      setCalculatedPrice(0);
      setError("L'heure de fin doit être après l'heure de début");
      return;
    }

    const durationMinutes = endMinutes - startMinutes;
    const durationHours = durationMinutes / 60;

    // Format duration
    const hours = Math.floor(durationHours);
    const minutes = durationMinutes % 60;
    setDuration(
      hours > 0
        ? `${hours}H${
            minutes > 0 ? " " + minutes.toString().padStart(2, "0") : ""
          }`.trim()
        : `${minutes}min`
    );

    // RÈGLE DES 5H: Si >= 5h, appliquer tarif journée
    if (durationHours >= 5 && spaceConfig.pricing.daily > 0) {
      const basePrice = spaceConfig.pricing.daily;
      setCalculatedPrice(
        spaceConfig.pricing.perPerson ? basePrice * numberOfPeople : basePrice
      );
      setAppliedDailyRate(true);
      setError("");
      return;
    }

    setAppliedDailyRate(false);
    setCalculating(true);
    setError("");

    // Calculate price using API
    try {
      const [year, month, day] = selectedDate.split("-").map(Number);
      const startDateTime = new Date(
        year,
        month - 1,
        day,
        startHour,
        startMinute
      ).toISOString();
      const endDateTime = new Date(
        year,
        month - 1,
        day,
        endHour,
        endMinute
      ).toISOString();

      const response = await fetch("/api/calculate-price", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          spaceType: spaceType,
          reservationType: "hourly",
          startTime: startDateTime,
          endTime: endDateTime,
          numberOfPeople: numberOfPeople,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setCalculatedPrice(data.data.totalPrice);
        setError("");
      } else {
        throw new Error(data.error || "Erreur de calcul");
      }
    } catch (err) {
      console.error("Error calculating hourly price:", err);
      // Fallback to simple calculation
      const basePrice = spaceConfig.pricing.hourly * durationHours;
      setCalculatedPrice(
        spaceConfig.pricing.perPerson ? basePrice * numberOfPeople : basePrice
      );
      setError("Calcul approximatif (API indisponible)");
    } finally {
      setCalculating(false);
    }
  }, [
    spaceType,
    selectedDate,
    startTime,
    endTime,
    numberOfPeople,
    spaceConfig,
  ]);

  // Calculate price based on reservation type
  useEffect(() => {
    if (!selectedDate || !spaceConfig) {
      setCalculatedPrice(0);
      setDuration("");
      return;
    }

    if (reservationType === "hourly") {
      if (startTime && endTime) {
        calculatePriceAndDuration();
      }
    } else if (reservationType === "daily") {
      if (arrivalTime && globalHours) {
        calculateDailyPrice();
      }
    } else if (reservationType === "weekly") {
      const basePrice = spaceConfig.pricing.weekly;
      setCalculatedPrice(
        spaceConfig.pricing.perPerson ? basePrice * numberOfPeople : basePrice
      );
      setDuration("1 semaine");
      setError("");
    } else if (reservationType === "monthly") {
      const basePrice = spaceConfig.pricing.monthly;
      setCalculatedPrice(
        spaceConfig.pricing.perPerson ? basePrice * numberOfPeople : basePrice
      );
      setDuration("1 mois");
      setError("");
    }
  }, [
    reservationType,
    selectedDate,
    startTime,
    endTime,
    arrivalTime,
    numberOfPeople,
    spaceConfig,
    globalHours,
    calculatePriceAndDuration,
    calculateDailyPrice,
  ]);

  return {
    calculatedPrice,
    displayPrice: getDisplayPrice(),
    duration,
    appliedDailyRate,
    calculating,
    error,
  };
}
