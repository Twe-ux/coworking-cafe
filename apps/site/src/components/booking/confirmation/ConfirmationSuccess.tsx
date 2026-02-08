interface ConfirmationSuccessProps {
  isPaid: boolean;
}

export default function ConfirmationSuccess({ isPaid }: ConfirmationSuccessProps) {
  return (
    <>
      <div className="booking-card mb-3 text-center py-3">
        <div className="success-icon mb-2">
          <i
            className="bi bi-check-circle-fill text-success"
            style={{ fontSize: "3rem" }}
          ></i>
        </div>
        <h2 className="mb-2" style={{ fontSize: "1.25rem", fontWeight: "700" }}>
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
