// ============================================================================
// PriceSummary Component
// ============================================================================
// Displays calculated price summary with TTC/HT toggle
// Shows duration and per-person breakdown if applicable
// ============================================================================

import type { ReservationType } from "@/types/booking";

export interface PriceSummaryProps {
  /** Calculated price to display */
  price: number;
  /** Duration string (e.g., "2h30", "1 jour") */
  duration: string;
  /** Type of reservation */
  reservationType: ReservationType;
  /** Number of people */
  numberOfPeople: number;
  /** Whether to show TTC or HT price */
  showTTC: boolean;
  /** Callback to toggle TTC/HT */
  onToggleTTC: (show: boolean) => void;
  /** Whether pricing is per person */
  perPerson: boolean;
  /** Optional custom class name */
  className?: string;
}

/**
 * Price summary card with TTC/HT toggle
 */
export function PriceSummary({
  price,
  duration,
  reservationType,
  numberOfPeople,
  showTTC,
  onToggleTTC,
  perPerson,
  className = "",
}: PriceSummaryProps) {
  // Calculate per-person price if applicable
  const pricePerPerson = perPerson && numberOfPeople > 0 ? price / numberOfPeople : price;

  // Calculate TTC/HT prices (20% VAT)
  const htPrice = showTTC ? price / 1.2 : price;
  const ttcPrice = showTTC ? price : price * 1.2;

  return (
    <div className={`card h-100 ${className}`}>
      <div className="card-body d-flex flex-column">
        <h6 className="card-title mb-3">
          <i className="bi bi-calculator me-2" />
          Prix de la réservation
        </h6>

        {/* Price Display */}
        <div className="text-center flex-grow-1 d-flex flex-column justify-content-center">
          <div className="fs-2 fw-bold text-success mb-2">{price.toFixed(2)} €</div>

          <div className="text-muted">
            <small>
              {duration}
              {perPerson && ` • ${numberOfPeople} ${numberOfPeople > 1 ? "personnes" : "personne"}`}
            </small>
          </div>

          {/* Per-person breakdown */}
          {perPerson && numberOfPeople > 1 && (
            <div className="mt-2">
              <small className="text-muted">
                {pricePerPerson.toFixed(2)} € / personne
              </small>
            </div>
          )}
        </div>

        {/* TTC/HT Toggle */}
        <div className="mt-3 pt-3 border-top">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span className="small">Prix affiché :</span>
            <div className="btn-group btn-group-sm" role="group">
              <button
                type="button"
                className={`btn ${showTTC ? "btn-primary" : "btn-outline-secondary"}`}
                onClick={() => onToggleTTC(true)}
              >
                TTC
              </button>
              <button
                type="button"
                className={`btn ${!showTTC ? "btn-primary" : "btn-outline-secondary"}`}
                onClick={() => onToggleTTC(false)}
              >
                HT
              </button>
            </div>
          </div>

          {/* HT/TTC breakdown */}
          <div className="small text-muted">
            {showTTC ? (
              <>
                HT : {htPrice.toFixed(2)} € • TVA 20% : {(ttcPrice - htPrice).toFixed(2)} €
              </>
            ) : (
              <>
                TTC : {ttcPrice.toFixed(2)} € • TVA 20% : {(ttcPrice - htPrice).toFixed(2)} €
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
