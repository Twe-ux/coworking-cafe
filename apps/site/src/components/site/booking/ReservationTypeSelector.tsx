// ============================================================================
// ReservationTypeSelector Component
// ============================================================================
// Composant de sélection du type de réservation (hourly/daily/weekly/monthly)
// ============================================================================

import type { ReservationType, ReservationTypeOption } from "@/types/booking";

/**
 * Props du composant ReservationTypeSelector
 */
interface ReservationTypeSelectorProps {
  value: ReservationType;
  availableTypes: ReservationTypeOption[];
  onChange: (type: ReservationType) => void;
  onReset?: () => void; // Called to reset time selections
  className?: string;
}

/**
 * Sélecteur de type de réservation
 * Affiche les types disponibles sous forme de grid de boutons avec icônes
 *
 * @param value - Type de réservation actuellement sélectionné
 * @param availableTypes - Types de réservation disponibles pour l'espace
 * @param onChange - Callback appelé quand un type est sélectionné
 * @param onReset - Callback optionnel pour reset les sélections d'horaires
 * @param className - Classes CSS additionnelles
 *
 * @example
 * ```tsx
 * <ReservationTypeSelector
 *   value={reservationType}
 *   availableTypes={ALL_RESERVATION_TYPES}
 *   onChange={(type) => setReservationType(type)}
 *   onReset={() => {
 *     setStartTime("");
 *     setEndTime("");
 *   }}
 * />
 * ```
 */
export function ReservationTypeSelector({
  value,
  availableTypes,
  onChange,
  onReset,
  className = "",
}: ReservationTypeSelectorProps) {
  const handleTypeChange = (type: ReservationType) => {
    onChange(type);
    // Reset time selections when type changes
    if (onReset) {
      onReset();
    }
  };

  return (
    <div className={className}>
      <label
        className="form-label fw-semibold mb-2"
        style={{ fontSize: "0.9rem" }}
      >
        Type de réservation
      </label>
      <div className="reservation-types-grid">
        {availableTypes.map((type) => (
          <button
            key={type.id}
            type="button"
            className={`reservation-type-btn ${
              value === type.id ? "active" : ""
            }`}
            style={{
              padding: "1rem 0.75rem",
              fontSize: "0.85rem",
            }}
            onClick={() => handleTypeChange(type.id)}
            aria-pressed={value === type.id}
            aria-label={`Réservation ${type.label}`}
          >
            <i
              className={type.icon}
              style={{ fontSize: "1.25rem" }}
              aria-hidden="true"
            />
            <span>{type.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
