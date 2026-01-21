"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import CheckoutForm from "../../../../../components/site/booking/CheckoutForm";
import { useSession } from "next-auth/react";
import BookingProgressBar from "../../../../../components/site/booking/BookingProgressBar";

interface Booking {
  _id: string;
  spaceType: string;
  date: string;
  startTime: string;
  endTime: string;
  numberOfPeople: number;
  totalPrice: number;
  status: string;
  paymentStatus: string;
  requiresPayment: boolean;
}

interface SpaceConfig {
  name: string;
  spaceType: string;
}

// Initialize Stripe - this will be loaded once
// Validate Stripe publishable key
const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
if (!stripePublishableKey) {
  console.error("⚠️ NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not configured");
}
const stripePromise = stripePublishableKey
  ? loadStripe(stripePublishableKey)
  : null;

export default function CheckoutPage({
  params,
}: {
  params: { bookingId: string };
}) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [spaceConfig, setSpaceConfig] = useState<SpaceConfig | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [intentType, setIntentType] = useState<
    "setup_intent" | "manual_capture" | null
  >(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Allow both authenticated and unauthenticated users to access checkout
    if (status !== "loading") {
      fetchBookingAndCreateIntent();
    }
  }, [status, params.bookingId]);

  const fetchBookingAndCreateIntent = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch booking details
      const bookingResponse = await fetch(`/api/bookings/${params.bookingId}`);
      const bookingData = await bookingResponse.json();

      if (!bookingData.success) {
        setError(bookingData.error || "Impossible de charger la réservation");
        setLoading(false);
        return;
      }

      const bookingDetails = bookingData.data;
      setBooking(bookingDetails);

      // Fetch space configuration
      if (bookingDetails.spaceType) {
        const spaceResponse = await fetch(
          `/api/space-configurations/${bookingDetails.spaceType}`,
        );
        const spaceData = await spaceResponse.json();
        if (spaceData.success) {
          setSpaceConfig(spaceData.data);
        }
      }

      // Check if payment is not required - redirect to confirmation
      if (bookingDetails.requiresPayment === false) {
        router.push(`/booking/confirmation/${params.bookingId}`);
        return;
      }

      // Check if already paid
      if (bookingDetails.paymentStatus === "paid") {
        router.push(`/booking/confirmation/${params.bookingId}`);
        return;
      }

      // Check if cancelled
      if (bookingDetails.status === "cancelled") {
        setError("Cette réservation a été annulée");
        setLoading(false);
        return;
      }

      // Create payment intent
      const intentResponse = await fetch("/api/payments/create-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bookingId: params.bookingId,
        }),
      });

      const intentData = await intentResponse.json();

      if (!intentData.success) {
        setError(
          intentData.error || "Impossible de créer l'intention de paiement",
        );
        setLoading(false);
        return;
      }

      setClientSecret(intentData.data.clientSecret);
      setIntentType(intentData.data.type);
      setLoading(false);
    } catch (err) {
      setError("Une erreur est survenue lors de la préparation du paiement");
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (time: string) => {
    return time;
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      desk: "Bureau",
      "meeting-room": "Salle de réunion",
      "private-office": "Bureau privé",
      "event-space": "Espace événement",
      "open-space": "Open-space",
      "salle-verriere": "Salle Verrière",
      "salle-etage": "Salle Étage",
      evenementiel: "Événementiel",
    };
    return labels[type] || type;
  };

  if (status === "loading" || loading) {
    return (
      <>
        <section className="checkout-page py-5">
          <div className="container">
            <div className="text-center py-5">
              <div className="spinner-border text-success" role="status">
                <span className="visually-hidden">Chargement...</span>
              </div>
              <p className="mt-3 text-muted">Préparation du paiement...</p>
            </div>
          </div>
        </section>
      </>
    );
  }

  if (error) {
    return (
      <>
        <section className="checkout-page py-5">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-lg-8">
                <div className="alert alert-danger" role="alert">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  {error}
                </div>
                <div className="text-center mt-4">
                  <button
                    onClick={() => router.push("/booking")}
                    className="btn btn-primary"
                  >
                    <i className="bi bi-arrow-left me-2"></i>
                    Retour aux espaces
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </>
    );
  }

  if (!booking || !clientSecret) {
    return null;
  }

  // Pour CardElement, on n'a pas besoin de passer le clientSecret dans les options
  // Il sera passé directement dans confirmCardPayment/confirmCardSetup
  const options = {};

  return (
    <>
      <section className="checkout-page py-5">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-10">
              {/* Progress Bar */}
              <div className="booking-card mb-4">
                <BookingProgressBar currentStep={4} />

                <hr className="my-3" style={{ opacity: 0.1 }} />

                {/* Navigation and Title */}
                <div className="custom-breadcrumb d-flex justify-content-between align-items-center mb-4">
                  <button
                    onClick={() => router.back()}
                    className="breadcrumb-link"
                  >
                    <i className="bi bi-arrow-left"></i>
                    <span>Retour</span>
                  </button>
                  <h1 className="breadcrumb-current m-0">Paiement sécurisé</h1>
                  <div style={{ width: "80px" }}></div>
                </div>
              </div>

              {/* Booking Summary */}
              <div className="booking-card mb-4">
                <div className="d-flex align-items-center gap-2 mb-4">
                  <i
                    className="bi bi-receipt text-success"
                    style={{ fontSize: "1.125rem" }}
                  ></i>
                  <h2 className="h6 mb-0 fw-semibold">
                    Récapitulatif de la réservation
                  </h2>
                </div>

                <div className="summary-row mb-3">
                  <div className="summary-label">Espace</div>
                  <div className="summary-value">
                    <strong>{spaceConfig?.name || "Espace"}</strong>
                    <span
                      className="badge bg-success ms-2"
                      style={{ fontSize: "0.75rem" }}
                    >
                      {getTypeLabel(booking.spaceType)}
                    </span>
                  </div>
                </div>

                <div className="summary-row mb-3">
                  <div className="summary-label">Date</div>
                  <div className="summary-value">
                    <i className="bi bi-calendar me-2 text-success"></i>
                    {formatDate(booking.date)}
                  </div>
                </div>

                <div className="summary-row mb-3">
                  <div className="summary-label">Horaire</div>
                  <div className="summary-value">
                    <i className="bi bi-clock me-2 text-success"></i>
                    {formatTime(booking.startTime)} -{" "}
                    {formatTime(booking.endTime)}
                  </div>
                </div>

                <div className="summary-row mb-4">
                  <div className="summary-label">Personnes</div>
                  <div className="summary-value">
                    <i className="bi bi-people me-2 text-success"></i>
                    {booking.numberOfPeople}{" "}
                    {booking.numberOfPeople > 1 ? "personnes" : "personne"}
                  </div>
                </div>

                <div className="price-divider mb-4"></div>

                <div className="summary-row">
                  <div
                    className="summary-label"
                    style={{ fontSize: "0.875rem", fontWeight: "700" }}
                  >
                    Total à payer
                  </div>
                  <div className="summary-value">
                    <h4
                      className="text-success mb-0"
                      style={{ fontSize: "1.5rem", fontWeight: "700" }}
                    >
                      {booking.totalPrice.toFixed(2)}€
                    </h4>
                  </div>
                </div>
              </div>

              {/* Payment Form */}
              <div className="booking-card">
                <div className="d-flex align-items-center gap-2 mb-4">
                  <i
                    className="bi bi-credit-card text-success"
                    style={{ fontSize: "1.125rem" }}
                  ></i>
                  <h2 className="h6 mb-0 fw-semibold">
                    Informations de paiement
                  </h2>
                </div>

                {!stripePromise ? (
                  <div className="alert alert-danger" role="alert">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    <strong>Configuration manquante :</strong> La clé publique
                    Stripe n'est pas configurée. Veuillez contacter
                    l'administrateur.
                  </div>
                ) : (
                  <Elements stripe={stripePromise} options={options}>
                    <CheckoutForm
                      bookingId={params.bookingId}
                      amount={Math.round(booking.totalPrice * 100)}
                      intentType={intentType || "manual_capture"}
                      clientSecret={clientSecret}
                    />
                  </Elements>
                )}
              </div>

              {/* Security Info */}
              <div
                className="text-center mt-4"
                style={{ paddingBottom: "3rem" }}
              >
                <p
                  className="text-muted mb-2"
                  style={{ fontSize: "0.875rem", fontWeight: "500" }}
                >
                  <i className="bi bi-shield-check me-2"></i>
                  Paiement 100% sécurisé
                </p>
                <div className="d-flex justify-content-center gap-3 flex-wrap">
                  <small className="text-muted" style={{ fontSize: "0.75rem" }}>
                    <i className="bi bi-lock-fill me-1"></i>
                    Cryptage SSL
                  </small>
                  <small className="text-muted" style={{ fontSize: "0.75rem" }}>
                    <i className="bi bi-credit-card-2-front me-1"></i>
                    Stripe
                  </small>
                  <small className="text-muted" style={{ fontSize: "0.75rem" }}>
                    <i className="bi bi-shield-fill-check me-1"></i>
                    PCI DSS
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
