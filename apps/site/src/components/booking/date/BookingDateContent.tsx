// ============================================================================
// BookingDateContent Component
// ============================================================================
// Main content component for booking date selection page
// Handles all booking form sections and interactions
// ============================================================================

import { forwardRef } from "react";
import BookingProgressBar from "@/components/site/booking/BookingProgressBar";
import { BookingErrorDisplay } from "@/components/site/booking/BookingErrorDisplay";
import { ReservationTypeSelector } from "@/components/site/booking/ReservationTypeSelector";
import { DateSelectionSection } from "@/components/site/booking/DateSelectionSection";
import { TimeSelectionSection } from "@/components/site/booking/TimeSelectionSection";
import { PeopleCounterSection } from "@/components/site/booking/PeopleCounterSection";
import { PriceDisplayCard } from "@/components/site/booking/PriceDisplayCard";
import type { ReservationType, SpaceConfig, ReservationTypeOption } from "@/types/booking";

export interface BookingDateContentProps {
  /** Space information for progress bar */
  spaceInfo: {
    title: string;
    subtitle: string;
  };
  /** Space configuration */
  spaceConfig: SpaceConfig | null;
  /** Loading state */
  loading: boolean;
  /** Available reservation types for this space */
  availableReservationTypes: ReservationTypeOption[];
  /** Booking state values */
  bookingState: {
    reservationType: ReservationType;
    selectedDate: string;
    endDate: string;
    startTime: string;
    endTime: string;
    arrivalTime: string;
    numberOfPeople: number;
    showTTC: boolean;
    setReservationType: (type: ReservationType) => void;
    setNumberOfPeople: (count: number) => void;
    setShowTTC: (show: boolean) => void;
    setEndTime: (time: string) => void;
    setArrivalTime: (time: string) => void;
  };
  /** Accordion state */
  accordion: {
    bookingCardRef: React.RefObject<HTMLDivElement | null>;
    dateSectionOpen: boolean;
    dateSectionClosing: boolean;
    timeSectionOpen: boolean;
    timeSectionRef: React.RefObject<HTMLDivElement | null>;
    toggleDateSection: () => void;
    toggleTimeSection: () => void;
  };
  /** Available time slots */
  timeSlots: {
    availableStartSlots: string[];
    availableEndSlots: string[];
  };
  /** Pricing information */
  pricing: {
    calculatedPrice: number;
    displayPrice: number;
    duration: string;
  };
  /** Validation state */
  validation: {
    isValid: boolean;
    canContinue: boolean;
    errors: {
      date?: string;
      time?: string;
      people?: string;
      general?: string;
    };
  };
  /** Handlers */
  handlers: {
    handleDateChange: (date: string) => void;
    handleStartTimeSelection: (time: string) => void;
    handleContinue: () => void;
    handleResetTimeSelections: () => void;
  };
}

/**
 * Main content component for booking date selection
 * Extracted to reduce page.tsx size
 */
export const BookingDateContent = forwardRef<HTMLDivElement, BookingDateContentProps>(
  function BookingDateContent(
    {
      spaceInfo,
      spaceConfig,
      loading,
      availableReservationTypes,
      bookingState,
      accordion,
      timeSlots,
      pricing,
      validation,
      handlers,
    },
    ref
  ) {
    return (
      <div className="booking-card" style={{ padding: "1.25rem" }} ref={accordion.bookingCardRef}>
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
              onReset={handlers.handleResetTimeSelections}
              className="mb-4"
            />

            {/* Date Selection */}
            {bookingState.reservationType && (
              <DateSelectionSection
                reservationType={bookingState.reservationType}
                selectedDate={bookingState.selectedDate}
                endDate={bookingState.endDate}
                onDateChange={handlers.handleDateChange}
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
              availableStartSlots={timeSlots.availableStartSlots}
              availableEndSlots={timeSlots.availableEndSlots}
              onStartTimeChange={handlers.handleStartTimeSelection}
              onEndTimeChange={bookingState.setEndTime}
              onArrivalTimeChange={bookingState.setArrivalTime}
              isOpen={accordion.timeSectionOpen}
              onToggle={accordion.toggleTimeSection}
              className="mb-3"
            />

            {/* People Counter & Price Display - Side by side on desktop */}
            {pricing.calculatedPrice > 0 && (
              <div className="row g-3 mb-4 align-items-stretch">
                {/* People Counter - Only for perPerson pricing */}
                {spaceConfig?.pricing.perPerson && (
                  <div className="col-md-6 d-flex">
                    <PeopleCounterSection
                      numberOfPeople={bookingState.numberOfPeople}
                      minCapacity={spaceConfig.minCapacity}
                      maxCapacity={spaceConfig.maxCapacity}
                      onChange={bookingState.setNumberOfPeople}
                      className="w-100"
                    />
                  </div>
                )}

                {/* Price Display */}
                <div className={`${spaceConfig?.pricing.perPerson ? "col-md-6" : "col-12"} d-flex`}>
                  <PriceDisplayCard
                    price={pricing.displayPrice}
                    duration={pricing.duration}
                    reservationType={bookingState.reservationType}
                    numberOfPeople={bookingState.numberOfPeople}
                    showTTC={bookingState.showTTC}
                    onToggleTTC={bookingState.setShowTTC}
                    perPerson={spaceConfig?.pricing.perPerson || false}
                    className="w-100"
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
              onClick={handlers.handleContinue}
              disabled={!validation.canContinue || loading}
            >
              Continuer vers les détails
              <i className="bi bi-arrow-right ms-2" />
            </button>
          </>
        )}
      </div>
    );
  }
);
