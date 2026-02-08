// ============================================================================
// PeopleCounterSection Component
// ============================================================================
// Compteur de personnes pour la réservation
// ============================================================================

import React from "react";

/**
 * Props du composant PeopleCounterSection
 */
interface PeopleCounterSectionProps {
  numberOfPeople: number;
  minCapacity: number;
  maxCapacity: number;
  onChange: (count: number) => void;
  className?: string;
}

/**
 * Compteur de personnes avec boutons +/-
 * Affiche la capacité min/max de l'espace
 *
 * @param numberOfPeople - Nombre actuel de personnes
 * @param minCapacity - Capacité minimale de l'espace
 * @param maxCapacity - Capacité maximale de l'espace
 * @param onChange - Callback appelé quand le nombre change
 * @param className - Classes CSS additionnelles
 *
 * @example
 * ```tsx
 * <PeopleCounterSection
 *   numberOfPeople={2}
 *   minCapacity={1}
 *   maxCapacity={60}
 *   onChange={(count) => setNumberOfPeople(count)}
 * />
 * ```
 */
export function PeopleCounterSection({
  numberOfPeople,
  minCapacity,
  maxCapacity,
  onChange,
  className = "",
}: PeopleCounterSectionProps) {
  /**
   * Décrémente le nombre de personnes (min = minCapacity)
   */
  const handleDecrement = () => {
    const newValue = Math.max(minCapacity, numberOfPeople - 1);
    onChange(newValue);
  };

  /**
   * Incrémente le nombre de personnes (max = maxCapacity)
   */
  const handleIncrement = () => {
    const newValue = Math.min(maxCapacity, numberOfPeople + 1);
    onChange(newValue);
  };

  return (
    <div className={className}>
      <div className="row">
        <div className="col-12">
          <div
            className="p-3 p-md-4 border rounded"
            style={{ backgroundColor: "#f8f9fa" }}
          >
            <label
              className="form-label fw-semibold mb-3 text-center d-block"
              style={{ fontSize: "0.9rem" }}
            >
              Nombre de personnes
            </label>

            <div className="people-counter mx-auto" style={{ maxWidth: "220px" }}>
              {/* Bouton moins */}
              <button
                type="button"
                className="counter-btn"
                onClick={handleDecrement}
                disabled={numberOfPeople <= minCapacity}
                aria-label="Diminuer le nombre de personnes"
              >
                <i className="bi bi-dash" aria-hidden="true" />
              </button>

              {/* Affichage du nombre */}
              <div className="counter-display">
                <div className="counter-number">{numberOfPeople}</div>
              </div>

              {/* Bouton plus */}
              <button
                type="button"
                className="counter-btn"
                onClick={handleIncrement}
                disabled={numberOfPeople >= maxCapacity}
                aria-label="Augmenter le nombre de personnes"
              >
                <i className="bi bi-plus" aria-hidden="true" />
              </button>
            </div>

            {/* Capacité min-max */}
            <small
              className="text-muted mt-3 d-block text-center"
              style={{ fontSize: "0.75rem" }}
            >
              Capacité: {minCapacity}-{maxCapacity} pers.
            </small>
          </div>
        </div>
      </div>
    </div>
  );
}
