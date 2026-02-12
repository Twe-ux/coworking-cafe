"use client";

import InfoEmpreinte from "@/components/site/booking/InfoEmpreinte";
import dynamic from "next/dynamic";

const PaymentFormContent = dynamic(
  () => import("@/components/site/booking/PaymentFormContent"),
  { ssr: false }
);
import CancellationPolicyDisplay from "@/components/site/booking/CancellationPolicyDisplay";
import TermsCheckbox from "./TermsCheckbox";
import { Elements } from "@stripe/react-stripe-js";
import type { Stripe } from "@stripe/stripe-js";
import type { BookingData } from "@/types/booking";
import { useRouter } from "next/navigation";

interface CancellationTier {
  daysBeforeBooking: number;
  chargePercentage: number;
}

interface CancellationPolicy {
  spaceType: string;
  tiers: CancellationTier[];
}

interface PaymentSectionProps {
  stripePromise: Promise<Stripe | null> | null;
  showPaymentForm: boolean;
  clientSecret: string;
  intentType: "manual_capture" | "setup_intent";
  bookingId: string;
  bookingData: BookingData;
  daysUntilBooking: number;
  depositAmount: number;
  paymentError: string;
  paymentProcessing: boolean;
  acceptedTerms: boolean;
  cancellationPolicy: CancellationPolicy | null;
  onAcceptedTermsChange: (accepted: boolean) => void;
  onPaymentError: (error: string) => void;
  onCreateReservation: () => void;
}

export default function PaymentSection({
  stripePromise,
  showPaymentForm,
  clientSecret,
  intentType,
  bookingId,
  bookingData,
  daysUntilBooking,
  depositAmount,
  paymentError,
  paymentProcessing,
  acceptedTerms,
  cancellationPolicy,
  onAcceptedTermsChange,
  onPaymentError,
  onCreateReservation,
}: PaymentSectionProps) {
  const router = useRouter();

  return (
    <div className="booking-card d-flex flex-column" style={{ height: "100%" }}>
      <div
        className="d-flex align-items-center gap-3 mb-4 pb-3"
        style={{ borderBottom: "2px solid #f0f0f0" }}
      >
        <i
          className="bi bi-credit-card"
          style={{ fontSize: "1.5rem", color: "#588983" }}
        ></i>
        <h2
          className="h6 mb-0 fw-bold"
          style={{ fontSize: "1.125rem", color: "#333" }}
        >
          Paiement sécurisé
        </h2>
      </div>

      {/* Info empreinte */}
      <InfoEmpreinte
        type={daysUntilBooking <= 7 ? "manual_capture" : "setup_intent"}
        amount={depositAmount}
        daysUntilBooking={daysUntilBooking}
      />

      {/* Payment Error */}
      {paymentError && (
        <div className="alert alert-danger" role="alert">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {paymentError}
        </div>
      )}

      {/* Payment Form or Button */}
      {!stripePromise ? (
        <div className="alert alert-danger" role="alert">
          <i className="bi bi-exclamation-triangle me-2"></i>
          <strong>Configuration manquante :</strong> La clé publique Stripe
          n'est pas configurée. Veuillez contacter l'administrateur.
        </div>
      ) : showPaymentForm && clientSecret ? (
        <Elements
          stripe={stripePromise}
          options={{
            clientSecret,
            appearance: {
              theme: "stripe" as const,
              variables: {
                colorPrimary: "#588983",
                colorBackground: "#ffffff",
                colorText: "#333333",
                colorDanger: "#df1b41",
                fontFamily:
                  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                spacingUnit: "4px",
                borderRadius: "8px",
              },
              rules: {
                ".Input": {
                  border: "1px solid #e0e0e0",
                  boxShadow: "none",
                },
                ".Input:focus": {
                  border: "1px solid #588983",
                  boxShadow: "0 0 0 1px #588983",
                },
                ".Label": {
                  color: "#333333",
                  fontWeight: "600",
                },
              },
            },
          }}
        >
          <PaymentFormContent
            bookingId={bookingId}
            intentType={intentType}
            bookingData={bookingData}
            onSuccess={() => {
              // Clear all sessionStorage for booking
              sessionStorage.removeItem("bookingData");
              sessionStorage.removeItem("selectedServices");
              sessionStorage.removeItem("paymentClientSecret");
              sessionStorage.removeItem("paymentIntentType");
              sessionStorage.removeItem("showPaymentForm");
              sessionStorage.removeItem("acceptedTerms");
              router.push(`/booking/confirmation/${bookingId}`);
            }}
            onError={onPaymentError}
            acceptedTerms={acceptedTerms}
          />
        </Elements>
      ) : (
        <div className="flex-grow-1 d-flex flex-column justify-content-center">
          {/* Cancellation Policy Info */}
          {cancellationPolicy && (
            <CancellationPolicyDisplay
              cancellationPolicy={cancellationPolicy}
            />
          )}

          {/* Terms Acceptance Checkbox */}
          <TermsCheckbox
            acceptedTerms={acceptedTerms}
            onAcceptedTermsChange={onAcceptedTermsChange}
          />

          <button
            className="btn w-100"
            onClick={onCreateReservation}
            disabled={paymentProcessing || !acceptedTerms}
            style={{
              padding: "1rem 2rem",
              fontSize: "1rem",
              fontWeight: "600",
              backgroundColor: acceptedTerms ? "#588983" : "#ccc",
              color: "white",
              border: "none",
              cursor: acceptedTerms ? "pointer" : "not-allowed",
            }}
          >
            {paymentProcessing ? (
              <>
                <span className="spinner-border spinner-border-sm me-2"></span>
                Création en cours...
              </>
            ) : (
              <>
                <i className="bi bi-lock me-2"></i>
                Valider la réservation
              </>
            )}
          </button>
        </div>
      )}

      <p
        className="text-center text-muted mt-3"
        style={{ fontSize: "0.8125rem" }}
      >
        <i className="bi bi-shield-check me-1"></i>
        Paiement sécurisé par Stripe
      </p>
    </div>
  );
}
