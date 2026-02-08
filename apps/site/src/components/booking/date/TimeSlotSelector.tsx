// ============================================================================
// TimeSlotSelector Component
// ============================================================================
// Time slot selection for hourly/daily reservations
// Displays available start and end times
// ============================================================================

import type { ReservationType } from "@/types/booking";

export interface TimeSlotSelectorProps {
  /** Type of reservation (affects time selection behavior) */
  reservationType: ReservationType;
  /** Selected start time (HH:mm format) */
  startTime: string;
  /** Selected end time (HH:mm format) */
  endTime: string;
  /** Selected arrival time for daily reservations (HH:mm format) */
  arrivalTime: string;
  /** Available start time slots */
  availableStartSlots: string[];
  /** Available end time slots */
  availableEndSlots: string[];
  /** Callback when start time changes */
  onStartTimeChange: (time: string) => void;
  /** Callback when end time changes */
  onEndTimeChange: (time: string) => void;
  /** Callback when arrival time changes */
  onArrivalTimeChange: (time: string) => void;
  /** Optional custom class name */
  className?: string;
}

/**
 * Time slot selector for booking flow
 * Shows different UI based on reservation type
 */
export function TimeSlotSelector({
  reservationType,
  startTime,
  endTime,
  arrivalTime,
  availableStartSlots,
  availableEndSlots,
  onStartTimeChange,
  onEndTimeChange,
  onArrivalTimeChange,
  className = "",
}: TimeSlotSelectorProps) {
  // Hourly reservations need start and end times
  const needsTimeRange = reservationType === "hourly";

  // Daily reservations only need arrival time
  const needsArrivalTime = reservationType === "daily";

  return (
    <div className={className}>
      {/* Hourly: Start and End Times */}
      {needsTimeRange && (
        <>
          {/* Start Time */}
          <div className="mb-3">
            <label htmlFor="start-time" className="form-label fw-semibold">
              Heure d&apos;arrivée
            </label>
            <select
              id="start-time"
              className="form-select"
              value={startTime}
              onChange={(e) => onStartTimeChange(e.target.value)}
              required
            >
              <option value="">-- Sélectionnez --</option>
              {availableStartSlots.map((slot) => (
                <option key={slot} value={slot}>
                  {slot}
                </option>
              ))}
            </select>
          </div>

          {/* End Time */}
          {startTime && (
            <div className="mb-3">
              <label htmlFor="end-time" className="form-label fw-semibold">
                Heure de départ
              </label>
              <select
                id="end-time"
                className="form-select"
                value={endTime}
                onChange={(e) => onEndTimeChange(e.target.value)}
                required
              >
                <option value="">-- Sélectionnez --</option>
                {availableEndSlots.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
            </div>
          )}
        </>
      )}

      {/* Daily: Arrival Time Only */}
      {needsArrivalTime && (
        <div className="mb-3">
          <label htmlFor="arrival-time" className="form-label fw-semibold">
            Heure d&apos;arrivée prévue
          </label>
          <select
            id="arrival-time"
            className="form-select"
            value={arrivalTime}
            onChange={(e) => onArrivalTimeChange(e.target.value)}
            required
          >
            <option value="">-- Sélectionnez --</option>
            {availableStartSlots.map((slot) => (
              <option key={slot} value={slot}>
                {slot}
              </option>
            ))}
          </select>
          <small className="text-muted">
            Pour la journée complète, indiquez simplement quand vous arriverez
          </small>
        </div>
      )}

      {/* Weekly/Monthly: No time selection needed */}
      {!needsTimeRange && !needsArrivalTime && (
        <div className="alert alert-info">
          <i className="bi bi-info-circle me-2" />
          Les réservations {reservationType === "weekly" ? "hebdomadaires" : "mensuelles"} ne
          nécessitent pas de sélection d&apos;horaire.
        </div>
      )}
    </div>
  );
}
