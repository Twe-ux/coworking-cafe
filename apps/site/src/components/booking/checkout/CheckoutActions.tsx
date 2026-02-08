'use client';

export default function CheckoutActions() {
  return (
    <div className="text-center mt-4" style={{ paddingBottom: "3rem" }}>
      <p className="text-muted mb-2" style={{ fontSize: "0.875rem", fontWeight: "500" }}>
        <i className="bi bi-shield-check me-2"></i>
        Paiement 100% sécurisé
      </p>
      <div className="d-flex justify-content-center gap-3 flex-wrap">
        <small className="text-muted" style={{ fontSize: "0.75rem" }}>
          <i className="bi bi-lock-fill me-1"></i>
          Cryptage SSL
        </small>
        <small className="text-muted" style={{ fontSize: "0.75rem" }}>
          <i className="bi bi-credit-card-2-front me-1"></i>
          Stripe
        </small>
        <small className="text-muted" style={{ fontSize: "0.75rem" }}>
          <i className="bi bi-shield-fill-check me-1"></i>
          PCI DSS
        </small>
      </div>
    </div>
  );
}
