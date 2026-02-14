// ============================================================================
// SPACE CARD COMPONENT
// ============================================================================
// Carte d'espace individuelle avec image, prix, features
// Created: 2026-02-08
// ============================================================================

"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { SpaceCardProps } from "./types";

export default function SpaceCard({
  space,
  showTTC,
  onConvertPrice,
}: SpaceCardProps) {
  const [showFullDescription, setShowFullDescription] = useState(false);
  return (
    <div className="col-lg-3 col-md-6 px-10">
      <Link
        href={
          space.requiresQuote ? "/contact" : `/booking/${space.id}/new`
        }
        className="text-decoration-none"
      >
        <div className="space-card h-100">
          {/* Image Container */}
          <div className="card-image-container">
            {space.image ? (
              <Image
                src={space.image}
                alt={`${space.title} - Espace CoworKing Café Anticafé Strasbourg`}
                width={600}
                height={400}
                loading="lazy"
                quality={85}
                className="space-image"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  e.currentTarget.nextElementSibling?.classList.remove(
                    "d-none"
                  );
                }}
              />
            ) : null}
            <div
              className={`space-icon-placeholder ${
                space.image ? "d-none" : ""
              }`}
            >
              <i className={space.icon}></i>
            </div>
            <div className="card-overlay">
              <div className="overlay-content">
                <i className="bi bi-arrow-right-circle"></i>
                <span>
                  {space.requiresQuote ? "Demander un devis" : "Réserver"}
                </span>
              </div>
            </div>
          </div>

          {/* Card Content */}
          <div className="card-content">
            <div className="d-flex justify-content-between align-items-center mb-1">
              <h3 className="card-title">{space.title}</h3>
              <p className="card-subtitle text-muted">{space.subtitle}</p>
            </div>
            <div className="capacity-info mb-3">
              <i className="bi bi-people me-2 text-success"></i>
              <span style={{ fontSize: "0.875rem", fontWeight: "500" }}>
                {space.capacity}
              </span>
            </div>

            <div className="position-relative mb-3">
              <p
                className="card-description"
                style={{
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  marginBottom: 0,
                }}
              >
                {space.description}
              </p>

              {/* Info icon for full description */}
              <button
                type="button"
                className="btn btn-link p-0 position-absolute"
                style={{
                  top: 0,
                  right: 0,
                  fontSize: '1.2rem',
                  color: 'var(--main-clr)',
                  textDecoration: 'none',
                }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowFullDescription(!showFullDescription);
                }}
                onMouseEnter={() => setShowFullDescription(true)}
                onMouseLeave={() => setShowFullDescription(false)}
              >
                <i className="bi bi-info-circle"></i>
              </button>

              {/* Tooltip/Popover with full description */}
              {showFullDescription && (
                <div
                  className="position-absolute bg-white border rounded shadow-sm p-3"
                  style={{
                    top: '100%',
                    right: 0,
                    zIndex: 1000,
                    maxWidth: '300px',
                    marginTop: '0.5rem',
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                >
                  <p className="mb-0" style={{ fontSize: '0.875rem' }}>
                    {space.description}
                  </p>
                  <button
                    type="button"
                    className="btn btn-sm btn-link p-0 mt-2 d-md-none"
                    style={{ fontSize: '0.75rem' }}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowFullDescription(false);
                    }}
                  >
                    Fermer
                  </button>
                </div>
              )}
            </div>

            <div className="features-list mb-3">
              {space.features.map((feature, index) => (
                <span key={index} className="feature-badge">
                  {feature}
                </span>
              ))}
            </div>
          </div>

          {/* Pricing section at bottom with full width background */}
          <div
            className={`d-flex mt-auto ${
              space.requiresQuote
                ? "justify-content-center align-items-center"
                : "justify-content-center align-items-center"
            }`}
            style={{
              background:
                "linear-gradient(135deg, rgba(242, 211, 129, 0.25) 0%, rgba(65, 121, 114, 0.2) 100%)",
              borderBottomLeftRadius: "10px",
              borderBottomRightRadius: "10px",
              padding: "20px",
              marginLeft: "-20px",
              marginRight: "-20px",
              marginBottom: "-20px",
            }}
          >
            {!space.requiresQuote && (
              <>
                <div className="d-flex gap-3 align-items-center mb-3">
                  <span className="text-success fw-bold">
                    {onConvertPrice(space.hourlyPrice, showTTC)}{" "}
                    {showTTC ? "TTC" : "HT"}
                  </span>
                  <span
                    className="rounded-circle bg-black"
                    style={{
                      width: "6px",
                      height: "6px",
                      display: "inline-block",
                    }}
                  ></span>
                  <span className="text-success fw-bold">
                    {onConvertPrice(space.dailyPrice, showTTC)}{" "}
                    {showTTC ? "TTC" : "HT"}
                  </span>
                </div>
              </>
            )}
            {space.requiresQuote && (
              <div className="d-flex gap-3 align-items-center mb-3">
                <span className="text-success fw-bold">Sur devis</span>
              </div>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}
