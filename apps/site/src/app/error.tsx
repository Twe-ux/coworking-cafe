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
    <div
      className="min-vh-100 d-flex align-items-center justify-content-center position-relative"
      style={{
        background: "linear-gradient(135deg, #f8f4f0 0%, #e8dfd6 100%)",
      }}
    >
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-8 text-center">
            {/* Icône d'alerte avec animation */}
            <div className="mb-4">
              <i
                className="bi bi-exclamation-triangle-fill display-1"
                style={{
                  fontSize: "8rem",
                  animation: "pulse 2s infinite",
                  color: "#C17A3A",
                  filter: "drop-shadow(0 4px 6px rgba(193, 122, 58, 0.2))",
                }}
              />
            </div>

            {/* Titre */}
            <h1
              className="display-2 fw-bold mb-4"
              style={{
                color: "#6B4423",
                textShadow: "2px 2px 4px rgba(107, 68, 35, 0.1)",
              }}
            >
              Oups !
            </h1>

            <h2
              className="display-6 fw-bold mb-4"
              style={{ color: "#4A3728" }}
            >
              Une erreur s'est produite ☕💥
            </h2>

            <p
              className="lead mb-4 mx-auto"
              style={{
                maxWidth: "600px",
                color: "#6B5D54",
                fontSize: "1.1rem",
              }}
            >
              On dirait qu'on a renversé le café sur le serveur... Pas de
              panique, ça arrive même aux meilleurs ! 😅
            </p>

            {/* Message d'erreur (dev mode) */}
            {process.env.NODE_ENV === "development" && (
              <div
                className="mb-4 mx-auto text-start p-3 rounded"
                style={{
                  maxWidth: "600px",
                  backgroundColor: "#FFF9E6",
                  border: "2px solid #F4D19B",
                  boxShadow: "0 2px 8px rgba(193, 122, 58, 0.1)",
                }}
              >
                <p className="mb-2 font-monospace small" style={{ color: "#6B4423" }}>
                  <strong>Erreur :</strong> {error.message}
                </p>
                {error.digest && (
                  <p className="mb-0 font-monospace small" style={{ color: "#8B6F47" }}>
                    <strong>Digest :</strong> {error.digest}
                  </p>
                )}
              </div>
            )}

            {/* Boutons d'action */}
            <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center mb-5">
              <button
                onClick={reset}
                className="btn btn-lg px-4 py-3 fw-semibold"
                style={{
                  backgroundColor: "#8B6F47",
                  border: "none",
                  color: "white",
                  boxShadow: "0 4px 12px rgba(139, 111, 71, 0.3)",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#6B4423";
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow =
                    "0 6px 16px rgba(139, 111, 71, 0.4)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#8B6F47";
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow =
                    "0 4px 12px rgba(139, 111, 71, 0.3)";
                }}
              >
                <i className="bi bi-arrow-clockwise me-2" />
                Réessayer
              </button>

              <Link
                href="/"
                className="btn btn-lg px-4 py-3 fw-semibold"
                style={{
                  backgroundColor: "white",
                  border: "2px solid #8B6F47",
                  color: "#8B6F47",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#8B6F47";
                  e.currentTarget.style.color = "white";
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow =
                    "0 6px 16px rgba(139, 111, 71, 0.3)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "white";
                  e.currentTarget.style.color = "#8B6F47";
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow =
                    "0 4px 12px rgba(0, 0, 0, 0.1)";
                }}
              >
                <i className="bi bi-house-fill me-2" />
                Retour à l'accueil
              </Link>
            </div>

            {/* Messages fun */}
            <div className="mt-5">
              <div className="fst-italic small mb-3" style={{ color: "#6B5D54" }}>
                💡 "Il n'y a pas de bugs, seulement des fonctionnalités
                inattendues !"
                <br />
                <span style={{ fontSize: "0.75rem", color: "#8B6F47" }}>
                  - Développeur anonyme après son 5ème café
                </span>
              </div>

              <div style={{ fontSize: "0.75rem", color: "#6B5D54" }}>
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
