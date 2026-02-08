"use client";

// ============================================================================
// Booking Date/Time Selection Page - REFACTORED
// ============================================================================
// Page de sélection de date et horaires pour une réservation
// Utilise des hooks personnalisés et des composants modulaires
// ============================================================================

import { useRouter } from "next/navigation";
import { useMemo } from "react";
import BookingProgressBar from "@/components/site/booking/BookingProgressBar";
import { BookingErrorDisplay } from "@/components/site/booking/BookingErrorDisplay";
import { ReservationTypeSelector } from "@/components/site/booking/ReservationTypeSelector";
import { DateSelectionSection } from "@/components/site/booking/DateSelectionSection";
import { TimeSelectionSection } from "@/components/site/booking/TimeSelectionSection";
import { PeopleCounterSection } from "@/components/site/booking/PeopleCounterSection";
import { PriceDisplayCard } from "@/components/site/booking/PriceDisplayCard";
import { useSpaceConfiguration } from "@/hooks/useSpaceConfiguration";
import { useBookingState } from "@/hooks/useBookingState";
import { usePriceCalculation } from "@/hooks/usePriceCalculation";
import { useBookingValidation } from "@/hooks/useBookingValidation";
import { useBookingAccordion } from "@/hooks/useBookingAccordion";
import {
  SPACE_TYPE_MAPPING,
  SPACE_TYPE_INFO,
  ALL_RESERVATION_TYPES,
  ALL_TIME_SLOTS,
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
  const router = useRouter();

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

  // 🎯 Slots horaires disponibles
  const getAvailableStartTimeSlots = (): string[] => {
    if (!globalHours || !bookingState.selectedDate) {
      return ALL_TIME_SLOTS;
    }

    const [year, month, day] = bookingState.selectedDate.split("-").map(Number);
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
  };

  const getAvailableEndTimeSlots = (): string[] => {
    if (!globalHours || !bookingState.selectedDate || !bookingState.startTime) {
      return ALL_TIME_SLOTS;
    }

    const [year, month, day] = bookingState.selectedDate.split("-").map(Number);
    const selectedDateObj = new Date(year, month - 1, day);
    const dayOfWeek = selectedDateObj
      .toLocaleDateString("en-US", { weekday: "long" })
      .toLowerCase();
    const dayHours = globalHours.defaultHours?.[dayOfWeek];

    if (!dayHours || !dayHours.closeTime) {
      return ALL_TIME_SLOTS;
    }

    const [startHour, startMinute] = bookingState.startTime.split(":").map(Number);
    const startMinutes = startHour * 60 + startMinute;

    return ALL_TIME_SLOTS.filter((slot) => {
      const [endHour, endMinute] = slot.split(":").map(Number);
      const endMinutes = endHour * 60 + endMinute;

      // Must be after start time and before/at closing time
      return (
        endMinutes > startMinutes &&
        slot <= dayHours.closeTime! &&
        endMinutes - startMinutes >= 30 // Minimum 30 minutes
      );
    });
  };

  // 🎯 Handlers
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
    // Auto-open price section after selecting start time
    setTimeout(() => {
      accordion.scrollToPriceSection();
    }, 300);
  };

  const handleContinue = () => {
    if (!validation.canContinue) return;

    // Save to sessionStorage
    bookingState.saveToSessionStorage();

    // Navigate to details page
    router.push("/booking/details");
  };

  const handleResetTimeSelections = () => {
    bookingState.setStartTime("");
    bookingState.setEndTime("");
    bookingState.setArrivalTime("");
  };

  // 🎯 Early returns
  if (error) {
    return (
      <section className="booking-date-page py-3">
        <div className="container">
          <BookingErrorDisplay error={error} type="danger" />
        </div>
      </section>
    );
  }

  if (requiresQuote) {
    router.push("/contact");
    return null;
  }

  // 🎯 Main render
  return (
    <section className="booking-date-page py-3">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-10">
            <div
              className="booking-card"
              style={{ padding: "1.25rem" }}
              ref={accordion.bookingCardRef}
            >
              {/* Progress Bar */}
              <BookingProgressBar
                currentStep={2}
                customLabels={{
                  step1: spaceInfo.subtitle,
                  step2: bookingState.selectedDate
                    ? new Date(bookingState.selectedDate).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "short",
                      })
                    : "Date",
                  step3: "Détails",
                  step4: "Paiement",
                }}
              />

              {/* Loading State */}
              {loading && (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Chargement...</span>
                  </div>
                </div>
              )}

              {/* Content */}
              {!loading && (
                <>
                  {/* Reservation Type Selector */}
                  <ReservationTypeSelector
                    value={bookingState.reservationType}
                    availableTypes={availableReservationTypes}
                    onChange={bookingState.setReservationType}
                    onReset={handleResetTimeSelections}
                    className="mb-4"
                  />

                  {/* Date Selection */}
                  {bookingState.reservationType && (
                    <DateSelectionSection
                      reservationType={bookingState.reservationType}
                      selectedDate={bookingState.selectedDate}
                      endDate={bookingState.endDate}
                      onDateChange={handleDateChange}
                      isOpen={accordion.dateSectionOpen}
                      isClosing={accordion.dateSectionClosing}
                      onToggle={accordion.toggleDateSection}
                      className="mb-3"
                    />
                  )}

                  {/* Time Selection */}
                  <TimeSelectionSection
                    ref={accordion.timeSectionRef}
                    reservationType={bookingState.reservationType}
                    selectedDate={bookingState.selectedDate}
                    startTime={bookingState.startTime}
                    endTime={bookingState.endTime}
                    arrivalTime={bookingState.arrivalTime}
                    availableStartSlots={getAvailableStartTimeSlots()}
                    availableEndSlots={getAvailableEndTimeSlots()}
                    onStartTimeChange={handleStartTimeSelection}
                    onEndTimeChange={bookingState.setEndTime}
                    onArrivalTimeChange={bookingState.setArrivalTime}
                    isOpen={accordion.timeSectionOpen}
                    onToggle={accordion.toggleTimeSection}
                    className="mb-3"
                  />

                  {/* People Counter & Price Display - Side by side on desktop */}
                  {pricing.calculatedPrice > 0 && (
                    <div className="row g-3 mb-4">
                      {/* People Counter - Only for perPerson pricing */}
                      {spaceConfig?.pricing.perPerson && (
                        <div className="col-md-6">
                          <PeopleCounterSection
                            numberOfPeople={bookingState.numberOfPeople}
                            minCapacity={spaceConfig.minCapacity}
                            maxCapacity={spaceConfig.maxCapacity}
                            onChange={bookingState.setNumberOfPeople}
                          />
                        </div>
                      )}

                      {/* Price Display */}
                      <div className={spaceConfig?.pricing.perPerson ? "col-md-6" : "col-12"}>
                        <PriceDisplayCard
                          price={pricing.displayPrice}
                          duration={pricing.duration}
                          reservationType={bookingState.reservationType}
                          numberOfPeople={bookingState.numberOfPeople}
                          showTTC={bookingState.showTTC}
                          onToggleTTC={bookingState.setShowTTC}
                          perPerson={spaceConfig?.pricing.perPerson || false}
                        />
                      </div>
                    </div>
                  )}

                  {/* Validation Errors */}
                  {!validation.isValid && Object.keys(validation.errors).length > 0 && (
                    <div className="mb-3">
                      {Object.values(validation.errors).map((err, idx) => (
                        <BookingErrorDisplay key={idx} error={err} type="warning" />
                      ))}
                    </div>
                  )}

                  {/* Continue Button */}
                  <button
                    className="btn btn-success btn-lg w-100"
                    style={{ fontSize: "0.95rem" }}
                    onClick={handleContinue}
                    disabled={!validation.canContinue || loading}
                  >
                    Continuer vers les détails
                    <i className="bi bi-arrow-right ms-2" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
