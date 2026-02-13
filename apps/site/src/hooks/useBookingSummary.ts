import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useBookingForm } from "@/hooks/useBookingForm";
import { useBookingPricing } from "@/hooks/booking/useBookingPricing";
import { useBookingConfig } from "@/hooks/booking/useBookingConfig";
import { useBookingPayment } from "@/hooks/booking/useBookingPayment";

/**
 * useBookingSummary - Main hook for booking summary page
 *
 * Composes specialized hooks:
 * - useBookingForm: Form state management
 * - useBookingConfig: Space configurations and policies
 * - useBookingPricing: Price calculations
 * - useBookingPayment: Stripe payment logic
 */

export function useBookingSummary() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  const {
    bookingData,
    selectedServices,
    showTTC,
    setShowTTC,
    convertPrice,
    loading,
  } = useBookingForm({ loadFromStorage: true, loadServices: true, autoSave: false });

  // Fetch configurations (space config, cancellation policy, days until booking)
  const { daysUntilBooking, spaceConfig, cancellationPolicy } = useBookingConfig({
    bookingData,
  });

  // Price calculations
  const { isDailyRate, calculateServicesPrice, getTotalPrice, calculateDepositAmount } =
    useBookingPricing({
      bookingData,
      selectedServices,
      spaceConfig,
    });

  // Payment logic
  const {
    clientSecret,
    intentType,
    bookingId,
    showPaymentForm,
    paymentError,
    paymentProcessing,
    acceptedTerms,
    setAcceptedTerms,
    setPaymentError,
    handleCreateReservation,
  } = useBookingPayment({
    bookingData,
    selectedServices,
    calculateServicesPrice,
    getTotalPrice,
    isDailyRate,
  });

  // Load booking data and redirect if missing
  useEffect(() => {
    console.log("[BookingSummaryPage] bookingData:", bookingData);

    if (bookingData) {
      setIsLoading(false);
      return;
    }

    const hasStoredData = typeof window !== 'undefined' && sessionStorage.getItem("bookingData");
    console.log("[BookingSummaryPage] hasStoredData:", !!hasStoredData);

    const timer = setTimeout(() => {
      if (!bookingData && !hasStoredData) {
        console.log("[BookingSummaryPage] No booking data, redirecting to /booking");
        router.push("/booking");
      } else {
        setIsLoading(false);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [bookingData, router]);

  return {
    // States
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

    // Setters
    setShowTTC,
    setAcceptedTerms,
    setPaymentError,

    // Functions
    convertPrice,
    isDailyRate,
    getTotalPrice,
    calculateDepositAmount,
    handleCreateReservation,
  };
}
