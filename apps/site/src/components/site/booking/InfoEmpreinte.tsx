"use client";

interface InfoEmpreinteProps {
  type: "manual_capture" | "setup_intent";
  amount: number;
  daysUntilBooking: number;
}

export default function InfoEmpreinte({
  type,
  amount,
  daysUntilBooking,
}: InfoEmpreinteProps) {
  const formatAmount = (cents: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(cents / 100);
  };

  return (
    <div
      style={{
        backgroundColor: "rgba(88, 137, 131, 0.1)",
        borderLeft: "4px solid #588983",
        borderRadius: "4px",
        padding: "1rem",
        marginBottom: "1.25rem",
      }}
    >
      <div className="d-flex align-items-center gap-2 mb-2">
        <i
          className="bi bi-info-circle"
          style={{ fontSize: "1rem", color: "#588983" }}
        ></i>
        <strong style={{ color: "#333", fontSize: "0.875rem" }}>
          Empreinte bancaire
        </strong>
      </div>

      <div
        style={{
          fontSize: "0.875rem",
          color: "#333",
          lineHeight: "1.6",
        }}
      >
        Une empreinte bancaire de{" "}
        <strong style={{ color: "#333" }}>{formatAmount(amount)}</strong> sera
        effectuée sur votre carte pour garantir votre réservation, selon{" "}
        <a
          href="/cgu#article6"
          style={{
            color: "#588983",
            textDecoration: "underline",
            fontWeight: 600,
          }}
        >
          nos CGVs
        </a>{" "}
        <br /> Aucun débit ne sera effectué si vous vous présentez à votre
        réservation.
      </div>
    </div>
  );
}
