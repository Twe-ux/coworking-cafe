"use client";

import BookingProgressBar from "@/components/site/booking/BookingProgressBar";
import InfoEmpreinte from "@/components/site/booking/InfoEmpreinte";
import PaymentFormContent from "@/components/site/booking/PaymentFormContent";
import CancellationPolicyDisplay from "@/components/site/booking/CancellationPolicyDisplay";
import PriceBreakdownTable from "@/components/site/booking/PriceBreakdownTable";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useBookingForm } from "@/hooks/useBookingForm";
import type {
  BookingData,
  AdditionalService,
  SelectedService,
  SPACE_TYPE_INFO,
  SPACE_TYPE_LABELS,
  RESERVATION_TYPE_LABELS,
} from "@/types/booking";
import {
  SPACE_TYPE_INFO as spaceTypeInfo,
  SPACE_TYPE_LABELS as spaceTypeLabels,
  RESERVATION_TYPE_LABELS as reservationTypeLabels,
} from "@/types/booking";
import "../../[id]/client-dashboard.scss";

// Validate Stripe publishable key
const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
if (!stripePublishableKey) {
  console.error("⚠️ NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not configured");
}
const stripePromise = stripePublishableKey
  ? loadStripe(stripePublishableKey)
  : null;

// Mapping inverse : URL slug → DB spaceType
const slugToSpaceType: Record<string, string> = {
  "open-space": "open-space",
  "meeting-room-glass": "salle-verriere",
  "meeting-room-floor": "salle-etage",
  "event-space": "evenementiel",
};

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

export default function BookingSummaryPage() {
  const router = useRouter();
  const { data: session } = useSession();
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
  const [depositAmount, setDepositAmount] = useState<number>(0);
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

  // Always clear payment state on page load to avoid expired Payment Intent errors
  // This ensures we always create a fresh payment intent when user clicks "Procéder au paiement"
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Clear any stale payment data on page load
    sessionStorage.removeItem("paymentClientSecret");
    sessionStorage.removeItem("paymentIntentType");
    sessionStorage.removeItem("showPaymentForm");
    sessionStorage.removeItem("paymentBookingHash");
    console.log("[Payment] Cleared stale payment data on page load");
  }, []);

  useEffect(() => {
    console.log("[BookingSummaryPage] bookingData:", bookingData);

    // Si les données sont chargées, arrêter le loading et continuer
    if (bookingData) {
      setIsLoading(false);

      // Calculate days until booking
      const now = new Date();
      const bookingDate = new Date(bookingData.date);
      const days = Math.ceil(
        (bookingDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
      );
      setDaysUntilBooking(days);

      // Fetch space configuration to get deposit policy
      const fetchSpaceConfig = async () => {
        try {
          const dbSpaceType = slugToSpaceType[bookingData.spaceType] || bookingData.spaceType;
          const response = await fetch(
            `/api/space-configurations/${dbSpaceType}`,
          );
          if (response.ok) {
            const configData = await response.json();
            setSpaceConfig(configData.data);
          }
        } catch (error) {
          console.error("Error fetching space configuration:", error);
        }
      };

      // Fetch cancellation policy
      const fetchCancellationPolicy = async () => {
        try {
          const dbSpaceType = slugToSpaceType[bookingData.spaceType] || bookingData.spaceType;
          const response = await fetch(
            `/api/cancellation-policy?spaceType=${dbSpaceType}`,
          );
          if (response.ok) {
            const policyData = await response.json();
            setCancellationPolicy(policyData.data.cancellationPolicy);
          }
        } catch (error) {
          console.error("Error fetching cancellation policy:", error);
        }
      };

      fetchSpaceConfig();
      fetchCancellationPolicy();
      return;
    }

    // Vérifier si sessionStorage a des données
    const hasStoredData = typeof window !== 'undefined' && sessionStorage.getItem("bookingData");
    console.log("[BookingSummaryPage] hasStoredData:", !!hasStoredData);

    // Délai court pour laisser le hook charger les données
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

    setPaymentProcessing(true);
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
        setPaymentProcessing(false);
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
      const bookingHash = bookingDataStr
        ? btoa(bookingDataStr).slice(0, 32)
        : "";
      sessionStorage.setItem("paymentBookingHash", bookingHash);
      console.log(
        "[Payment] Saved payment state with booking hash:",
        bookingHash,
      );

      setClientSecret(newClientSecret);
      setIntentType(newIntentType);
      setShowPaymentForm(true);
      setPaymentProcessing(false);
    } catch (error) {
      setPaymentError("Une erreur est survenue");
      setPaymentProcessing(false);
    }
  };

  if (isLoading || !bookingData) {
    return (
      <section className="booking-summary-page py-5">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-10">
              <div className="booking-card text-center py-5">
                <div className="spinner-border text-primary" role="status">
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
                          bookingData={bookingData!}
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
                        {cancellationPolicy && (
                          <CancellationPolicyDisplay cancellationPolicy={cancellationPolicy} />
                        )}

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
                                sessionStorage.setItem(
                                  "acceptedTerms",
                                  e.target.checked.toString(),
                                );
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
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
