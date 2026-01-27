"use client";

import BookingProgressBar from "@/components/site/booking/BookingProgressBar";
import InfoEmpreinte from "@/components/site/booking/InfoEmpreinte";
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import "../../[id]/client-dashboard.scss";

// Validate Stripe publishable key
const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
if (!stripePublishableKey) {
  console.error("⚠️ NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not configured");
}
const stripePromise = stripePublishableKey
  ? loadStripe(stripePublishableKey)
  : null;

interface BookingData {
  spaceType: string;
  reservationType: string;
  date: string;
  startTime: string;
  endTime: string;
  basePrice: number;
  duration: string;
  numberOfPeople: number;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  specialRequests?: string;
  isDailyRate?: boolean;
  createAccount?: boolean;
  subscribeNewsletter?: boolean;
  password?: string;
}

interface AdditionalService {
  _id: string;
  name: string;
  description?: string;
  category: string;
  price: number;
  dailyPrice?: number;
  priceUnit: "per-person" | "flat-rate";
  vatRate: number;
  icon?: string;
}

interface SelectedService {
  service: AdditionalService;
  quantity: number;
}

const spaceTypeLabels: Record<string, string> = {
  "open-space": "Place - Open-space",
  "meeting-room-glass": "Salle de réunion - Verrière",
  "meeting-room-floor": "Salle de réunion - Étage",
  "event-space": "Événementiel",
};

const spaceTypeInfo: Record<string, { title: string; subtitle: string }> = {
  "open-space": { title: "Place", subtitle: "Open-space" },
  "meeting-room-glass": { title: "Salle de réunion", subtitle: "Verrière" },
  "meeting-room-floor": { title: "Salle de réunion", subtitle: "Étage" },
  "event-space": { title: "Événementiel", subtitle: "Grand espace" },
};

const reservationTypeLabels: Record<string, string> = {
  hourly: "À l'heure",
  daily: "À la journée",
  weekly: "À la semaine",
  monthly: "Au mois",
};

// Mapping inverse : URL slug → DB spaceType
const slugToSpaceType: Record<string, string> = {
  "open-space": "open-space",
  "meeting-room-glass": "salle-verriere",
  "meeting-room-floor": "salle-etage",
  "event-space": "evenementiel",
};

// Payment Form Component
interface PaymentFormContentProps {
  bookingId?: string; // Optional now, will be created by webhook
  intentType: "manual_capture" | "setup_intent";
  bookingData: BookingData;
  onSuccess: () => void;
  onError: (error: string) => void;
  acceptedTerms: boolean;
}

function PaymentFormContent({
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
      // NEW: Redirect to a generic success page (booking will be created by webhook)
      const returnUrl = `${window.location.origin}/booking/confirmation/success`;

      // Use the appropriate Stripe method based on intent type
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

export default function BookingSummaryPage() {
  const router = useRouter();
  const { data: session } = useSession();

  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  const [selectedServices, setSelectedServices] = useState<
    Map<string, SelectedService>
  >(new Map());
  const [loading, setLoading] = useState(false);
  const [daysUntilBooking, setDaysUntilBooking] = useState<number>(0);
  const [depositAmount, setDepositAmount] = useState<number>(0);
  const [spaceConfig, setSpaceConfig] = useState<any>(null);
  const [showTTC, setShowTTC] = useState(true);

  // Stripe payment states - restored from sessionStorage only if booking data matches
  const [clientSecret, setClientSecret] = useState<string>("");
  const [intentType, setIntentType] = useState<
    "manual_capture" | "setup_intent"
  >("manual_capture");
  const [bookingId, setBookingId] = useState<string>("");
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentError, setPaymentError] = useState<string>("");
  const [acceptedTerms, setAcceptedTerms] = useState(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("acceptedTerms") === "true";
    }
    return false;
  });
  const [cancellationPolicy, setCancellationPolicy] = useState<any>(null);

  // Restore payment state from sessionStorage if booking data matches
  // DISABLED: Always create fresh payment intent to avoid expired intent errors
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Clear any stale payment data on page load
    // This ensures we always create a fresh payment intent
    sessionStorage.removeItem("paymentClientSecret");
    sessionStorage.removeItem("paymentIntentType");
    sessionStorage.removeItem("showPaymentForm");
    sessionStorage.removeItem("paymentBookingHash");
    console.log("[Payment] Cleared stale payment data on page load");
  }, []);

  // Fonction pour convertir un prix entre TTC et HT
  const convertPrice = (
    priceTTC: number,
    vatRate: number,
    toTTC: boolean,
  ): number => {
    if (toTTC) {
      return priceTTC; // Already TTC
    } else {
      return priceTTC / (1 + vatRate / 100); // Convert to HT
    }
  };

  useEffect(() => {
    // Load booking data from sessionStorage
    const storedData = sessionStorage.getItem("bookingData");
    if (!storedData) {
      router.push("/booking");
      return;
    }
    const data = JSON.parse(storedData);
    setBookingData(data);

    // Calculate days until booking
    const now = new Date();
    const bookingDate = new Date(data.date);
    const days = Math.ceil(
      (bookingDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    );
    setDaysUntilBooking(days);

    // Load selected services from sessionStorage
    const storedServices = sessionStorage.getItem("selectedServices");
    if (storedServices) {
      const servicesArray = JSON.parse(storedServices) as [
        string,
        SelectedService,
      ][];
      const servicesMap = new Map<string, SelectedService>(servicesArray);
      setSelectedServices(servicesMap);
    }

    // Fetch space configuration to get deposit policy
    const fetchSpaceConfig = async () => {
      try {
        // Convert URL slug to DB spaceType
        const dbSpaceType = slugToSpaceType[data.spaceType] || data.spaceType;
        const response = await fetch(
          `/api/space-configurations/${dbSpaceType}`,
        );
        if (response.ok) {
          const configData = await response.json();
          setSpaceConfig(configData.data);
        } else {
          const errorData = await response.text();
        }
      } catch (error) {}
    };

    if (data.spaceType) {
      fetchSpaceConfig();
    } else {
    }

    // Fetch cancellation policy
    const fetchCancellationPolicy = async () => {
      try {
        const dbSpaceType = slugToSpaceType[data.spaceType] || data.spaceType;
        const response = await fetch(
          `/api/cancellation-policy?spaceType=${dbSpaceType}`,
        );
        if (response.ok) {
          const policyData = await response.json();
          setCancellationPolicy(policyData.data.cancellationPolicy);
        }
      } catch (error) {}
    };

    if (data.spaceType) {
      fetchCancellationPolicy();
    }
  }, []);

  const isDailyRate = () => {
    return bookingData?.isDailyRate === true;
  };

  const calculateServicesPrice = () => {
    let total = 0;
    const isDaily = isDailyRate();

    selectedServices.forEach((selected) => {
      const service = selected.service;
      const quantity = selected.quantity;

      // Utiliser le prix forfait jour si disponible et si c'est une réservation à la journée
      const priceToUse =
        isDaily && service.dailyPrice !== undefined
          ? service.dailyPrice
          : service.price;

      if (service.priceUnit === "per-person" && bookingData) {
        total += priceToUse * bookingData.numberOfPeople * quantity;
      } else {
        total += priceToUse * quantity;
      }
    });
    return total;
  };

  const updateServiceQuantity = (serviceId: string, quantity: number) => {
    const newSelected = new Map(selectedServices);
    const selected = newSelected.get(serviceId);
    if (selected && quantity >= 1) {
      newSelected.set(serviceId, { ...selected, quantity });
      setSelectedServices(newSelected);

      // Save to sessionStorage
      const servicesArray = Array.from(newSelected.entries());
      sessionStorage.setItem("selectedServices", JSON.stringify(servicesArray));
    }
  };

  const removeService = (serviceId: string) => {
    const newSelected = new Map(selectedServices);
    newSelected.delete(serviceId);
    setSelectedServices(newSelected);

    // Save to sessionStorage
    const servicesArray = Array.from(newSelected.entries());
    sessionStorage.setItem("selectedServices", JSON.stringify(servicesArray));
  };

  const getTotalPrice = () => {
    if (!bookingData) return 0;
    return bookingData.basePrice + calculateServicesPrice();
  };

  const calculateDepositAmount = () => {
    const totalPrice = getTotalPrice();
    if (!spaceConfig?.depositPolicy?.enabled) {
      return totalPrice * 100; // Default to full amount if no policy
    }

    const totalPriceInCents = totalPrice * 100;
    const policy = spaceConfig.depositPolicy;

    let depositInCents = totalPriceInCents;

    // Calculate deposit based on policy
    if (policy.fixedAmount) {
      depositInCents = policy.fixedAmount;
    } else if (policy.percentage) {
      depositInCents = Math.round(
        totalPriceInCents * (policy.percentage / 100),
      );
    }

    // Apply minimum if set
    if (policy.minimumAmount && depositInCents < policy.minimumAmount) {
      depositInCents = policy.minimumAmount;
    }
    return depositInCents;
  };

  const handleCreateReservation = async () => {
    if (!bookingData) return;

    setLoading(true);
    setPaymentError("");

    try {
      // Prepare additional services data
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

      // NEW WORKFLOW: Create payment intent with reservation data
      // The booking will be created by Stripe webhook after payment authorization
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
        specialRequests: bookingData.specialRequests,
        additionalServices: JSON.stringify(additionalServicesData), // Stringify for metadata
        requiresPayment: true,
        createAccount: bookingData.createAccount || false,
        subscribeNewsletter: bookingData.subscribeNewsletter || false,
        password: bookingData.password,
      };

      // Create payment intent with reservation data (no booking created yet)
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
        setLoading(false);
        return;
      }

      // Set client secret and show payment form
      // Note: bookingId will be set after webhook creates the booking
      const newClientSecret = paymentData.data.clientSecret;
      const newIntentType = paymentData.data.type || "manual_capture";

      // Persist to sessionStorage for hot-reload recovery
      sessionStorage.setItem("paymentClientSecret", newClientSecret);
      sessionStorage.setItem("paymentIntentType", newIntentType);
      sessionStorage.setItem("showPaymentForm", "true");
      // Save booking hash for validation on restore
      const bookingDataStr = sessionStorage.getItem("bookingData");
      const bookingHash = bookingDataStr ? btoa(bookingDataStr).slice(0, 32) : "";
      sessionStorage.setItem("paymentBookingHash", bookingHash);
      console.log("[Payment] Saved payment state with booking hash:", bookingHash);

      setClientSecret(newClientSecret);
      setIntentType(newIntentType);
      setShowPaymentForm(true);
      setLoading(false);
    } catch (error) {
      setPaymentError("Une erreur est survenue");
      setLoading(false);
    }
  };

  if (!bookingData) {
    return null;
  }

  const servicesPrice = calculateServicesPrice();
  const totalPrice = getTotalPrice();

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
    <>
      <section className="booking-summary-page py-5">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-10">
              <div className="booking-card mb-4">
                {/* Progress Bar */}
                <BookingProgressBar
                  currentStep={4}
                  customLabels={{
                    step1: spaceInfo.subtitle,
                    step2: `${dateLabel} ${timeLabel}\n${peopleLabel}`,
                    step3: "Détails",
                  }}
                  onStepClick={(step) => {
                    if (step === 1) {
                      router.push("/booking");
                    } else if (step === 2 && bookingData) {
                      router.push(`/booking/${bookingData.spaceType}/new`);
                    } else if (step === 3) {
                      router.push("/booking/details");
                    }
                  }}
                />

                <hr className="my-3" style={{ opacity: 0.1 }} />

                {/* Navigation and Title */}
                <div className="custom-breadcrumb d-flex justify-content-between align-items-center">
                  <button
                    onClick={() => router.back()}
                    className="breadcrumb-link"
                  >
                    <i className="bi bi-arrow-left"></i>
                    <span>Retour</span>
                  </button>
                  <h1 className="breadcrumb-current m-0">Récapitulatif</h1>
                  <div style={{ width: "80px" }}></div>
                </div>
              </div>

              <div className="row g-3">
                {/* Left Column (55%) - Summary + Price Breakdown */}
                <div
                  className="col-12 col-lg-7 d-flex flex-column"
                  style={{ gap: "1rem" }}
                >
                  <div
                    className="booking-card d-flex flex-column"
                    style={{ flex: 1 }}
                  >
                    <div
                      className="d-flex align-items-center gap-3 mb-4 pb-3"
                      style={{ borderBottom: "2px solid #f0f0f0" }}
                    >
                      <i
                        className="bi bi-calendar-check"
                        style={{ fontSize: "1.5rem", color: "#588983" }}
                      ></i>
                      <h2
                        className="h6 mb-0 fw-bold"
                        style={{ fontSize: "1.125rem", color: "#333" }}
                      >
                        Résumé de la réservation
                      </h2>
                    </div>

                    <div
                      className="summary-section"
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "0",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          padding: "12px 0",
                          borderBottom: "1px solid #f0f0f0",
                        }}
                      >
                        <span style={{ fontWeight: "600", color: "#666" }}>
                          Espace
                        </span>
                        <span style={{ color: "#333", textAlign: "right" }}>
                          {spaceTypeLabels[bookingData.spaceType]}
                        </span>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          padding: "12px 0",
                          borderBottom: "1px solid #f0f0f0",
                        }}
                      >
                        <span style={{ fontWeight: "600", color: "#666" }}>
                          Type
                        </span>
                        <span style={{ color: "#333", textAlign: "right" }}>
                          {reservationTypeLabels[bookingData.reservationType]}
                        </span>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          padding: "12px 0",
                          borderBottom: "1px solid #f0f0f0",
                        }}
                      >
                        <span style={{ fontWeight: "600", color: "#666" }}>
                          Date
                        </span>
                        <span style={{ color: "#333", textAlign: "right" }}>
                          {new Date(bookingData.date).toLocaleDateString(
                            "fr-FR",
                            {
                              weekday: "long",
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            },
                          )}
                        </span>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          padding: "12px 0",
                          borderBottom: "1px solid #f0f0f0",
                        }}
                      >
                        <span style={{ fontWeight: "600", color: "#666" }}>
                          Horaires
                        </span>
                        <span style={{ color: "#333", textAlign: "right" }}>
                          {bookingData.startTime} - {bookingData.endTime}{" "}
                        </span>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          padding: "12px 0",
                          borderBottom: "1px solid #f0f0f0",
                        }}
                      >
                        <span style={{ fontWeight: "600", color: "#666" }}>
                          Personnes
                        </span>
                        <span style={{ color: "#333", textAlign: "right" }}>
                          {bookingData.numberOfPeople}{" "}
                          {bookingData.numberOfPeople > 1
                            ? "personnes"
                            : "personne"}
                        </span>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          padding: "12px 0",
                          borderBottom: bookingData.specialRequests
                            ? "1px solid #f0f0f0"
                            : "none",
                        }}
                      >
                        <span style={{ fontWeight: "600", color: "#666" }}>
                          Contact
                        </span>
                        <span style={{ color: "#333", textAlign: "right" }}>
                          <div>{bookingData.contactName}</div>
                          <small style={{ color: "#999" }}>
                            {bookingData.contactEmail}
                          </small>
                          <br />
                          <small style={{ color: "#999" }}>
                            {bookingData.contactPhone}
                          </small>
                        </span>
                      </div>

                      {bookingData.specialRequests && (
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            padding: "12px 0",
                          }}
                        >
                          <span style={{ fontWeight: "600", color: "#666" }}>
                            Demandes
                          </span>
                          <span style={{ color: "#333", textAlign: "right" }}>
                            {bookingData.specialRequests}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Price Breakdown Card */}
                  <div className="booking-card">
                    <div
                      className="d-flex align-items-center gap-3 mb-4 pb-3"
                      style={{ borderBottom: "2px solid #f0f0f0" }}
                    >
                      <i
                        className="bi bi-cash-stack"
                        style={{ fontSize: "1.5rem", color: "#588983" }}
                      ></i>
                      <h2
                        className="h6 mb-0 fw-bold"
                        style={{ fontSize: "1.125rem", color: "#333" }}
                      >
                        Récapitulatif des prix
                      </h2>
                    </div>

                    <div className="price-breakdown">
                      {/* TTC/HT Switch */}
                      <div className="d-flex justify-content-end align-items-center gap-3 mb-3">
                        <span
                          className={`tax-toggle ${showTTC ? "active" : ""}`}
                          onClick={() => setShowTTC(true)}
                          style={{
                            cursor: "pointer",
                            fontSize: "0.875rem",
                            fontWeight: showTTC ? "600" : "400",
                          }}
                        >
                          Prix TTC
                        </span>
                        <div className="form-check form-switch mb-0">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            role="switch"
                            id="taxSwitchSummary"
                            checked={!showTTC}
                            onChange={() => setShowTTC(!showTTC)}
                            style={{ cursor: "pointer" }}
                          />
                        </div>
                        <span
                          className={`tax-toggle ${!showTTC ? "active" : ""}`}
                          onClick={() => setShowTTC(false)}
                          style={{
                            cursor: "pointer",
                            fontSize: "0.875rem",
                            fontWeight: !showTTC ? "600" : "400",
                          }}
                        >
                          Prix HT
                        </span>
                      </div>

                      {/* Header Row */}
                      <div
                        className="price-row d-none d-sm-block"
                        style={{
                          paddingBottom: "0.75rem",
                          marginBottom: "0.5rem",
                        }}
                      >
                        <div className="d-flex justify-content-between align-items-center w-100">
                          <span
                            style={{
                              fontWeight: "700",
                              fontSize: "0.9rem",
                              color: "#666",
                            }}
                          >
                            Prestation
                          </span>
                          <div className="d-flex gap-2 gap-md-4 align-items-center">
                            <span
                              style={{
                                fontWeight: "700",
                                fontSize: "0.85rem",
                                color: "#666",
                                minWidth: "50px",
                                textAlign: "right",
                              }}
                            >
                              Qté
                            </span>
                            <span
                              className="d-none d-md-inline"
                              style={{
                                fontWeight: "700",
                                fontSize: "0.85rem",
                                color: "#666",
                                minWidth: "100px",
                                textAlign: "right",
                              }}
                            >
                              Prix unitaire
                            </span>
                            <span
                              style={{
                                fontWeight: "700",
                                fontSize: "0.85rem",
                                color: "#666",
                                minWidth: "60px",
                                textAlign: "right",
                              }}
                            >
                              Total
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="price-divider"></div>

                      {/* Base Rate Row */}
                      <div
                        className="price-row"
                        style={{
                          paddingTop: "0.5rem",
                          paddingBottom: "0.5rem",
                        }}
                      >
                        <div className="d-flex justify-content-between align-items-center w-100">
                          <span>Tarif</span>
                          {/* Desktop & Tablet view */}
                          <div className="d-none d-sm-flex gap-2 gap-md-4 align-items-center">
                            <span
                              className="text-muted"
                              style={{
                                fontSize: "0.875rem",
                                minWidth: "50px",
                                textAlign: "right",
                              }}
                            >
                              {bookingData.numberOfPeople}{" "}
                              {bookingData.numberOfPeople > 1
                                ? "pers."
                                : "pers."}
                            </span>
                            <span
                              className="text-muted d-none d-md-inline"
                              style={{
                                fontSize: "0.875rem",
                                minWidth: "100px",
                                textAlign: "right",
                              }}
                            >
                              {(() => {
                                const vatRate =
                                  bookingData.reservationType === "hourly"
                                    ? 10
                                    : 20;
                                const unitPrice = convertPrice(
                                  bookingData.basePrice /
                                    bookingData.numberOfPeople,
                                  vatRate,
                                  showTTC,
                                );
                                return unitPrice.toFixed(2);
                              })()}
                              €
                            </span>
                            <span
                              className="fw-semibold"
                              style={{ minWidth: "60px", textAlign: "right" }}
                            >
                              {(() => {
                                const vatRate =
                                  bookingData.reservationType === "hourly"
                                    ? 10
                                    : 20;
                                const totalPrice = convertPrice(
                                  bookingData.basePrice,
                                  vatRate,
                                  showTTC,
                                );
                                return totalPrice.toFixed(2);
                              })()}
                              €
                            </span>
                          </div>
                          {/* Mobile view */}
                          <span className="d-sm-none fw-semibold">
                            {(() => {
                              const vatRate =
                                bookingData.reservationType === "hourly"
                                  ? 10
                                  : 20;
                              const totalPrice = convertPrice(
                                bookingData.basePrice,
                                vatRate,
                                showTTC,
                              );
                              return totalPrice.toFixed(2);
                            })()}
                            €
                          </span>
                        </div>
                      </div>

                      {selectedServices.size > 0 &&
                        Array.from(selectedServices.values()).map(
                          (selected) => {
                            const isDaily = isDailyRate();
                            const displayPriceTTC =
                              isDaily &&
                              selected.service.dailyPrice !== undefined
                                ? selected.service.dailyPrice
                                : selected.service.price;
                            const vatRate = selected.service.vatRate || 20;

                            const displayPrice = convertPrice(
                              displayPriceTTC,
                              vatRate,
                              showTTC,
                            );
                            const totalServicePrice =
                              selected.service.priceUnit === "per-person"
                                ? displayPrice *
                                  (bookingData?.numberOfPeople || 1) *
                                  selected.quantity
                                : displayPrice * selected.quantity;

                            return (
                              <div
                                key={selected.service._id}
                                className="price-row"
                                style={{
                                  paddingTop: "0.5rem",
                                  paddingBottom: "0.5rem",
                                }}
                              >
                                <div className="d-flex justify-content-between align-items-center w-100">
                                  <span>
                                    {selected.service.name}{" "}
                                    {selected.service.priceUnit ===
                                      "per-person" && "(par pers.)"}
                                  </span>
                                  {/* Desktop & Tablet view */}
                                  <div className="d-none d-sm-flex gap-2 gap-md-4 align-items-center">
                                    <span
                                      className="text-muted"
                                      style={{
                                        fontSize: "0.875rem",
                                        minWidth: "50px",
                                        textAlign: "right",
                                      }}
                                    >
                                      {selected.quantity}
                                    </span>
                                    <span
                                      className="text-muted d-none d-md-inline"
                                      style={{
                                        fontSize: "0.875rem",
                                        minWidth: "100px",
                                        textAlign: "right",
                                      }}
                                    >
                                      {displayPrice.toFixed(2)}€
                                    </span>
                                    <span
                                      className="fw-semibold"
                                      style={{
                                        minWidth: "60px",
                                        textAlign: "right",
                                      }}
                                    >
                                      {totalServicePrice.toFixed(2)}€
                                    </span>
                                  </div>
                                  {/* Mobile view */}
                                  <span className="d-sm-none fw-semibold">
                                    {totalServicePrice.toFixed(2)}€
                                  </span>
                                </div>
                              </div>
                            );
                          },
                        )}

                      <div className="price-row total-row">
                        <span>Total {showTTC ? "TTC" : "HT"}</span>
                        <span className="total-price">
                          {(() => {
                            // Calculate total TTC
                            const totalTTC = getTotalPrice();

                            if (showTTC) {
                              return totalTTC.toFixed(2);
                            } else {
                              // Convert to HT
                              const baseVatRate =
                                bookingData.reservationType === "hourly"
                                  ? 10
                                  : 20;
                              const baseHT = convertPrice(
                                bookingData.basePrice,
                                baseVatRate,
                                false,
                              );

                              let servicesHT = 0;
                              selectedServices.forEach((selected) => {
                                const service = selected.service;
                                const quantity = selected.quantity;
                                const isDaily = isDailyRate();
                                const displayPriceTTC =
                                  isDaily && service.dailyPrice !== undefined
                                    ? service.dailyPrice
                                    : service.price;
                                const vatRate = service.vatRate || 20;
                                const displayPriceHT = convertPrice(
                                  displayPriceTTC,
                                  vatRate,
                                  false,
                                );

                                if (service.priceUnit === "per-person") {
                                  servicesHT +=
                                    displayPriceHT *
                                    (bookingData?.numberOfPeople || 1) *
                                    quantity;
                                } else {
                                  servicesHT += displayPriceHT * quantity;
                                }
                              });

                              return (baseHT + servicesHT).toFixed(2);
                            }
                          })()}
                          €
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column (45%) - Payment Only */}
                <div
                  className="col-12 col-lg-5 d-flex flex-column"
                  style={{ gap: "1rem" }}
                >
                  <div
                    className="booking-card d-flex flex-column"
                    style={{ height: "100%" }}
                  >
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
                      type={
                        daysUntilBooking <= 7
                          ? "manual_capture"
                          : "setup_intent"
                      }
                      amount={calculateDepositAmount()}
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
                        <strong>Configuration manquante :</strong> La clé
                        publique Stripe n'est pas configurée. Veuillez contacter
                        l'administrateur.
                      </div>
                    ) : showPaymentForm && clientSecret ? (
                      <Elements
                        stripe={stripePromise}
                        options={
                          {
                            clientSecret,
                            appearance: {
                              theme: "stripe",
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
                          } as any
                        }
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
                          onError={(error) => setPaymentError(error)}
                          acceptedTerms={acceptedTerms}
                        />
                      </Elements>
                    ) : (
                      <div className="flex-grow-1 d-flex flex-column justify-content-center">
                        {/* Cancellation Policy Info */}
                        <div
                          style={{
                            background:
                              "linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)",
                            border: "2px solid #F59E0B",
                            borderRadius: "12px",
                            padding: "1.75rem",
                            marginBottom: "1.5rem",
                            boxShadow: "0 2px 8px rgba(245, 158, 11, 0.1)",
                          }}
                        >
                          <h6
                            style={{
                              color: "#92400E",
                              fontWeight: "700",
                              marginBottom: "1.25rem",
                              fontSize: "1.05rem",
                              display: "flex",
                              alignItems: "center",
                              gap: "0.5rem",
                            }}
                          >
                            <i
                              className="bi bi-info-circle-fill"
                              style={{ fontSize: "1.2rem" }}
                            ></i>
                            Conditions d'annulation
                          </h6>
                          {cancellationPolicy && cancellationPolicy.tiers && (
                            <div
                              style={{
                                color: "#78350f",
                                fontSize: "0.9rem",
                                lineHeight: "1.8",
                              }}
                            >
                              {cancellationPolicy.spaceType === "open_space" ? (
                                <>
                                  <p
                                    style={{
                                      marginBottom: "1rem",
                                      color: "#92400E",
                                      fontWeight: "500",
                                    }}
                                  >
                                    En cas d'annulation, des frais peuvent
                                    s'appliquer selon les délais :
                                  </p>
                                  <ul
                                    style={{
                                      marginBottom: "1rem",
                                      paddingLeft: "1.75rem",
                                      listStyleType: "disc",
                                    }}
                                  >
                                    {(() => {
                                      const sortedTiers = [
                                        ...cancellationPolicy.tiers,
                                      ].sort(
                                        (a: any, b: any) =>
                                          b.daysBeforeBooking -
                                          a.daysBeforeBooking,
                                      );
                                      return sortedTiers.map(
                                        (tier: any, index: number) => {
                                          let label = "";
                                          if (
                                            index ===
                                            sortedTiers.length - 1
                                          ) {
                                            if (sortedTiers.length > 1) {
                                              const previousTier =
                                                sortedTiers[index - 1];
                                              label = `Entre 0 et ${previousTier.daysBeforeBooking} jours avant`;
                                            } else {
                                              label = `Moins de ${tier.daysBeforeBooking} jour avant`;
                                            }
                                          } else if (index === 0) {
                                            label = `Plus de ${tier.daysBeforeBooking} jours avant`;
                                          } else {
                                            const previousTier =
                                              sortedTiers[index - 1];
                                            label = `Entre ${tier.daysBeforeBooking} et ${previousTier.daysBeforeBooking} jours avant`;
                                          }
                                          return (
                                            <li
                                              key={index}
                                              style={{
                                                marginBottom: "0.65rem",
                                                color: "#78350f",
                                              }}
                                            >
                                              <strong
                                                style={{ color: "#92400E" }}
                                              >
                                                {label}
                                              </strong>{" "}
                                              :{" "}
                                              {tier.chargePercentage === 0
                                                ? "Aucun frais"
                                                : `${tier.chargePercentage}% de frais`}
                                            </li>
                                          );
                                        },
                                      );
                                    })()}
                                  </ul>
                                </>
                              ) : (
                                <>
                                  <p
                                    style={{
                                      marginBottom: "1rem",
                                      color: "#92400E",
                                      fontWeight: "500",
                                    }}
                                  >
                                    Pour les salles de réunion, des frais
                                    d'annulation peuvent s'appliquer :
                                  </p>
                                  <ul
                                    style={{
                                      marginBottom: "1rem",
                                      paddingLeft: "1.75rem",
                                      listStyleType: "disc",
                                    }}
                                  >
                                    {(() => {
                                      const sortedTiers = [
                                        ...cancellationPolicy.tiers,
                                      ].sort(
                                        (a: any, b: any) =>
                                          b.daysBeforeBooking -
                                          a.daysBeforeBooking,
                                      );
                                      return sortedTiers.map(
                                        (tier: any, index: number) => {
                                          let label = "";
                                          if (
                                            index ===
                                            sortedTiers.length - 1
                                          ) {
                                            if (sortedTiers.length > 1) {
                                              const previousTier =
                                                sortedTiers[index - 1];
                                              label = `Entre 0 et ${previousTier.daysBeforeBooking} jours avant`;
                                            } else {
                                              label = `Moins de ${tier.daysBeforeBooking} jour avant`;
                                            }
                                          } else if (index === 0) {
                                            label = `Plus de ${tier.daysBeforeBooking} jours avant`;
                                          } else {
                                            const previousTier =
                                              sortedTiers[index - 1];
                                            label = `Entre ${tier.daysBeforeBooking} et ${previousTier.daysBeforeBooking} jours avant`;
                                          }
                                          return (
                                            <li
                                              key={index}
                                              style={{
                                                marginBottom: "0.65rem",
                                                color: "#78350f",
                                              }}
                                            >
                                              <strong
                                                style={{ color: "#92400E" }}
                                              >
                                                {label}
                                              </strong>{" "}
                                              :{" "}
                                              {tier.chargePercentage === 0
                                                ? "Aucun frais"
                                                : `${tier.chargePercentage}% de frais`}
                                            </li>
                                          );
                                        },
                                      );
                                    })()}
                                  </ul>
                                </>
                              )}
                              <div
                                style={{
                                  marginTop: "1rem",
                                  paddingTop: "1rem",
                                  borderTop: "1px solid #F59E0B",
                                  fontSize: "0.875rem",
                                  textAlign: "center",
                                }}
                              >
                                <p style={{ margin: "0", color: "#92400E" }}>
                                  Pour plus de détails, consultez nos{" "}
                                  <a
                                    href="/CGU#article6"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                      color: "#F59E0B",
                                      textDecoration: "underline",
                                      fontWeight: "600",
                                      transition: "color 0.2s",
                                    }}
                                    onMouseEnter={(e) =>
                                      (e.currentTarget.style.color = "#D97706")
                                    }
                                    onMouseLeave={(e) =>
                                      (e.currentTarget.style.color = "#F59E0B")
                                    }
                                  >
                                    Conditions Générales de Vente (Article 6)
                                  </a>
                                </p>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Terms Acceptance Checkbox */}
                        <div
                          style={{
                            padding: "1.25rem",
                            background: acceptedTerms
                              ? "linear-gradient(135deg, #e6f7f5 0%, #d1f0eb 100%)"
                              : "linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)",
                            borderRadius: "10px",
                            border: acceptedTerms
                              ? "2px solid #588983"
                              : "2px solid #d1d5db",
                            marginBottom: "1.25rem",
                            boxShadow: acceptedTerms
                              ? "0 2px 8px rgba(88, 137, 131, 0.15)"
                              : "0 1px 3px rgba(0, 0, 0, 0.05)",
                            transition: "all 0.3s ease",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "flex-start",
                              gap: "0.875rem",
                            }}
                          >
                            <input
                              type="checkbox"
                              id="acceptTerms"
                              checked={acceptedTerms}
                              onChange={(e) => {
                                setAcceptedTerms(e.target.checked);
                                sessionStorage.setItem("acceptedTerms", e.target.checked.toString());
                              }}
                              style={{
                                width: "1.35rem",
                                height: "1.35rem",
                                minWidth: "1.35rem",
                                marginTop: "0.15rem",
                                cursor: "pointer",
                                accentColor: "#588983",
                                flexShrink: 0,
                              }}
                            />
                            <label
                              htmlFor="acceptTerms"
                              style={{
                                fontSize: "0.95rem",
                                fontWeight: "500",
                                color: "#374151",
                                cursor: "pointer",
                                lineHeight: "1.6",
                                flex: 1,
                              }}
                            >
                              J'accepte les{" "}
                              <a
                                href="/CGU"
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  color: "#588983",
                                  textDecoration: "underline",
                                  fontWeight: "600",
                                  transition: "color 0.2s",
                                }}
                                onMouseEnter={(e) =>
                                  (e.currentTarget.style.color = "#417972")
                                }
                                onMouseLeave={(e) =>
                                  (e.currentTarget.style.color = "#588983")
                                }
                              >
                                conditions générales de vente
                              </a>
                            </label>
                          </div>
                        </div>

                        <button
                          className="btn w-100"
                          onClick={() => handleCreateReservation()}
                          disabled={loading || !acceptedTerms}
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
                          {loading ? (
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
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
