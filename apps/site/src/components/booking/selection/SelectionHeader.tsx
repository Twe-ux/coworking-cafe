// ============================================================================
// SELECTION HEADER COMPONENT
// ============================================================================
// Header avec progress bar, titre et toggle TTC/HT
// Created: 2026-02-08
// ============================================================================

import BookingProgressBar from "@/components/site/booking/BookingProgressBar";
import type { SelectionHeaderProps } from "./types";

export default function SelectionHeader({
  showTTC,
  onToggleTTC,
}: SelectionHeaderProps) {
  return (
    <div className="row justify-content-center mb-4">
      <div className="col-lg-8">
        <BookingProgressBar currentStep={1} />

        {/* Page Title */}
        <div className="text-center mb-4 mt-4">
          <h2 className="mb-2" style={{ fontSize: "1.35rem" }}>
            Quel espace souhaitez-vous réserver ?
          </h2>
          <p className="text-muted" style={{ fontSize: "0.9rem" }}>
            Sélectionnez le type d'espace qui correspond à vos besoins
          </p>

          {/* TTC/HT Switch */}
          <div className="d-flex justify-content-center align-items-center gap-3 mt-3">
            <span
              className={`tax-toggle ${showTTC ? "active" : ""}`}
              onClick={() => onToggleTTC(true)}
              style={{ cursor: "pointer" }}
            >
              Prix TTC
            </span>
            <div className="form-check form-switch mb-0">
              <input
                className="form-check-input"
                type="checkbox"
                role="switch"
                id="taxSwitch"
                checked={!showTTC}
                onChange={() => onToggleTTC(!showTTC)}
                style={{ cursor: "pointer" }}
              />
            </div>
            <span
              className={`tax-toggle ${!showTTC ? "active" : ""}`}
              onClick={() => onToggleTTC(false)}
              style={{ cursor: "pointer" }}
            >
              Prix HT
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
