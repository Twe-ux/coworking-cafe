"use client";

import { useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";

const CancelBookingModal = dynamic(
  () => import("../booking/CancelBookingModal"),
  { ssr: false }
);

interface BookingData {
  _id: string;
  spaceType: string;
  date: string;
  startTime: string;
  endTime: string;
  numberOfPeople: number;
  totalPrice: number;
  status: string;
  paymentStatus: string;
  reservationType?: 'hourly' | 'daily' | 'weekly' | 'monthly';
}

interface Props {
  reservation: BookingData;
  onCancelled?: () => void;
}

export default function UpcomingReservationCard({
  reservation,
  onCancelled,
}: Props) {
  const [showCancelModal, setShowCancelModal] = useState(false);

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
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const handleCancelClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowCancelModal(true);
  };

  const handleCancelModalClose = () => {
    setShowCancelModal(false);
  };

  const handleCancellationComplete = () => {
    if (onCancelled) {
      onCancelled();
    }
    handleCancelModalClose();
  };

  return (
    <>
      <div className="col-md-4 mb-4">
        <div className="reservation-card">
          <Link
            href={`/booking/confirmation/${reservation._id.toString()}`}
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <div className="d-flex justify-content-between align-items-start mb-3">
              <h5 className="reservation-space mb-0">
                {getSpaceLabel(reservation.spaceType)}
              </h5>
              {(reservation.status === "confirmed" ||
                reservation.status === "pending") && (
                <button
                  onClick={handleCancelClick}
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
                  <span>
                    {reservation.numberOfPeople} personne
                    {reservation.numberOfPeople > 1 ? "s" : ""}
                  </span>
                </div>
              </div>
            </div>

            <div className="reservation-footer">
              <span
                className={`status-badge ${
                  reservation.status === "confirmed" ? "confirmed" : "pending"
                }`}
              >
                {reservation.status === "confirmed" ? "Validée" : "En attente"}
              </span>
              <span className="price">
                {reservation.totalPrice?.toFixed(2) || "0.00"}€
              </span>
            </div>
          </Link>
        </div>
      </div>

      <CancelBookingModal
        booking={reservation}
        show={showCancelModal}
        onHide={handleCancelModalClose}
        onCancelled={handleCancellationComplete}
      />
    </>
  );
}
