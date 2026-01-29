// ============================================================================
// PaymentFormContent Component
// ============================================================================
// Stripe payment form component for booking summary page
// Extracted from page.tsx to reduce file size
// Created: 2026-01-29
// ============================================================================

"use client";

import { useState } from "react";
import { PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import type { BookingData } from "@/types/booking";

// ============================================================================
// Props Interface
// ============================================================================

interface PaymentFormContentProps {
  bookingId?: string;
  intentType: "manual_capture" | "setup_intent";
  bookingData: BookingData;
  onSuccess: () => void;
  onError: (error: string) => void;
  acceptedTerms: boolean;
}

// ============================================================================
// Component
// ============================================================================

export default function PaymentFormContent({
  bookingId,
  intentType,
  bookingData,
  onSuccess,
  onError,
  acceptedTerms,
}: PaymentFormContentProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const returnUrl = `${window.location.origin}/booking/confirmation/success`;

      if (intentType === "setup_intent") {
        const { error } = await stripe.confirmSetup({
          elements,
          confirmParams: {
            return_url: returnUrl,
          },
        });

        if (error) {
          onError(error.message || "Une erreur est survenue");
          setIsProcessing(false);
        } else {
          onSuccess();
        }
      } else {
        const { error } = await stripe.confirmPayment({
          elements,
          confirmParams: {
            return_url: returnUrl,
          },
        });

        if (error) {
          onError(error.message || "Une erreur est survenue");
          setIsProcessing(false);
        } else {
          onSuccess();
        }
      }
    } catch (err) {
      onError("Une erreur est survenue lors du paiement");
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4">
      <PaymentElement />
      <button
        type="submit"
        disabled={!stripe || isProcessing || !acceptedTerms}
        className="btn w-100 mt-4"
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
        {isProcessing ? (
          <>
            <span className="spinner-border spinner-border-sm me-2"></span>
            Traitement en cours...
          </>
        ) : (
          <>
            <i className="bi bi-lock me-2"></i>
            Valider la réservation
          </>
        )}
      </button>
    </form>
  );
}
