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
  const isDevelopment =
    typeof window !== "undefined" &&
    window.location.hostname === "localhost";

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

      {isDevelopment && paymentIntentId && (
        <div
          className="alert alert-info mt-4 text-start"
          style={{ fontSize: "0.875rem" }}
        >
          <strong>
            <i className="bi bi-code-square me-2"></i>
            Mode développement
          </strong>
          <p className="mb-2 mt-2">
            En développement local, les webhooks Stripe ne sont
            pas déclenchés automatiquement. Le système a tenté de
            déclencher le webhook automatiquement.
          </p>
          <p className="mb-0">
            Si cela ne fonctionne pas, utilisez la commande
            suivante dans un terminal :
          </p>
          <pre
            className="mt-2 mb-0 p-2 bg-light rounded"
            style={{ fontSize: "0.75rem" }}
          >
            {`curl -X POST http://localhost:3000/api/payments/test-webhook \\
  -H "Content-Type: application/json" \\
  -d '{"paymentIntentId": "${paymentIntentId}"}'`}
          </pre>
        </div>
      )}
    </>
  );
}
