"use client";

// ============================================================================
// Booking Date/Time Selection Page - REFACTORED
// ============================================================================
// Page de sélection de date et horaires pour une réservation
// Utilise des hooks personnalisés et des composants modulaires
// Conforme CLAUDE.md: < 200 lignes, logique extraite dans hooks/composants
// ============================================================================

import { useMemo } from "react";
import { BookingErrorDisplay } from "@/components/site/booking/BookingErrorDisplay";
import { BookingDateContent } from "@/components/booking/date/BookingDateContent";
import { useSpaceConfiguration } from "@/hooks/useSpaceConfiguration";
import { useBookingState } from "@/hooks/useBookingState";
import { usePriceCalculation } from "@/hooks/usePriceCalculation";
import { useBookingValidation } from "@/hooks/useBookingValidation";
import { useBookingAccordion } from "@/hooks/useBookingAccordion";
import { useTimeSlots } from "@/hooks/booking/useTimeSlots";
import { useBookingHandlers } from "@/hooks/booking/useBookingHandlers";
import {
  SPACE_TYPE_MAPPING,
  SPACE_TYPE_INFO,
  ALL_RESERVATION_TYPES,
} from "@/types/booking";
import "../../../[id]/client-dashboard.scss";

/**
 * Props de la page
 */
interface BookingDatePageProps {
  params: {
    type: string; // URL slug (open-space, meeting-room-glass, etc.)
  };
}

/**
 * Page de sélection de date et horaires pour réservation
 * Étape 2 du processus de booking
 */
export default function BookingDatePage({ params }: BookingDatePageProps) {
  // Récupérer les infos de l'espace depuis l'URL
  const spaceInfo = SPACE_TYPE_INFO[params.type as keyof typeof SPACE_TYPE_INFO] || {
    title: "Espace",
    subtitle: "",
  };
  const dbSpaceType = SPACE_TYPE_MAPPING[params.type] || params.type;

  // 🎯 Hooks de données
  const { spaceConfig, globalHours, loading, error, requiresQuote } =
    useSpaceConfiguration({ spaceType: dbSpaceType });

  const bookingState = useBookingState({ spaceType: params.type });

  const pricing = usePriceCalculation({
    spaceType: dbSpaceType,
    reservationType: bookingState.reservationType,
    selectedDate: bookingState.selectedDate,
    startTime: bookingState.startTime,
    endTime: bookingState.endTime,
    arrivalTime: bookingState.arrivalTime,
    numberOfPeople: bookingState.numberOfPeople,
    spaceConfig,
    globalHours,
    showTTC: bookingState.showTTC,
  });

  const validation = useBookingValidation({
    reservationType: bookingState.reservationType,
    selectedDate: bookingState.selectedDate,
    startTime: bookingState.startTime,
    endTime: bookingState.endTime,
    arrivalTime: bookingState.arrivalTime,
    numberOfPeople: bookingState.numberOfPeople,
    spaceConfig,
    globalHours,
  });

  const accordion = useBookingAccordion();

  // 🎯 Time slots calculation
  const { availableStartSlots, availableEndSlots } = useTimeSlots({
    globalHours,
    selectedDate: bookingState.selectedDate,
    startTime: bookingState.startTime,
    reservationType: bookingState.reservationType,
  });

  // 🎯 Handlers
  const { handleDateChange, handleStartTimeSelection, handleContinue, handleResetTimeSelections } =
    useBookingHandlers({
      bookingState,
      accordion,
      validation,
      pricing,
      globalHours,
    });

  // 🎯 Types de réservation disponibles pour cet espace
  const availableReservationTypes = useMemo(() => {
    if (!spaceConfig?.availableReservationTypes) {
      return ALL_RESERVATION_TYPES;
    }

    return ALL_RESERVATION_TYPES.filter((reservType) => {
      return spaceConfig.availableReservationTypes[
        reservType.id as keyof typeof spaceConfig.availableReservationTypes
      ];
    });
  }, [spaceConfig]);

  // 🎯 Early returns - Error state
  if (error) {
    return (
      <section className="booking-date-page py-3">
        <div className="container">
          <BookingErrorDisplay error={error} type="danger" />
        </div>
      </section>
    );
  }

  // 🎯 Early returns - Requires quote (redirect handled elsewhere)
  if (requiresQuote) {
    return null;
  }

  // 🎯 Main render
  return (
    <section className="booking-date-page py-3">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-10">
            <BookingDateContent
              spaceInfo={spaceInfo}
              spaceConfig={spaceConfig}
              loading={loading}
              availableReservationTypes={availableReservationTypes}
              bookingState={bookingState}
              accordion={accordion}
              timeSlots={{ availableStartSlots, availableEndSlots }}
              pricing={pricing}
              validation={validation}
              handlers={{
                handleDateChange,
                handleStartTimeSelection,
                handleContinue,
                handleResetTimeSelections,
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
