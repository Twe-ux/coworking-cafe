"use client";

import Link from "next/link";

/**
 * Page 404 - Not Found
 *
 * Affichée quand une route n'existe pas
 * Design adapté au site public avec Bootstrap 5
 */
export default function NotFound() {
  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-8 text-center">
            {/* Icône café avec animation */}
            <div className="mb-4">
              <i
                className="bi bi-cup-hot-fill display-1 text-warning"
                style={{
                  fontSize: "8rem",
                  animation: "bounce 2s infinite",
                }}
              />
            </div>

            {/* Titre 404 */}
            <h1
              className="display-1 fw-bold text-warning mb-4"
              style={{ fontSize: "10rem" }}
            >
              404
            </h1>

            <h2 className="display-5 fw-bold text-dark mb-4">
              Oups ! Cette page n'existe pas ☕
            </h2>

            <p className="lead text-muted mb-5 mx-auto" style={{ maxWidth: "600px" }}>
              On dirait que vous cherchez un espace qui n'existe pas dans notre
              coworking... Peut-être qu'un café vous aidera à retrouver votre
              chemin ? 😊
            </p>

            {/* Boutons d'action */}
            <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center mb-5">
              <Link href="/" className="btn btn-warning btn-lg px-4 py-3">
                <i className="bi bi-house-fill me-2" />
                Retour à l'accueil
              </Link>

              <Link
                href="/spaces"
                className="btn btn-outline-secondary btn-lg px-4 py-3"
              >
                <i className="bi bi-building me-2" />
                Découvrir nos espaces
              </Link>
            </div>

            {/* Message fun */}
            <div className="text-muted fst-italic small">
              💡 Astuce : Pendant que vous êtes ici, pourquoi ne pas{" "}
              <Link href="/booking" className="text-warning text-decoration-none">
                réserver un espace
              </Link>{" "}
              pour votre prochaine session de travail ?
            </div>
          </div>
        </div>
      </div>

      {/* Animation CSS */}
      <style jsx>{`
        @keyframes bounce {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-20px);
          }
        }
      `}</style>
    </div>
  );
}
