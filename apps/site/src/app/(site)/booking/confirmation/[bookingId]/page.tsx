"use client";

import BookingProgressBar from "@/components/site/booking/BookingProgressBar";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface AdditionalService {
  service: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface Booking {
  _id: string;
  spaceType: string;
  date: string;
  startTime: string;
  endTime: string;
  numberOfPeople: number;
  basePrice: number;
  servicesPrice: number;
  totalPrice: number;
  status: string;
  paymentStatus: string;
  requiresPayment: boolean;
  confirmationNumber?: string;
  specialRequests?: string;
  additionalServices?: AdditionalService[];
  createdAt: string;
  captureMethod?: "manual" | "automatic";
  stripePaymentIntentId?: string;
  stripeSetupIntentId?: string;
}

interface SpaceConfig {
  name: string;
  spaceType: string;
  imageUrl?: string;
  depositPolicy?: {
    enabled: boolean;
    percentage?: number;
    fixedAmount?: number;
    minimumAmount?: number;
  };
}

export default function ConfirmationPage({
  params,
}: {
  params: { bookingId: string };
}) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [spaceConfig, setSpaceConfig] = useState<SpaceConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Clear booking session data when reaching confirmation page
    sessionStorage.removeItem("bookingData");
    sessionStorage.removeItem("selectedServices");

    // Allow both authenticated and unauthenticated users to view confirmation
    if (status !== "loading") {
      fetchBooking();
    }
  }, [status, params.bookingId]);

  const fetchBooking = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/bookings/${params.bookingId}`);
      const data = await response.json();

      if (!data.success) {
        setError(data.error || "Impossible de charger la réservation");
        setLoading(false);
        return;
      }

      const bookingDetails = data.data;
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

      setLoading(false);
    } catch (err) {
      setError("Une erreur est survenue lors du chargement de la réservation");
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
      "meeting-room-glass": "Salle Verrière",
      "meeting-room-floor": "Salle Étage",
      "private-office": "Bureau privé",
      "event-space": "Espace événement",
      "open-space": "Open-space",
      "salle-verriere": "Salle Verrière",
      "salle-etage": "Salle Étage",
      evenementiel: "Événementiel",
    };
    return labels[type] || type;
  };

  const calculateDepositAmount = () => {
    if (!booking || !spaceConfig?.depositPolicy?.enabled) {
      return null;
    }

    const totalPriceInCents = booking.totalPrice * 100;
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

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { class: string; label: string }> = {
      confirmed: { class: "bg-success", label: "Confirmé" },
      pending: { class: "bg-warning", label: "En attente" },
      cancelled: { class: "bg-danger", label: "Annulé" },
      completed: { class: "bg-info", label: "Terminé" },
    };
    return badges[status] || { class: "bg-secondary", label: status };
  };

  const getPaymentStatusBadge = (status: string) => {
    const badges: Record<string, { class: string; label: string }> = {
      paid: { class: "bg-success", label: "Payé" },
      pending: { class: "bg-warning", label: "En attente" },
      failed: { class: "bg-danger", label: "Échoué" },
      refunded: { class: "bg-info", label: "Remboursé" },
    };
    return badges[status] || { class: "bg-secondary", label: status };
  };

  if (status === "loading" || loading) {
    return (
      <>
        <section className="confirmation-page py-5">
          <div className="container">
            <div className="text-center py-5">
              <div className="spinner-border text-success" role="status">
                <span className="visually-hidden">Chargement...</span>
              </div>
              <p className="mt-3 text-muted">Chargement...</p>
            </div>
          </div>
        </section>
      </>
    );
  }

  if (error) {
    return (
      <>
        <section className="confirmation-page py-5">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-lg-10">
                <div className="alert alert-danger" role="alert">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  {error}
                </div>
                <div className="text-center mt-4">
                  <button
                    onClick={() => router.push("/booking")}
                    className="btn btn-success"
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

  if (!booking) {
    return null;
  }

  const statusBadge = getStatusBadge(booking.status);
  const paymentBadge = getPaymentStatusBadge(booking.paymentStatus);
  const isPaid = booking.paymentStatus === "paid";
  const isConfirmed = isPaid || !booking.requiresPayment;

  return (
    <>
      <section className="confirmation-page py-5">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-10">
              {/* Progress Bar */}
              <div className="booking-card mb-4">
                <BookingProgressBar currentStep={4} />

                <hr className="my-3" style={{ opacity: 0.1 }} />

                {/* Navigation and Title */}
                <div
                  className="d-flex justify-content-between align-items-center mb-3 px-3 py-2 rounded"
                  style={{
                    backgroundColor: "#e8eae6",
                    minHeight: "50px",
                  }}
                >
                  <button
                    onClick={() => router.push("/booking")}
                    className="breadcrumb-link"
                    style={{
                      background: "none",
                      border: "none",
                      color: "#4a5568",
                      fontSize: "0.875rem",
                      fontWeight: "500",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <i className="bi bi-arrow-left"></i>
                    <span>Retour</span>
                  </button>
                  <h1
                    className="m-0"
                    style={{
                      fontSize: "0.95rem",
                      fontWeight: "600",
                      color: "#4a5568",
                    }}
                  >
                    Confirmation
                  </h1>
                  <div style={{ width: "70px" }}></div>
                </div>
              </div>
              {/* Success Message */}
              {isConfirmed && (
                <div className="booking-card mb-3 text-center py-3">
                  <div className="success-icon mb-2">
                    <i
                      className="bi bi-check-circle-fill text-success"
                      style={{ fontSize: "3rem" }}
                    ></i>
                  </div>
                  <h2
                    className="mb-2"
                    style={{ fontSize: "1.25rem", fontWeight: "700" }}
                  >
                    Réservation confirmée !
                  </h2>
                  <p
                    className="text-muted mb-0"
                    style={{ fontSize: "0.875rem", lineHeight: "1.5" }}
                  >
                    {isPaid
                      ? "Votre réservation a été confirmée avec succès. Un email de confirmation a été envoyé."
                      : "Votre demande a été enregistrée. Vous recevrez une confirmation par email."}
                  </p>
                </div>
              )}

              {/* Booking Details */}
              <div className="booking-card mb-3">
                <div className="d-flex align-items-center gap-2 mb-3">
                  <i
                    className="bi bi-receipt text-success"
                    style={{ fontSize: "1rem" }}
                  ></i>
                  <h2
                    className="mb-0 fw-semibold"
                    style={{ fontSize: "0.9375rem" }}
                  >
                    Détails de la réservation
                  </h2>
                </div>

                {/* Space Image */}
                {spaceConfig?.imageUrl && (
                  <div className="mb-3">
                    <img
                      src={spaceConfig.imageUrl}
                      alt={spaceConfig.name}
                      className="img-fluid rounded"
                      style={{
                        maxHeight: "200px",
                        width: "100%",
                        objectFit: "cover",
                      }}
                    />
                  </div>
                )}

                <div className="summary-row mb-2">
                  <div className="summary-label">ESPACE</div>
                  <div className="summary-value">
                    <strong style={{ fontSize: "0.9375rem" }}>
                      {spaceConfig?.name || "Espace"}
                    </strong>
                    <span className="badge bg-success ms-2">
                      {getTypeLabel(booking.spaceType)}
                    </span>
                  </div>
                </div>

                <div className="summary-row mb-2">
                  <div className="summary-label">DATE</div>
                  <div className="summary-value">
                    <i
                      className="bi bi-calendar me-2 text-success"
                      style={{ fontSize: "0.875rem" }}
                    ></i>
                    {formatDate(booking.date)}
                  </div>
                </div>

                <div className="summary-row mb-2">
                  <div className="summary-label">HORAIRE</div>
                  <div className="summary-value">
                    <i
                      className="bi bi-clock me-2 text-success"
                      style={{ fontSize: "0.875rem" }}
                    ></i>
                    {formatTime(booking.startTime)} -{" "}
                    {formatTime(booking.endTime)}
                  </div>
                </div>

                <div className="summary-row mb-2">
                  <div className="summary-label">PERSONNES</div>
                  <div className="summary-value">
                    <i
                      className="bi bi-people me-2 text-success"
                      style={{ fontSize: "0.875rem" }}
                    ></i>
                    {booking.numberOfPeople}{" "}
                    {booking.numberOfPeople > 1 ? "personnes" : "personne"}
                  </div>
                </div>

                {booking.specialRequests && (
                  <div className="summary-row mb-2">
                    <div className="summary-label">DEMANDES</div>
                    <div
                      className="summary-value"
                      style={{ fontSize: "0.8125rem" }}
                    >
                      {booking.specialRequests}
                    </div>
                  </div>
                )}

                {booking.additionalServices &&
                  booking.additionalServices.length > 0 && (
                    <>
                      <div className="price-divider my-2"></div>

                      <div className="mb-2">
                        <h6
                          className="mb-2 d-flex align-items-center gap-2"
                          style={{ fontSize: "0.875rem" }}
                        >
                          <i
                            className="bi bi-bag-plus text-success"
                            style={{ fontSize: "0.875rem" }}
                          ></i>
                          Services supplémentaires
                        </h6>
                        {booking.additionalServices.map((service, index) => (
                          <div key={index} className="summary-row mb-1">
                            <div
                              className="summary-label"
                              style={{ fontSize: "0.8125rem" }}
                            >
                              {service.name}{" "}
                              <span className="text-muted">
                                (x{service.quantity})
                              </span>
                            </div>
                            <div
                              className="summary-value"
                              style={{ fontSize: "0.8125rem" }}
                            >
                              {service.totalPrice.toFixed(2)}€
                            </div>
                          </div>
                        ))}
                        <div
                          className="summary-row mt-2 pt-2"
                          style={{ borderTop: "1px solid hsl(var(--border))" }}
                        >
                          <div
                            className="summary-label"
                            style={{ fontWeight: "600", fontSize: "0.8125rem" }}
                          >
                            Sous-total services
                          </div>
                          <div
                            className="summary-value"
                            style={{ fontWeight: "600", fontSize: "0.8125rem" }}
                          >
                            {booking.servicesPrice?.toFixed(2) || "0.00"}€
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                <div className="price-divider my-2"></div>

                <div className="summary-row mb-2">
                  <div className="summary-label">STATUT</div>
                  <div className="summary-value">
                    <span className={`badge ${statusBadge.class}`}>
                      {statusBadge.label}
                    </span>
                  </div>
                </div>

                <div className="summary-row mb-2">
                  <div className="summary-label">PAIEMENT</div>
                  <div className="summary-value">
                    <span className={`badge bg-success text-white`}>
                      Sur Place
                    </span>
                  </div>
                </div>

                <div className="price-divider my-2"></div>

                <div className="summary-row">
                  <div className="summary-label" style={{ fontWeight: "700" }}>
                    TOTAL À PAYER
                  </div>
                  <div className="summary-value">
                    <h4
                      className="text-success mb-0"
                      style={{ fontSize: "1.25rem", fontWeight: "700" }}
                    >
                      {booking.totalPrice.toFixed(2)}€
                    </h4>
                  </div>
                </div>

                {(() => {
                  const depositAmount = calculateDepositAmount();
                  if (depositAmount && booking.requiresPayment) {
                    return (
                      <>
                        <div className="price-divider my-2"></div>
                        <div
                          className="alert alert-warning border-0 mb-0 py-2"
                          style={{ backgroundColor: "rgba(255, 193, 7, 0.1)" }}
                        >
                          <div className="d-flex justify-content-between align-items-center mb-1">
                            <div className="d-flex align-items-center gap-2">
                              <i
                                className="bi bi-credit-card-2-front"
                                style={{
                                  fontSize: "0.9375rem",
                                  color: "#856404",
                                }}
                              ></i>
                              <strong
                                style={{
                                  fontSize: "0.8125rem",
                                  color: "#856404",
                                }}
                              >
                                Empreinte bancaire
                              </strong>
                            </div>
                            <h5
                              className="mb-0"
                              style={{
                                color: "#856404",
                                fontSize: "1.125rem",
                                fontWeight: "700",
                              }}
                            >
                              {(depositAmount / 100).toFixed(2)}€
                            </h5>
                          </div>
                          <small
                            className="text-muted d-block"
                            style={{ fontSize: "0.75rem", lineHeight: "1.4" }}
                          >
                            {booking.captureMethod === "manual"
                              ? "Montant autorisé sur votre carte (sera annulé si vous vous présentez)"
                              : "Sera débité 7 jours avant la réservation"}
                          </small>
                        </div>
                      </>
                    );
                  }
                  return null;
                })()}
              </div>

              {/* Important Information */}
              <div
                className="booking-card mb-3 py-3"
                style={{ borderLeft: "4px solid #588983" }}
              >
                <div className="d-flex align-items-center gap-2 mb-2">
                  <i
                    className="bi bi-info-circle text-success"
                    style={{ fontSize: "0.9375rem" }}
                  ></i>
                  <h6
                    className="mb-0 fw-semibold"
                    style={{ fontSize: "0.875rem" }}
                  >
                    Informations importantes
                  </h6>
                </div>
                <ul
                  className="mb-0 ps-3"
                  style={{ fontSize: "0.8125rem", lineHeight: "1.6" }}
                >
                  <li>
                    Veuillez arriver 5 minutes avant le début de votre
                    réservation
                  </li>
                  <li>
                    En cas d'annulation, veuillez nous prévenir à l'avance
                  </li>
                  <li>
                    Un email de confirmation a été envoyé avec tous les détails
                  </li>
                </ul>
              </div>

              {session && session.user && (
                <div className="d-flex justify-content-center mb-3">
                  <Link
                    href={`/${session.user.username}/reservations`}
                    className="btn btn-success"
                    style={{
                      padding: "0.625rem 1.25rem",
                      fontSize: "0.875rem",
                      fontWeight: "600",
                    }}
                  >
                    <i className="bi bi-list-ul me-2"></i>
                    Voir mes réservations
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <div style={{ height: "5rem" }}></div>

      <style jsx>{`
        .success-icon {
          animation: scaleIn 0.5s ease-out;
        }

        @keyframes scaleIn {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          50% {
            transform: scale(1.1);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
}
