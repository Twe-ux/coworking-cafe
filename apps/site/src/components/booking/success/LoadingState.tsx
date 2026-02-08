interface LoadingStateProps {
  message: string;
}

export default function LoadingState({ message }: LoadingStateProps) {
  return (
    <>
      <div className="mb-4">
        <div
          className="spinner-border text-success"
          role="status"
          style={{ width: "4rem", height: "4rem" }}
        >
          <span className="visually-hidden">Chargement...</span>
        </div>
      </div>
      <h2
        className="mb-3"
        style={{ fontSize: "1.5rem", fontWeight: "700" }}
      >
        Traitement en cours...
      </h2>
      <p
        className="text-muted mb-0"
        style={{ fontSize: "0.9375rem" }}
      >
        {message}
      </p>
      <p
        className="text-muted mt-3"
        style={{ fontSize: "0.875rem" }}
      >
        <i className="bi bi-info-circle me-2"></i>
        Veuillez patienter, ne fermez pas cette page
      </p>
    </>
  );
}
