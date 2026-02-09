// ============================================================================
// PeopleCounterSection Component
// ============================================================================
// Compteur de personnes pour la réservation
// Supporte l'affichage intelligent des tiers de pricing
// ============================================================================

import React from "react";
import type { PricingTier } from "@/types/booking";

/**
 * Props du composant PeopleCounterSection
 */
interface PeopleCounterSectionProps {
  numberOfPeople: number;
  minCapacity: number;
  maxCapacity: number;
  onChange: (count: number) => void;
  /** Tiers de pricing pour affichage intelligent (optionnel) */
  pricingTiers?: PricingTier[];
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
  pricingTiers,
  className = "",
}: PeopleCounterSectionProps) {
  /**
   * Trouve le tier actif basé sur le nombre de personnes
   */
  const findActiveTier = (count: number): PricingTier | null => {
    if (!pricingTiers || pricingTiers.length === 0) return null;

    const sortedTiers = [...pricingTiers].sort((a, b) => a.minPeople - b.minPeople);

    for (const tier of sortedTiers) {
      if (count >= tier.minPeople && count <= tier.maxPeople) {
        return tier;
      }
    }
    return null;
  };

  const activeTier = findActiveTier(numberOfPeople);
  const isInTierRange = activeTier !== null;

  /**
   * Décrémente le nombre de personnes
   * Si on est au-dessus d'un tier, revenir au maxPeople du tier
   * Sinon, décrémenter normalement
   */
  const handleDecrement = () => {
    if (pricingTiers && pricingTiers.length > 0) {
      const sortedTiers = [...pricingTiers].sort((a, b) => a.minPeople - b.minPeople);

      // Si on est juste au-dessus d'un tier, revenir au maxPeople du tier
      for (const tier of sortedTiers) {
        if (numberOfPeople === tier.maxPeople + 1) {
          onChange(tier.maxPeople);
          return;
        }
      }
    }

    // Sinon, décrémenter normalement
    const newValue = Math.max(minCapacity, numberOfPeople - 1);
    onChange(newValue);
  };

  /**
   * Incrémente le nombre de personnes
   * Si on est dans un tier, sauter directement à maxPeople + 1
   * Sinon, incrémenter normalement
   */
  const handleIncrement = () => {
    if (isInTierRange && activeTier) {
      // Sauter directement au-dessus du tier
      const newValue = Math.min(maxCapacity, activeTier.maxPeople + 1);
      onChange(newValue);
    } else {
      // Incrémenter normalement
      const newValue = Math.min(maxCapacity, numberOfPeople + 1);
      onChange(newValue);
    }
  };

  return (
    <div
      className={`p-3 p-md-4 border rounded d-flex flex-column justify-content-center ${className}`}
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
          disabled={
            numberOfPeople <= minCapacity ||
            (isInTierRange && activeTier && activeTier.minPeople === minCapacity)
          }
          aria-label="Diminuer le nombre de personnes"
        >
          <i className="bi bi-dash" aria-hidden="true" />
        </button>

        {/* Affichage du nombre ou range */}
        <div className="counter-display">
          <div className="counter-number">
            {isInTierRange && activeTier
              ? `${activeTier.minPeople}-${activeTier.maxPeople}`
              : numberOfPeople}
          </div>
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

      {/* Capacité et info sur les tiers */}
      <div className="mt-3 text-center">
        <small className="text-muted d-block" style={{ fontSize: "0.75rem" }}>
          Capacité: {minCapacity}-{maxCapacity} pers.
        </small>
        {isInTierRange && activeTier && (
          <small className="text-primary d-block mt-1" style={{ fontSize: "0.7rem", fontWeight: 500 }}>
            Prix unique jusqu'à {activeTier.maxPeople} pers.
          </small>
        )}
      </div>
    </div>
  );
}
