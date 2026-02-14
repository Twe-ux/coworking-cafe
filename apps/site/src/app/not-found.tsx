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
    <div
      className="min-vh-100 d-flex align-items-center justify-content-center position-relative"
      style={{
        background: "linear-gradient(135deg, #f8f4f0 0%, #e8dfd6 100%)",
      }}
    >
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-8 text-center">
            {/* Icône café avec animation */}
            <div className="mb-4">
              <i
                className="bi bi-cup-hot-fill display-1"
                style={{
                  fontSize: "8rem",
                  animation: "bounce 2s infinite",
                  color: "#8B6F47",
                  filter: "drop-shadow(0 4px 6px rgba(139, 111, 71, 0.2))",
                }}
              />
            </div>

            {/* Titre 404 */}
            <h1
              className="display-1 fw-bold mb-4"
              style={{
                fontSize: "10rem",
                color: "#6B4423",
                textShadow: "2px 2px 4px rgba(107, 68, 35, 0.1)",
              }}
            >
              404
            </h1>

            <h2
              className="display-5 fw-bold mb-4"
              style={{ color: "#4A3728" }}
            >
              Oups ! Cette page n'existe pas ☕
            </h2>

            <p
              className="lead mb-5 mx-auto"
              style={{
                maxWidth: "600px",
                color: "#6B5D54",
                fontSize: "1.1rem",
              }}
            >
              On dirait que vous cherchez un espace qui n'existe pas dans notre
              coworking... Peut-être qu'un café vous aidera à retrouver votre
              chemin ? 😊
            </p>

            {/* Boutons d'action */}
            <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center mb-5">
              <Link
                href="/"
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
                <i className="bi bi-house-fill me-2" />
                Retour à l'accueil
              </Link>

              <Link
                href="/spaces"
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
                <i className="bi bi-building me-2" />
                Découvrir nos espaces
              </Link>
            </div>

            {/* Message fun */}
            <div
              className="fst-italic small"
              style={{ color: "#6B5D54" }}
            >
              💡 Astuce : Pendant que vous êtes ici, pourquoi ne pas{" "}
              <Link
                href="/booking"
                className="text-decoration-none fw-semibold"
                style={{
                  color: "#8B6F47",
                  borderBottom: "1px solid #8B6F47",
                }}
              >
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
