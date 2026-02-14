"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import "../client-dashboard.scss";

const CancelBookingModal = dynamic(
  () => import("@/components/site/booking/CancelBookingModal"),
  { ssr: false }
);

interface Reservation {
  _id: string;
  spaceType: string;
  date: string;
  startTime: string;
  endTime: string;
  numberOfPeople: number;
  totalPrice: number;
  basePrice: number;
  servicesPrice: number;
  status: string;
  paymentStatus: string;
  reservationType?: 'hourly' | 'daily' | 'weekly' | 'monthly';
  additionalServices?: Array<{
    name: string;
    quantity: number;
    totalPrice: number;
  }>;
}

export default function ReservationsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("upcoming");
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Reservation | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push(`/auth/login?callbackUrl=/${params.id}/reservations`);
      return;
    }

    if (status === "authenticated") {
      // Security check: verify the URL matches the logged-in user (username or ID)
      if (params.id !== session.user.username && params.id !== session.user.id) {
        const userPath = session.user.username || session.user.id;
        router.push(`/${userPath}/reservations`);
        return;
      }

      fetchReservations();
    }
  }, [status, params.id]);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/bookings?limit=100&sortBy=date&sortOrder=desc", {
        credentials: "include", // Include session cookies
      });
      const data = await response.json();
      if (data.success) {
        setReservations(data.data || []);
      } else {      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { class: string; label: string }> = {
      confirmed: { class: "confirmed", label: "Validée" },
      pending: { class: "pending", label: "En attente" },
      cancelled: { class: "cancelled", label: "Annulée" },
      completed: { class: "completed", label: "Terminée" },
    };
    return badges[status] || { class: "bg-secondary", label: status };
  };

  const getPaymentStatusBadge = (status: string) => {
    const badges: Record<string, { class: string; label: string }> = {
      paid: { class: "bg-success", label: "Payé" },
      pending: { class: "bg-warning text-dark", label: "En attente" },
      failed: { class: "bg-danger", label: "Échoué" },
      refunded: { class: "bg-info", label: "Remboursé" },
    };
    return badges[status] || { class: "bg-secondary", label: status };
  };

  const getSpaceLabel = (spaceType: string) => {
    const labels: Record<string, string> = {
      "open-space": "Open-space",
      "salle-verriere": "Salle Verrière",
      "salle-etage": "Salle Étage",
      evenementiel: "Événementiel",
    };
    return labels[spaceType] || spaceType;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const handleCancelClick = (e: React.MouseEvent, reservation: Reservation) => {
    e.preventDefault(); // Empêcher la navigation vers la page de détails
    e.stopPropagation();
    setSelectedBooking(reservation);
    setShowCancelModal(true);
  };

  const handleCancelModalClose = () => {
    setShowCancelModal(false);
    setSelectedBooking(null);
  };

  const handleCancellationComplete = () => {
    fetchReservations();
    handleCancelModalClose();
  };

  const filteredReservations = reservations
    .filter((reservation) => {
      if (filter === "all") return true;
      if (filter === "upcoming")
        return (
          reservation.status === "pending" || reservation.status === "confirmed"
        );
      if (filter === "completed") return reservation.status === "completed";
      if (filter === "cancelled") return reservation.status === "cancelled";
      return true;
    })
    .sort((a, b) => {
      // Trier par date (les plus proches en premier)
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();

      if (dateA !== dateB) {
        return dateA - dateB; // Tri par date
      }

      // Si même date, trier par heure de début (startTime)
      // Gérer les horaires vides (forfaits semaine/mensuel)
      if (!a.startTime && !b.startTime) return 0; // Les deux vides, maintenir ordre
      if (!a.startTime) return 1; // a vide, mettre après b
      if (!b.startTime) return -1; // b vide, mettre après a

      const timeA = a.startTime.split(':').map(Number);
      const timeB = b.startTime.split(':').map(Number);
      const minutesA = timeA[0] * 60 + (timeA[1] || 0);
      const minutesB = timeB[0] * 60 + (timeB[1] || 0);

      return minutesA - minutesB; // Tri par heure
    });

  if (status === "loading" || loading) {
    return (
      <section className="client-dashboard py__130">
        <div className="container">
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Chargement...</span>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const username = session?.user?.username || session?.user?.email?.split('@')[0] || "user";
  const userPath = session?.user?.id || ""; // Use ID for navigation links

  return (
    <section className="client-dashboard py__90">
      <div className="container pb__130">
        {/* Breadcrumb */}
        <div className="custom-breadcrumb mb-4">
          <Link href={`/${userPath}`} className="breadcrumb-link">
            <i className="bi bi-house-door"></i>
            <span>Dashboard</span>
          </Link>
          <i className="bi bi-chevron-right breadcrumb-separator"></i>
          <span className="breadcrumb-current">Réservations</span>
        </div>

        {/* Page Header */}
        <div className="d-flex justify-content-between align-items-center mb-5">
          <div>
            <h1 className="section-title">Mes Réservations</h1>
            <p style={{ color: "var(--gry-clr)" }}>
              Gérez toutes vos réservations d'espaces de coworking
            </p>
          </div>
          <Link href="/booking" className="new-reservation-btn">
            <i className="bi bi-plus-circle me-2"></i>
            Nouvelle réservation
          </Link>
        </div>

        {/* Filters */}
        <div className="stat-card mb-4">
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 w-100">
            <div className="d-flex flex-wrap gap-2">
              <button
                type="button"
                className={`filter-btn ${filter === "upcoming" ? "active" : ""}`}
                onClick={() => setFilter("upcoming")}
              >
                À venir
              </button>
              <button
                type="button"
                className={`filter-btn ${filter === "completed" ? "active" : ""}`}
                onClick={() => setFilter("completed")}
              >
                Terminées
              </button>
              <button
                type="button"
                className={`filter-btn ${filter === "cancelled" ? "active" : ""}`}
                onClick={() => setFilter("cancelled")}
              >
                Annulées
              </button>
            </div>
            <button
              type="button"
              className={`filter-btn ${filter === "all" ? "active" : ""}`}
              onClick={() => setFilter("all")}
            >
              Toutes
            </button>
          </div>
        </div>

        {/* Reservations List */}
        <div className="row">
          <div className="col-12">
            {filteredReservations.length === 0 ? (
              <div className="empty-state-card">
                <div className="empty-state-icon">
                  <i className="bi bi-calendar-x"></i>
                </div>
                <h3 className="empty-state-title">Aucune réservation</h3>
                <p className="empty-state-description">
                  {filter === "all"
                    ? "Vous n'avez pas encore de réservation. Commencez par réserver un espace."
                    : `Aucune réservation dans cette catégorie.`}
                </p>
                <Link href="/booking" className="new-reservation-btn">
                  <i className="bi bi-plus-circle me-2"></i>
                  Créer une réservation
                </Link>
              </div>
            ) : (
              <div className="row g-4">
                {filteredReservations.map((reservation) => {
                  const statusBadge = getStatusBadge(reservation.status);
                  const paymentBadge = getPaymentStatusBadge(
                    reservation.paymentStatus
                  );

                  return (
                    <div key={reservation._id} className="col-md-6 col-lg-4">
                      <div className="reservation-card">
                        <Link
                          href={`/booking/confirmation/${reservation._id}`}
                          style={{ textDecoration: 'none', color: 'inherit' }}
                        >
                          <div className="d-flex justify-content-between align-items-start mb-3">
                            <h5 className="reservation-space mb-0">
                              {getSpaceLabel(reservation.spaceType)}
                            </h5>
                            {(reservation.status === "confirmed" || reservation.status === "pending") && (
                              <button
                                onClick={(e) => handleCancelClick(e, reservation)}
                                className="btn-cancel-top"
                                title="Annuler la réservation"
                              >
                                <i className="bi bi-x-circle"></i>
                              </button>
                            )}
                          </div>

                          <div className="reservation-content">
                            <div className="reservation-info">
                              <div className="d-flex justify-content-between align-items-center mb-2">
                                <div className="info-item mb-0">
                                  <i className="bi bi-calendar"></i>
                                  <span>{formatDate(reservation.date)}</span>
                                </div>
                                <div className="info-item mb-0">
                                  <i className="bi bi-clock"></i>
                                  <span>
                                    {reservation.reservationType === 'daily' || !reservation.endTime
                                      ? `Journée complète à partir de ${reservation.startTime}`
                                      : `${reservation.startTime} - ${reservation.endTime}`}
                                  </span>
                                </div>
                              </div>
                              <div className="info-item mb-0">
                                <i className="bi bi-people"></i>
                                <span>{reservation.numberOfPeople} personne{reservation.numberOfPeople > 1 ? "s" : ""}</span>
                              </div>
                            </div>

                            {reservation.additionalServices &&
                              reservation.additionalServices.length > 0 && (
                                <div className="mt-2">
                                  <small
                                    className="text-muted"
                                    style={{ fontSize: "0.85rem" }}
                                  >
                                    {reservation.additionalServices.length} service
                                    {reservation.additionalServices.length > 1
                                      ? "s"
                                      : ""}{" "}
                                    sup.
                                  </small>
                                </div>
                              )}
                          </div>

                          <div className="reservation-footer">
                            <span className={`status-badge ${statusBadge.class}`}>
                              {statusBadge.label}
                            </span>
                            <span className="price">
                              {reservation.totalPrice.toFixed(2)}€
                            </span>
                          </div>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <CancelBookingModal
        booking={selectedBooking}
        show={showCancelModal}
        onHide={handleCancelModalClose}
        onCancelled={handleCancellationComplete}
      />
    </section>
  );
}
