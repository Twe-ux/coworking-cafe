import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useBookingForm } from "@/hooks/useBookingForm";
import type { BookingData, AdditionalService, SelectedService } from "@/types/booking";

interface SpaceConfig {
  depositPolicy: {
    enabled: boolean;
    percentage?: number;
    fixedAmount?: number;
    minimumAmount?: number;
  };
}

interface CancellationTier {
  daysBeforeBooking: number;
  chargePercentage: number;
}

interface CancellationPolicy {
  spaceType: string;
  tiers: CancellationTier[];
}

const slugToSpaceType: Record<string, string> = {
  "open-space": "open-space",
  "meeting-room-glass": "salle-verriere",
  "meeting-room-floor": "salle-etage",
  "event-space": "evenementiel",
};

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

  const [daysUntilBooking, setDaysUntilBooking] = useState<number>(0);
  const [spaceConfig, setSpaceConfig] = useState<SpaceConfig | null>(null);

  // Stripe payment states
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
  const [cancellationPolicy, setCancellationPolicy] = useState<CancellationPolicy | null>(null);

  // Clear payment state on page load
  useEffect(() => {
    if (typeof window === "undefined") return;

    sessionStorage.removeItem("paymentClientSecret");
    sessionStorage.removeItem("paymentIntentType");
    sessionStorage.removeItem("showPaymentForm");
    sessionStorage.removeItem("paymentBookingHash");
    console.log("[Payment] Cleared stale payment data on page load");
  }, []);

  // Load booking data and fetch configs
  useEffect(() => {
    console.log("[BookingSummaryPage] bookingData:", bookingData);

    if (bookingData) {
      setIsLoading(false);

      const now = new Date();
      const bookingDate = new Date(bookingData.date);
      const days = Math.ceil(
        (bookingDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
      );
      setDaysUntilBooking(days);

      const dbSpaceType = slugToSpaceType[bookingData.spaceType] || bookingData.spaceType;

      fetch(`/api/space-configurations/${dbSpaceType}`)
        .then((res) => res.ok ? res.json() : null)
        .then((data) => data && setSpaceConfig(data.data))
        .catch((error) => console.error("Error fetching space config:", error));

      fetch(`/api/cancellation-policy?spaceType=${dbSpaceType}`)
        .then((res) => res.ok ? res.json() : null)
        .then((data) => data && setCancellationPolicy(data.data.cancellationPolicy))
        .catch((error) => console.error("Error fetching cancellation policy:", error));

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

  const isDailyRate = (): boolean => {
    return bookingData?.isDailyRate === true;
  };

  const calculateServicesPrice = (): number => {
    if (!bookingData) return 0;
    let total = 0;
    const isDaily = isDailyRate();

    selectedServices.forEach((selected) => {
      const service = selected.service;
      const quantity = selected.quantity;

      const priceToUse =
        isDaily && service.dailyPrice !== undefined
          ? service.dailyPrice
          : service.price;

      if (service.priceUnit === "per-person") {
        total += priceToUse * bookingData.numberOfPeople * quantity;
      } else {
        total += priceToUse * quantity;
      }
    });
    return total;
  };

  const getTotalPrice = (): number => {
    if (!bookingData) return 0;
    return bookingData.basePrice + calculateServicesPrice();
  };

  const calculateDepositAmount = (): number => {
    const totalPrice = getTotalPrice();
    if (!spaceConfig?.depositPolicy?.enabled) {
      return totalPrice * 100;
    }

    const totalPriceInCents = totalPrice * 100;
    const policy = spaceConfig.depositPolicy;

    let depositInCents = totalPriceInCents;

    if (policy.fixedAmount) {
      depositInCents = policy.fixedAmount;
    } else if (policy.percentage) {
      depositInCents = Math.round(
        totalPriceInCents * (policy.percentage / 100),
      );
    }

    if (policy.minimumAmount && depositInCents < policy.minimumAmount) {
      depositInCents = policy.minimumAmount;
    }
    return depositInCents;
  };

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
