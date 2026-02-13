// ============================================================================
// PeopleStepper Component
// ============================================================================
// Stepper control for selecting number of people
// Shows min/max capacity constraints
// ============================================================================

export interface PeopleStepperProps {
  /** Current number of people */
  value: number;
  /** Minimum capacity allowed */
  minCapacity: number;
  /** Maximum capacity allowed */
  maxCapacity: number;
  /** Callback when value changes */
  onChange: (value: number) => void;
  /** Optional custom class name */
  className?: string;
}

/**
 * Stepper component for selecting number of people
 * Enforces min/max capacity constraints
 */
export function PeopleStepper({
  value,
  minCapacity,
  maxCapacity,
  onChange,
  className = "",
}: PeopleStepperProps) {
  const canDecrement = value > minCapacity;
  const canIncrement = value < maxCapacity;

  const handleDecrement = () => {
    if (canDecrement) {
      onChange(value - 1);
    }
  };

  const handleIncrement = () => {
    if (canIncrement) {
      onChange(value + 1);
    }
  };

  return (
    <div className={`card h-100 ${className}`}>
      <div className="card-body d-flex flex-column">
        <h6 className="card-title mb-3">
          <span className="me-2">👥</span>
          Nombre de personnes
        </h6>

        {/* Stepper Controls */}
        <div className="d-flex align-items-center justify-content-center flex-grow-1">
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={handleDecrement}
            disabled={!canDecrement}
            aria-label="Diminuer le nombre de personnes"
            style={{ fontSize: '1.5rem', width: '45px', height: '45px' }}
          >
            −
          </button>

          <div className="mx-4 text-center">
            <div className="fs-1 fw-bold text-primary">{value}</div>
            <small className="text-muted">
              {value === 1 ? "personne" : "personnes"}
            </small>
          </div>

          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={handleIncrement}
            disabled={!canIncrement}
            aria-label="Augmenter le nombre de personnes"
            style={{ fontSize: '1.5rem', width: '45px', height: '45px' }}
          >
            +
          </button>
        </div>

        {/* Capacity Info */}
        <div className="mt-3 text-center">
          <small className="text-muted">
            Capacité : {minCapacity} - {maxCapacity} personnes
          </small>
        </div>
      </div>
    </div>
  );
}
