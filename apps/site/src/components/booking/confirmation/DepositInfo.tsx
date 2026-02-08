import type { Booking } from "@/types/booking-confirmation";

interface DepositInfoProps {
  depositAmount: number;
  booking: Booking;
}

export default function DepositInfo({ depositAmount, booking }: DepositInfoProps) {
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
              style={{ fontSize: "0.9375rem", color: "#856404" }}
            ></i>
            <strong style={{ fontSize: "0.8125rem", color: "#856404" }}>
              Empreinte bancaire
            </strong>
          </div>
          <h5
            className="mb-0"
            style={{ color: "#856404", fontSize: "1.125rem", fontWeight: "700" }}
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
