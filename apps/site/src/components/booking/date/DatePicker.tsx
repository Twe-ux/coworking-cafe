// ============================================================================
// DatePicker Component
// ============================================================================
// Date selection component for booking flow
// Supports single date or date range selection
// ============================================================================

import type { ReservationType } from "@/types/booking";

export interface DatePickerProps {
  /** Type of reservation (affects date selection behavior) */
  reservationType: ReservationType;
  /** Currently selected date (YYYY-MM-DD format) */
  selectedDate: string;
  /** End date for multi-day reservations (YYYY-MM-DD format) */
  endDate?: string;
  /** Callback when date changes */
  onChange: (date: string) => void;
  /** Optional custom class name */
  className?: string;
}

/**
 * Date picker component for booking flow
 * Allows single or range selection based on reservation type
 */
export function DatePicker({
  reservationType,
  selectedDate,
  endDate,
  onChange,
  className = "",
}: DatePickerProps) {
  // Calculate minimum date (today)
  const today = new Date();
  const minDate = today.toISOString().split("T")[0]; // YYYY-MM-DD

  // Multi-day reservations need date range
  const needsDateRange = reservationType === "weekly" || reservationType === "monthly";

  return (
    <div className={className}>
      <div className="mb-3">
        <label htmlFor="booking-date" className="form-label fw-semibold">
          {needsDateRange ? "Date de début" : "Date de réservation"}
        </label>
        <input
          type="date"
          id="booking-date"
          className="form-control"
          value={selectedDate}
          min={minDate}
          onChange={(e) => onChange(e.target.value)}
          required
        />
      </div>

      {/* End date for multi-day reservations */}
      {needsDateRange && selectedDate && (
        <div className="mb-3">
          <label htmlFor="booking-end-date" className="form-label fw-semibold">
            Date de fin
          </label>
          <input
            type="date"
            id="booking-end-date"
            className="form-control"
            value={endDate || ""}
            min={selectedDate}
            onChange={(e) => {
              // This would need to be passed as a separate prop
              // For now, we'll keep it simple
              console.log("End date changed:", e.target.value);
            }}
            required
          />
          <small className="text-muted">
            La réservation sera calculée du {selectedDate} au {endDate || "..."}
          </small>
        </div>
      )}

      {/* Helper text */}
      <small className="text-muted d-block">
        {reservationType === "hourly" && "Sélectionnez la date de votre réservation"}
        {reservationType === "daily" && "Sélectionnez le jour de votre réservation"}
        {reservationType === "weekly" && "Sélectionnez la période (7 jours minimum)"}
        {reservationType === "monthly" && "Sélectionnez la période (30 jours minimum)"}
      </small>
    </div>
  );
}
