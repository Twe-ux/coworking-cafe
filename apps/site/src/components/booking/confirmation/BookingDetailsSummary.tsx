import type {
  Booking,
  SpaceConfig,
  StatusBadge,
} from "@/types/booking-confirmation";
import { formatDate, formatTime } from "@/utils/booking-helpers";
import { getPeopleDisplayLabelLong } from "@/lib/utils/booking-display";

interface BookingDetailsSummaryProps {
  booking: Booking;
  spaceConfig: SpaceConfig | null;
  statusBadge: StatusBadge;
  paymentBadge: StatusBadge;
}

export default function BookingDetailsSummary({
  booking,
  spaceConfig,
  statusBadge,
  paymentBadge,
}: BookingDetailsSummaryProps) {
  return (
    <div className="booking-card mb-3">
      <div className="d-flex align-items-center gap-2 mb-3">
        <i
          className="bi bi-receipt text-success"
          style={{ fontSize: "1rem" }}
        ></i>
        <h2 className="mb-0 fw-semibold" style={{ fontSize: "0.9375rem" }}>
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

      {/* Basic Info */}
      <div className="summary-row mb-2">
        <div className="summary-label">ESPACE</div>
        <div className="summary-value">
          <strong style={{ fontSize: "0.9375rem" }}>
            {spaceConfig?.name || "Espace"}
          </strong>
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
        <div className="summary-label">{booking.reservationType === 'daily' || !booking.endTime ? 'ARRIVÉE' : 'HORAIRE'}</div>
        <div className="summary-value">
          <i
            className="bi bi-clock me-2 text-success"
            style={{ fontSize: "0.875rem" }}
          ></i>
          {booking.reservationType === 'daily' || !booking.endTime
            ? `Journée complète à partir de ${formatTime(booking.startTime)}`
            : `${formatTime(booking.startTime)} - ${formatTime(booking.endTime)}`}
        </div>
      </div>

      <div className="summary-row mb-2">
        <div className="summary-label">PERSONNES</div>
        <div className="summary-value">
          <i
            className="bi bi-people me-2 text-success"
            style={{ fontSize: "0.875rem" }}
          ></i>
          {getPeopleDisplayLabelLong(booking.numberOfPeople, booking.spaceType)}
        </div>
      </div>

      {booking.specialRequests && (
        <div className="summary-row mb-2">
          <div className="summary-label">DEMANDES</div>
          <div className="summary-value" style={{ fontSize: "0.8125rem" }}>
            {booking.specialRequests}
          </div>
        </div>
      )}

      {/* Additional Services */}
      {booking.additionalServices && booking.additionalServices.length > 0 && (
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
                  <span className="text-muted">(x{service.quantity})</span>
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

      {/* Status & Payment */}
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
          <span className="badge bg-success text-white">Sur Place</span>
        </div>
      </div>

      <div className="price-divider my-2"></div>

      {/* Total */}
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
    </div>
  );
}
