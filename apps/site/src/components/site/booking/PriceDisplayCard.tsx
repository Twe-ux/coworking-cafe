// ============================================================================
// PriceDisplayCard Component
// ============================================================================
// Composant d'affichage du prix avec toggle TTC/HT et détails
// ============================================================================

import React, { useRef } from "react";
import type { ReservationType } from "@/types/booking";

/**
 * Props du composant PriceDisplayCard
 */
interface PriceDisplayCardProps {
  price: number;
  duration: string;
  reservationType: ReservationType;
  numberOfPeople: number;
  showTTC: boolean;
  onToggleTTC: (showTTC: boolean) => void;
  perPerson: boolean; // True si prix par personne
  className?: string;
}

/**
 * Card d'affichage du prix avec toggle TTC/HT
 * Affiche le prix, la durée, et les détails de tarification
 *
 * @param price - Prix à afficher (déjà converti en TTC ou HT)
 * @param duration - Durée formatée (ex: "2H30", "1 semaine")
 * @param reservationType - Type de réservation
 * @param numberOfPeople - Nombre de personnes
 * @param showTTC - True pour afficher TTC, false pour HT
 * @param onToggleTTC - Callback pour changer TTC/HT
 * @param perPerson - True si le prix est par personne
 * @param className - Classes CSS additionnelles
 *
 * @example
 * ```tsx
 * <PriceDisplayCard
 *   price={45.50}
 *   duration="2H30"
 *   reservationType="hourly"
 *   numberOfPeople={2}
 *   showTTC={true}
 *   onToggleTTC={(show) => setShowTTC(show)}
 *   perPerson={true}
 * />
 * ```
 */
export function PriceDisplayCard({
  price,
  duration,
  reservationType,
  numberOfPeople,
  showTTC,
  onToggleTTC,
  perPerson,
  className = "",
}: PriceDisplayCardProps) {
  const priceSectionRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={priceSectionRef} className={className}>
      <div className="row">
        <div className="col-12">
          <div
            className="p-3 border rounded"
            style={{ backgroundColor: "#f8f9fa" }}
          >
            <div className="d-flex justify-content-between align-items-start mb-3">
              <div style={{ visibility: "hidden" }}>
                {/* Spacer for alignment */}
              </div>

              {/* TTC/HT Switch */}
              <div className="d-flex align-items-center gap-2">
                <span
                  className={`tax-toggle ${showTTC ? "active" : ""}`}
                  onClick={() => onToggleTTC(true)}
                  style={{
                    cursor: "pointer",
                    fontSize: "0.75rem",
                  }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && onToggleTTC(true)}
                >
                  TTC
                </span>
                <div className="form-check form-switch mb-0">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    role="switch"
                    id="taxSwitchPrice"
                    checked={!showTTC}
                    onChange={() => onToggleTTC(!showTTC)}
                    style={{ cursor: "pointer" }}
                    aria-label="Basculer entre TTC et HT"
                  />
                </div>
                <span
                  className={`tax-toggle ${!showTTC ? "active" : ""}`}
                  onClick={() => onToggleTTC(false)}
                  style={{
                    cursor: "pointer",
                    fontSize: "0.75rem",
                  }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && onToggleTTC(false)}
                >
                  HT
                </span>
              </div>
            </div>

            {/* Duration (hidden for daily) */}
            {reservationType !== "daily" && duration && (
              <div className="mb-2">
                <span
                  className="text-muted"
                  style={{ fontSize: "0.85rem" }}
                >
                  <i className="bi bi-clock me-2" aria-hidden="true" />
                  {duration}
                </span>
              </div>
            )}

            {/* Price Display */}
            <div
              className="price-display"
              style={{
                fontSize: "2.25rem",
                lineHeight: "1",
                marginTop: reservationType === "daily" ? "1rem" : "0",
              }}
            >
              {price.toFixed(2)}€ {showTTC ? "TTC" : "HT"}
            </div>

            {/* Price Type Label */}
            <p
              className="text-muted mb-0 small mt-2"
              style={{ fontSize: "0.75rem" }}
            >
              {perPerson ? "Prix total" : "Prix fixe"}
              {perPerson && numberOfPeople > 1 && (
                <span className="ms-1">
                  ({numberOfPeople} personne{numberOfPeople > 1 ? "s" : ""})
                </span>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Retourne une référence pour scroll auto vers le prix
 * Utilisé par les composants parents pour scroll vers la section prix
 */
export function usePriceSectionRef() {
  return useRef<HTMLDivElement>(null);
}
