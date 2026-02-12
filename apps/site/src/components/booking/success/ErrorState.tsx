interface ErrorStateProps {
  message: string;
  paymentIntentId: string | null;
  onRetry: () => void;
  onBack: () => void;
}

export default function ErrorState({
  message,
  paymentIntentId,
  onRetry,
  onBack,
}: ErrorStateProps) {
  return (
    <>
      <div className="mb-4">
        <i
          className="bi bi-exclamation-triangle-fill text-warning"
          style={{ fontSize: "4rem" }}
        ></i>
      </div>
      <h2
        className="mb-3"
        style={{ fontSize: "1.5rem", fontWeight: "700" }}
      >
        Attention
      </h2>
      <p
        className="text-muted mb-4"
        style={{ fontSize: "0.9375rem" }}
      >
        {message}
      </p>
      <div className="d-flex gap-2 justify-content-center">
        <button
          onClick={onRetry}
          className="btn btn-success"
        >
          <i className="bi bi-arrow-clockwise me-2"></i>
          Réessayer
        </button>
        <button
          onClick={onBack}
          className="btn btn-outline-secondary"
        >
          Retour aux réservations
        </button>
      </div>
    </>
  );
}
