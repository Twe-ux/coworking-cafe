export default function ImportantInfo() {
  return (
    <div
      className="booking-card mb-3 py-3"
      style={{ borderLeft: "4px solid #588983" }}
    >
      <div className="d-flex align-items-center gap-2 mb-2">
        <i
          className="bi bi-info-circle text-success"
          style={{ fontSize: "0.9375rem" }}
        ></i>
        <h6 className="mb-0 fw-semibold" style={{ fontSize: "0.875rem" }}>
          Informations importantes
        </h6>
      </div>
      <ul className="mb-0 ps-3" style={{ fontSize: "0.8125rem", lineHeight: "1.6" }}>
        <li>Veuillez arriver 5 minutes avant le début de votre réservation</li>
        <li>En cas d'annulation, veuillez nous prévenir à l'avance</li>
        <li>Un email de confirmation a été envoyé avec tous les détails</li>
      </ul>
    </div>
  );
}
