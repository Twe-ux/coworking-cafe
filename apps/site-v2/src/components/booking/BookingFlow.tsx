"use client"

import { useState } from "react"
import type { Venue } from "@/types/venue"
import { SPACES, BOOKING_SERVICES } from "@/types/booking"
import { useBooking } from "@/hooks/useBooking"
import { BookingProgress } from "@/components/booking/BookingProgress"
import { BookingSummary } from "@/components/booking/BookingSummary"
import { VenueSelector } from "@/components/booking/VenueSelector"
import { Step1Space } from "@/components/booking/steps/Step1Space"
import { Step2DateTime } from "@/components/booking/steps/Step2DateTime"
import { Step3Options } from "@/components/booking/steps/Step3Options"
import { Step4Confirm } from "@/components/booking/steps/Step4Confirm"

interface BookingFlowProps {
  venues: Venue[]
}

// ─── Mobile CTA ───────────────────────────────────────────────────────────────

interface MobileCTAProps {
  step: number
  total: number
  canProceed: boolean
  onNext: () => void
  onConfirm: () => void
}

function MobileCTA({ step, total, canProceed, onNext, onConfirm }: MobileCTAProps) {
  const isConfirmStep = step === 4
  const containerBg = isConfirmStep ? "var(--btn)" : "var(--body)"
  const totalColor = isConfirmStep ? "var(--body)" : "white"

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-30 flex items-center justify-between"
      style={{
        background: containerBg,
        padding: "16px 20px",
        paddingBottom: "max(16px, env(safe-area-inset-bottom))",
      }}
    >
      {/* Total */}
      <span className="font-serif" style={{ fontSize: 22, color: totalColor }}>
        {total > 0 ? `${total.toFixed(2)}€` : "—"}
      </span>

      {/* CTA button */}
      {isConfirmStep ? (
        <button
          onClick={onConfirm}
          disabled={!canProceed}
          className="font-sans font-medium transition-opacity disabled:opacity-40"
          style={{
            height: 48,
            borderRadius: 999,
            background: "var(--body)",
            color: "white",
            border: "none",
            fontSize: 14,
            paddingInline: 24,
            cursor: canProceed ? "pointer" : "not-allowed",
          }}
        >
          Payer — {total.toFixed(2)}€
        </button>
      ) : (
        <button
          onClick={onNext}
          disabled={!canProceed}
          className="font-sans font-medium transition-opacity disabled:opacity-40"
          style={{
            height: 48,
            borderRadius: 999,
            background: "var(--btn)",
            color: "var(--body)",
            border: "none",
            fontSize: 14,
            paddingInline: 24,
            cursor: canProceed ? "pointer" : "not-allowed",
          }}
        >
          Continuer →
        </button>
      )}
    </div>
  )
}

// ─── BookingFlow ──────────────────────────────────────────────────────────────

export function BookingFlow({ venues }: BookingFlowProps) {
  const booking = useBooking(venues)
  const { state, pricing, totalSteps, firstStep, canProceed, nextStep, prevStep } = booking

  const [isLoading, setIsLoading] = useState(false)

  function handleConfirm() {
    setIsLoading(true)
    // Placeholder — Phase 5 branchera Stripe ici
    setTimeout(() => {
      setIsLoading(false)
      // TODO: redirect to /booking/confirmation
    }, 1500)
  }

  function renderStep() {
    switch (state.step) {
      case 0:
        return (
          <VenueSelector
            venues={venues}
            selectedVenueId={state.venueId}
            onSelect={booking.setVenue}
          />
        )
      case 1:
        return (
          <Step1Space
            spaces={SPACES}
            selectedSpaceId={state.spaceId}
            onSelect={booking.setSpace}
          />
        )
      case 2: {
        const selectedSpace = SPACES.find((s) => s.id === state.spaceId)
        return (
          <Step2DateTime
            bookingType={state.bookingType}
            date={state.date}
            startTime={state.startTime}
            people={state.people}
            maxPeople={selectedSpace?.maxPeople ?? 50}
            onTypeChange={booking.setBookingType}
            onDateChange={booking.setDate}
            onTimeChange={booking.setStartTime}
            onPeopleChange={booking.setPeople}
          />
        )
      }
      case 3:
        return (
          <Step3Options
            services={BOOKING_SERVICES}
            selectedServices={state.services}
            specialRequest={state.specialRequest}
            onToggleService={booking.toggleService}
            onSpecialRequestChange={booking.setSpecialRequest}
          />
        )
      case 4:
        return (
          <Step4Confirm
            state={state}
            pricing={pricing}
            spaces={SPACES}
            services={BOOKING_SERVICES}
            onConfirm={handleConfirm}
            isLoading={isLoading}
          />
        )
      default:
        return null
    }
  }

  const proceed = canProceed()
  const showBack = state.step > firstStep

  return (
    <>
      {/* ── Mobile ─────────────────────────────────────────────────────────── */}
      <div
        className="md:hidden flex flex-col min-h-screen"
        style={{ background: "var(--cream)" }}
      >
        <BookingProgress
          currentStep={state.step}
          firstStep={firstStep}
          totalSteps={totalSteps}
          onBack={prevStep}
          showBackButton={showBack}
        />

        <div className="flex-1 py-6 px-0" style={{ paddingBottom: 100 }}>
          {renderStep()}
        </div>

        <MobileCTA
          step={state.step}
          total={pricing.total}
          canProceed={proceed}
          onNext={nextStep}
          onConfirm={handleConfirm}
        />
      </div>

      {/* ── Desktop ────────────────────────────────────────────────────────── */}
      <div className="hidden md:flex h-screen overflow-hidden">
        <BookingProgress
          currentStep={state.step}
          firstStep={firstStep}
          totalSteps={totalSteps}
          onBack={prevStep}
          showBackButton={showBack}
        />

        <main
          className="flex-1 overflow-y-auto py-10 px-6"
          style={{ background: "var(--cream)" }}
        >
          {renderStep()}
        </main>

        <BookingSummary
          state={state}
          pricing={pricing}
          spaces={SPACES}
          services={BOOKING_SERVICES}
          canProceed={proceed}
          currentStep={state.step}
          onNext={nextStep}
          onConfirm={handleConfirm}
        />
      </div>
    </>
  )
}
