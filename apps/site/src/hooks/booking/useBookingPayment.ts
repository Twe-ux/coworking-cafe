import { useEffect, useState } from "react";
import type { BookingData, SelectedServicesMap } from "@/types/booking";

/**
 * useBookingPayment - Stripe payment logic
 *
 * Handles:
 * - Payment intent creation
 * - Payment state management
 * - Terms acceptance
 * - Session storage for payment persistence
 */

interface UseBookingPaymentProps {
  bookingData: BookingData | null;
  selectedServices: SelectedServicesMap;
  calculateServicesPrice: () => number;
  getTotalPrice: () => number;
  isDailyRate: () => boolean;
}

export function useBookingPayment({
  bookingData,
  selectedServices,
  calculateServicesPrice,
  getTotalPrice,
  isDailyRate,
}: UseBookingPaymentProps) {
  const [clientSecret, setClientSecret] = useState<string>("");
  const [intentType, setIntentType] = useState<"manual_capture" | "setup_intent">("manual_capture");
  const [bookingId, setBookingId] = useState<string>("");
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentError, setPaymentError] = useState<string>("");
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("acceptedTerms") === "true";
    }
    return false;
  });

  // Clear payment state on page load
  useEffect(() => {
    if (typeof window === "undefined") return;

    sessionStorage.removeItem("paymentClientSecret");
    sessionStorage.removeItem("paymentIntentType");
    sessionStorage.removeItem("showPaymentForm");
    sessionStorage.removeItem("paymentBookingHash");
    console.log("[Payment] Cleared stale payment data on page load");
  }, []);

  const handleCreateReservation = async () => {
    if (!bookingData) return;

    setPaymentProcessing(true);
    setPaymentError("");

    try {
      const isDaily = isDailyRate();
      const additionalServicesData = Array.from(selectedServices.values()).map(
        (selected) => {
          const priceToUse =
            isDaily && selected.service.dailyPrice !== undefined
              ? selected.service.dailyPrice
              : selected.service.price;

          return {
            service: selected.service._id,
            name: selected.service.name,
            quantity: selected.quantity,
            unitPrice: priceToUse,
            totalPrice:
              selected.service.priceUnit === "per-person"
                ? priceToUse * bookingData.numberOfPeople * selected.quantity
                : priceToUse * selected.quantity,
          };
        },
      );

      const reservationData = {
        spaceType: bookingData.spaceType,
        date: bookingData.date,
        startTime: bookingData.startTime,
        endTime: bookingData.endTime,
        numberOfPeople: bookingData.numberOfPeople,
        reservationType: bookingData.reservationType,
        basePrice: bookingData.basePrice,
        servicesPrice: calculateServicesPrice(),
        totalPrice: getTotalPrice(),
        contactName: bookingData.contactName,
        contactEmail: bookingData.contactEmail,
        contactPhone: bookingData.contactPhone,
        companyName: bookingData.contactCompanyName,
        specialRequests: bookingData.specialRequests,
        additionalServices: JSON.stringify(additionalServicesData),
        requiresPayment: true,
        createAccount: bookingData.createAccount || false,
        subscribeNewsletter: bookingData.subscribeNewsletter || false,
        password: bookingData.password,
      };

      const paymentResponse = await fetch("/api/payments/create-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reservationData }),
      });

      const paymentData = await paymentResponse.json();

      if (!paymentData.success) {
        setPaymentError(
          paymentData.error || "Erreur lors de la création du paiement",
        );
        setPaymentProcessing(false);
        return;
      }

      const newClientSecret = paymentData.data.clientSecret;
      const newIntentType = paymentData.data.type || "manual_capture";

      // Persist to sessionStorage
      sessionStorage.setItem("paymentClientSecret", newClientSecret);
      sessionStorage.setItem("paymentIntentType", newIntentType);
      sessionStorage.setItem("showPaymentForm", "true");
      const bookingDataStr = sessionStorage.getItem("bookingData");
      const bookingHash = bookingDataStr
        ? btoa(bookingDataStr).slice(0, 32)
        : "";
      sessionStorage.setItem("paymentBookingHash", bookingHash);

      setClientSecret(newClientSecret);
      setIntentType(newIntentType);
      setShowPaymentForm(true);
      setPaymentProcessing(false);
    } catch (error) {
      setPaymentError("Une erreur est survenue");
      setPaymentProcessing(false);
    }
  };

  return {
    // States
    clientSecret,
    intentType,
    bookingId,
    showPaymentForm,
    paymentError,
    paymentProcessing,
    acceptedTerms,

    // Setters
    setAcceptedTerms,
    setPaymentError,

    // Actions
    handleCreateReservation,
  };
}
