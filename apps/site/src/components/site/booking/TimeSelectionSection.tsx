// ============================================================================
// TimeSelectionSection Component
// ============================================================================
// Section accordion pour la sélection d'horaires (hourly/daily)
// ============================================================================

import React, { forwardRef } from "react";
import type { ReservationType } from "@/types/booking";

/**
 * Props du composant TimeSelectionSection
 */
interface TimeSelectionSectionProps {
  reservationType: ReservationType;
  selectedDate: string; // YYYY-MM-DD
  startTime: string; // HH:mm (hourly)
  endTime: string; // HH:mm (hourly)
  arrivalTime: string; // HH:mm (daily)
  availableStartSlots: string[];
  availableEndSlots: string[];
  onStartTimeChange: (time: string) => void;
  onEndTimeChange: (time: string) => void;
  onArrivalTimeChange: (time: string) => void;
  isOpen: boolean;
  onToggle: () => void;
  className?: string;
}

/**
 * Section accordion de sélection d'horaires
 * Gère les deux modes : hourly (start + end) et daily (arrival)
 *
 * @param reservationType - Type de réservation
 * @param selectedDate - Date sélectionnée
 * @param startTime - Heure de début (hourly)
 * @param endTime - Heure de fin (hourly)
 * @param arrivalTime - Heure d'arrivée (daily)
 * @param availableStartSlots - Slots disponibles pour début
 * @param availableEndSlots - Slots disponibles pour fin
 * @param onStartTimeChange - Callback heure début
 * @param onEndTimeChange - Callback heure fin
 * @param onArrivalTimeChange - Callback heure arrivée
 * @param isOpen - True si section ouverte
 * @param onToggle - Callback toggle accordion
 * @param className - Classes CSS additionnelles
 *
 * @example
 * ```tsx
 * <TimeSelectionSection
 *   reservationType="hourly"
 *   selectedDate="2026-02-10"
 *   startTime="09:00"
 *   endTime="12:00"
 *   availableStartSlots={["08:00", "08:30", ...]}
 *   availableEndSlots={["09:00", "09:30", ...]}
 *   onStartTimeChange={(time) => setStartTime(time)}
 *   onEndTimeChange={(time) => setEndTime(time)}
 *   isOpen={timeSectionOpen}
 *   onToggle={() => toggleTimeSection()}
 * />
 * ```
 */
export const TimeSelectionSection = forwardRef<
  HTMLDivElement,
  TimeSelectionSectionProps
>(
  (
    {
      reservationType,
      selectedDate,
      startTime,
      endTime,
      arrivalTime,
      availableStartSlots,
      availableEndSlots,
      onStartTimeChange,
      onEndTimeChange,
      onArrivalTimeChange,
      isOpen,
      onToggle,
      className = "",
    },
    ref
  ) => {
    /**
     * Calcule si un slot de fin est désactivé (< 1h de différence avec start)
     */
    const isEndSlotDisabled = (endSlot: string): boolean => {
      if (!startTime) return false;

      const [startHour, startMinute] = startTime.split(":").map(Number);
      const [endHour, endMinute] = endSlot.split(":").map(Number);

      const startMinutes = startHour * 60 + startMinute;
      const endMinutes = endHour * 60 + endMinute;
      const diff = endMinutes - startMinutes;

      return diff < 60; // Minimum 1 heure
    };

    /**
     * Formate l'affichage des horaires quand fermé
     */
    const getDisplayValue = (): string => {
      if (reservationType === "hourly" && startTime && endTime) {
        return `${startTime} - ${endTime}`;
      }
      if (reservationType === "daily" && arrivalTime) {
        return `À partir de ${arrivalTime}`;
      }
      return "";
    };

    // Ne rien afficher si pas hourly/daily ou pas de date sélectionnée
    if (
      (reservationType !== "hourly" && reservationType !== "daily") ||
      !selectedDate
    ) {
      return null;
    }

    return (
      <div ref={ref} className={`booking-section ${className}`}>
        {/* Header accordion */}
        <div
          className={`booking-section-header ${isOpen ? "active" : ""}`}
          onClick={onToggle}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && onToggle()}
          aria-expanded={isOpen}
          aria-controls="time-selection-content"
        >
          <div className="section-header-left">
            <i className="bi bi-clock" aria-hidden="true" />
            <span>Horaires</span>
          </div>
          <div className={`section-header-right ${isOpen ? "expanded" : ""}`}>
            {!isOpen && (
              <span className="section-value">{getDisplayValue()}</span>
            )}
            <i
              className="bi bi-chevron-down"
              aria-hidden="true"
              style={{
                transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.3s ease",
              }}
            />
          </div>
        </div>

        {/* Contenu accordion */}
        {isOpen && (
          <div
            id="time-selection-content"
            className="booking-section-content"
            aria-hidden={!isOpen}
          >
            {/* Mode HOURLY: Start + End */}
            {reservationType === "hourly" && (
              <div className="row">
                {/* Start Time */}
                <div className="col-md-6 mb-3">
                  <label
                    className="form-label fw-semibold mb-2"
                    style={{ fontSize: "0.85rem" }}
                  >
                    Heure de début
                  </label>
                  <div
                    className="time-slots-grid"
                    style={{
                      maxHeight: "200px",
                      padding: "0.25rem",
                    }}
                  >
                    {availableStartSlots.map((time) => (
                      <button
                        key={time}
                        type="button"
                        className={`time-slot-btn ${
                          startTime === time ? "active" : ""
                        }`}
                        style={{
                          padding: "0.5rem 0.35rem",
                          fontSize: "0.85rem",
                        }}
                        onClick={() => onStartTimeChange(time)}
                        aria-pressed={startTime === time}
                        aria-label={`Heure de début : ${time}`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>

                {/* End Time */}
                <div className="col-md-6 mb-3">
                  <label
                    className="form-label fw-semibold mb-2"
                    style={{ fontSize: "0.85rem" }}
                  >
                    Heure de fin
                  </label>
                  <div
                    className="time-slots-grid"
                    style={{
                      maxHeight: "200px",
                      padding: "0.25rem",
                    }}
                  >
                    {availableEndSlots.map((time) => {
                      const disabled = isEndSlotDisabled(time);

                      return (
                        <button
                          key={time}
                          type="button"
                          className={`time-slot-btn ${
                            endTime === time ? "active" : ""
                          } ${disabled ? "disabled" : ""}`}
                          style={{
                            padding: "0.5rem 0.35rem",
                            fontSize: "0.85rem",
                          }}
                          onClick={() => !disabled && onEndTimeChange(time)}
                          disabled={disabled}
                          aria-pressed={endTime === time}
                          aria-label={`Heure de fin : ${time}`}
                          aria-disabled={disabled}
                        >
                          {time}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Mode DAILY: Arrival Time */}
            {reservationType === "daily" && (
              <div>
                <label
                  className="form-label fw-semibold mb-2"
                  style={{ fontSize: "0.85rem" }}
                >
                  Heure d'arrivée
                </label>
                <p
                  className="text-muted small mb-3"
                  style={{ fontSize: "0.8rem" }}
                >
                  Vous aurez l'espace jusqu'à la fermeture
                </p>
                <div
                  className="time-slots-grid"
                  style={{
                    maxHeight: "250px",
                    padding: "0.25rem",
                  }}
                >
                  {availableStartSlots.map((time) => (
                    <button
                      key={time}
                      type="button"
                      className={`time-slot-btn ${
                        arrivalTime === time ? "active" : ""
                      }`}
                      style={{
                        padding: "0.5rem 0.35rem",
                        fontSize: "0.85rem",
                      }}
                      onClick={() => onArrivalTimeChange(time)}
                      aria-pressed={arrivalTime === time}
                      aria-label={`Heure d'arrivée : ${time}`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
);

TimeSelectionSection.displayName = "TimeSelectionSection";
