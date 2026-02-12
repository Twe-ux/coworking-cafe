"use client";

import { useEffect } from "react";
import Link from "next/link";

/**
 * Page Error - Erreur générale
 *
 * Affichée quand une erreur inattendue se produit
 * Design adapté au site public avec Bootstrap 5
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log l'erreur pour le debugging
    console.error("Error page:", error);
  }, [error]);

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-gradient-primary">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-8 text-center">
            {/* Icône d'alerte avec animation */}
            <div className="mb-4">
              <i
                className="bi bi-exclamation-triangle-fill display-1 text-danger"
                style={{
                  fontSize: "8rem",
                  animation: "pulse 2s infinite",
                }}
              />
            </div>

            {/* Titre */}
            <h1 className="display-2 fw-bold text-dark mb-4">Oups !</h1>

            <h2 className="display-6 fw-bold text-dark mb-4">
              Une erreur s'est produite ☕💥
            </h2>

            <p className="lead text-muted mb-4 mx-auto" style={{ maxWidth: "600px" }}>
              On dirait qu'on a renversé le café sur le serveur... Pas de
              panique, ça arrive même aux meilleurs ! 😅
            </p>

            {/* Message d'erreur (dev mode) */}
            {process.env.NODE_ENV === "development" && (
              <div className="alert alert-warning mb-4 mx-auto text-start" style={{ maxWidth: "600px" }}>
                <p className="mb-2 font-monospace small">
                  <strong>Erreur :</strong> {error.message}
                </p>
                {error.digest && (
                  <p className="mb-0 font-monospace small text-muted">
                    <strong>Digest :</strong> {error.digest}
                  </p>
                )}
              </div>
            )}

            {/* Boutons d'action */}
            <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center mb-5">
              <button
                onClick={reset}
                className="btn btn-primary btn-lg px-4 py-3"
              >
                <i className="bi bi-arrow-clockwise me-2" />
                Réessayer
              </button>

              <Link href="/" className="btn btn-outline-secondary btn-lg px-4 py-3">
                <i className="bi bi-house-fill me-2" />
                Retour à l'accueil
              </Link>
            </div>

            {/* Messages fun */}
            <div className="mt-5">
              <div className="text-muted fst-italic small mb-3">
                💡 "Il n'y a pas de bugs, seulement des fonctionnalités
                inattendues !"
                <br />
                <span className="text-muted" style={{ fontSize: "0.75rem" }}>
                  - Développeur anonyme après son 5ème café
                </span>
              </div>

              <div className="text-muted" style={{ fontSize: "0.75rem" }}>
                Si le problème persiste, contactez l'équipe technique avec une
                tasse de café en main ☕
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Animation CSS */}
      <style jsx>{`
        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  );
}
