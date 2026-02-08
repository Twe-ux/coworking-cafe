// ============================================================================
// ReservationTypeSelector Component
// ============================================================================
// Allows user to choose reservation type (hourly, daily, weekly, monthly)
// Uses existing ReservationTypeOption type from @/types/booking
// ============================================================================

import type { ReservationType, ReservationTypeOption } from "@/types/booking";

export interface ReservationTypeSelectorProps {
  /** Currently selected reservation type */
  value: ReservationType;
  /** Available reservation types for this space */
  availableTypes: ReservationTypeOption[];
  /** Callback when reservation type changes */
  onChange: (type: ReservationType) => void;
  /** Callback to reset time selections when type changes */
  onReset?: () => void;
  /** Optional custom class name */
  className?: string;
}

/**
 * Selector for choosing reservation type (hourly, daily, etc.)
 */
export function ReservationTypeSelector({
  value,
  availableTypes,
  onChange,
  onReset,
  className = "",
}: ReservationTypeSelectorProps) {
  const handleChange = (type: ReservationType) => {
    if (type !== value && onReset) {
      onReset();
    }
    onChange(type);
  };

  return (
    <div className={className}>
      <h6 className="mb-3">Type de réservation</h6>

      <div className="row g-2">
        {availableTypes.map((type) => (
          <div key={type.id} className="col-6 col-md-3">
            <button
              type="button"
              className={`btn w-100 ${
                value === type.id ? "btn-primary" : "btn-outline-secondary"
              }`}
              onClick={() => handleChange(type.id)}
            >
              <i className={`${type.icon} d-block mb-1`} style={{ fontSize: "1.5rem" }} />
              <span className="d-block fw-semibold">{type.label}</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
