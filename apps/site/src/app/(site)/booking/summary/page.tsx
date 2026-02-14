"use client";

import SummaryHeader from "@/components/booking/summary/SummaryHeader";
import BookingSummaryCard from "@/components/booking/summary/BookingSummaryCard";
import PaymentSection from "@/components/booking/summary/PaymentSection";
import PriceBreakdownTable from "@/components/site/booking/PriceBreakdownTable";
import { loadStripe } from "@stripe/stripe-js";
import { useRouter } from "next/navigation";
import { useBookingSummary } from "@/hooks/useBookingSummary";
import { SPACE_TYPE_INFO as spaceTypeInfo } from "@/types/booking";
import "../../[id]/client-dashboard.scss";

// Validate Stripe publishable key
const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
if (!stripePublishableKey) {
  console.error("⚠️ NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not configured");
}
const stripePromise = stripePublishableKey
  ? loadStripe(stripePublishableKey)
  : null;

export default function BookingSummaryPage() {
  const router = useRouter();

  const {
    isLoading,
    bookingData,
    selectedServices,
    showTTC,
    daysUntilBooking,
    clientSecret,
    intentType,
    bookingId,
    showPaymentForm,
    paymentError,
    paymentProcessing,
    acceptedTerms,
    cancellationPolicy,
    setShowTTC,
    setAcceptedTerms,
    setPaymentError,
    convertPrice,
    isDailyRate,
    getTotalPrice,
    calculateDepositAmount,
    handleCreateReservation,
  } = useBookingSummary();

  if (isLoading || !bookingData) {
    return (
      <section className="booking-summary-page py-5">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-10">
              <div className="booking-card text-center py-5">
                <div className="spinner-border text-success" role="status">
                  <span className="visually-hidden">Chargement...</span>
                </div>
                <p className="mt-3 text-muted">Chargement du récapitulatif...</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const spaceInfo = spaceTypeInfo[bookingData.spaceType] || {
    title: "Espace",
    subtitle: "",
  };
  const dateLabel = new Date(bookingData.date).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
  });
  const timeLabel = `${bookingData.startTime}-${bookingData.endTime}`;
  const peopleLabel = `${bookingData.numberOfPeople} pers.`;

  return (
    <section className="booking-summary-page py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-10">
            <SummaryHeader
              currentStep={4}
              spaceSubtitle={spaceInfo.subtitle}
              dateLabel={dateLabel}
              timeLabel={timeLabel}
              peopleLabel={peopleLabel}
              spaceType={bookingData.spaceType}
              onBack={() => router.back()}
            />

            <div className="row g-3">
              {/* Left Column - Summary + Price Breakdown */}
              <div
                className="col-12 col-lg-7 d-flex flex-column"
                style={{ gap: "1rem" }}
              >
                <BookingSummaryCard bookingData={bookingData} />

                <PriceBreakdownTable
                  bookingData={bookingData}
                  selectedServices={selectedServices}
                  showTTC={showTTC}
                  setShowTTC={setShowTTC}
                  convertPrice={convertPrice}
                  isDailyRate={isDailyRate}
                  getTotalPrice={getTotalPrice}
                />
              </div>

              {/* Right Column - Payment */}
              <div
                className="col-12 col-lg-5 d-flex flex-column"
                style={{ gap: "1rem" }}
              >
                <PaymentSection
                  stripePromise={stripePromise}
                  showPaymentForm={showPaymentForm}
                  clientSecret={clientSecret}
                  intentType={intentType}
                  bookingId={bookingId}
                  bookingData={bookingData}
                  daysUntilBooking={daysUntilBooking}
                  depositAmount={calculateDepositAmount()}
                  paymentError={paymentError}
                  paymentProcessing={paymentProcessing}
                  acceptedTerms={acceptedTerms}
                  cancellationPolicy={cancellationPolicy}
                  onAcceptedTermsChange={setAcceptedTerms}
                  onPaymentError={setPaymentError}
                  onCreateReservation={handleCreateReservation}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
