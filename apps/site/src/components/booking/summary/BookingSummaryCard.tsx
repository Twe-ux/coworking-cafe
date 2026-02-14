"use client";

import type { BookingData, SpaceType, ReservationType } from "@/types/booking";
import {
  SPACE_TYPE_LABELS as spaceTypeLabels,
  RESERVATION_TYPE_LABELS as reservationTypeLabels,
} from "@/types/booking";

interface BookingSummaryCardProps {
  bookingData: BookingData;
}

export default function BookingSummaryCard({ bookingData }: BookingSummaryCardProps) {
  return (
    <div className="booking-card d-flex flex-column" style={{ flex: 1 }}>
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
        <SummaryRow
          label="Espace"
          value={spaceTypeLabels[bookingData.spaceType]}
        />

        <SummaryRow
          label="Type"
          value={reservationTypeLabels[bookingData.reservationType]}
        />

        <SummaryRow
          label="Date"
          value={new Date(bookingData.date).toLocaleDateString("fr-FR", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        />

        <SummaryRow
          label={bookingData.reservationType === "daily" || !bookingData.endTime ? "Arrivée" : "Horaires"}
          value={
            bookingData.reservationType === "daily" || !bookingData.endTime
              ? `Journée complète à partir de ${bookingData.startTime}`
              : `${bookingData.startTime} - ${bookingData.endTime}`
          }
        />

        <SummaryRow
          label="Personnes"
          value={`${bookingData.numberOfPeople} ${
            bookingData.numberOfPeople > 1 ? "personnes" : "personne"
          }`}
        />

        <SummaryRow
          label="Contact"
          value={
            <div>
              <div>{bookingData.contactName}</div>
              <small style={{ color: "#999" }}>{bookingData.contactEmail}</small>
              <br />
              <small style={{ color: "#999" }}>{bookingData.contactPhone}</small>
            </div>
          }
          isLast={!bookingData.specialRequests}
        />

        {bookingData.specialRequests && (
          <SummaryRow
            label="Demandes"
            value={bookingData.specialRequests}
            isLast
          />
        )}
      </div>
    </div>
  );
}

interface SummaryRowProps {
  label: string;
  value: React.ReactNode;
  isLast?: boolean;
}

function SummaryRow({ label, value, isLast = false }: SummaryRowProps) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        padding: "12px 0",
        borderBottom: isLast ? "none" : "1px solid #f0f0f0",
      }}
    >
      <span style={{ fontWeight: "600", color: "#666" }}>{label}</span>
      <span style={{ color: "#333", textAlign: "right" }}>{value}</span>
    </div>
  );
}
