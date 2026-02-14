// ============================================================================
// DateSelectionSection Component
// ============================================================================
// Section accordion pour la sélection de date avec CustomDatePicker
// ============================================================================

import CustomDatePicker from "./CustomDatePicker";
import type { ReservationType, GlobalHours } from "@/types/booking";

/**
 * Props du composant DateSelectionSection
 */
interface DateSelectionSectionProps {
  reservationType: ReservationType;
  selectedDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD (for weekly/monthly)
  onDateChange: (date: string) => void;
  isOpen: boolean;
  isClosing: boolean;
  onToggle: () => void;
  globalHours?: GlobalHours | null;
  className?: string;
}

/**
 * Section accordion de sélection de date
 * Contient le CustomDatePicker et gère l'affichage accordion
 *
 * @param reservationType - Type de réservation
 * @param selectedDate - Date sélectionnée (YYYY-MM-DD)
 * @param endDate - Date de fin pour weekly/monthly
 * @param onDateChange - Callback appelé quand la date change
 * @param isOpen - True si la section est ouverte
 * @param isClosing - True pendant l'animation de fermeture
 * @param onToggle - Callback pour toggle l'accordion
 * @param className - Classes CSS additionnelles
 *
 * @example
 * ```tsx
 * <DateSelectionSection
 *   reservationType="hourly"
 *   selectedDate="2026-02-10"
 *   endDate=""
 *   onDateChange={(date) => setSelectedDate(date)}
 *   isOpen={dateSectionOpen}
 *   isClosing={dateSectionClosing}
 *   onToggle={() => toggleDateSection()}
 * />
 * ```
 */
export function DateSelectionSection({
  reservationType,
  selectedDate,
  endDate,
  onDateChange,
  isOpen,
  isClosing,
  onToggle,
  globalHours,
  className = "",
}: DateSelectionSectionProps) {
  /**
   * Formate la date pour affichage (ex: "10 février")
   */
  const formatDisplayDate = (dateStr: string): string => {
    if (!dateStr) return "";

    const [year, month, day] = dateStr.split("-").map(Number);
    const dateObj = new Date(year, month - 1, day);

    return dateObj.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
    });
  };

  /**
   * Vérifie si aujourd'hui peut être proposé selon le type de réservation
   * - Hourly: au moins 1h avant la fermeture
   * - Daily: avant 15H00
   */
  const hasTodayAvailableEndTimes = (): boolean => {
    if (!globalHours) return true;

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    // Daily reservation: not available after 15H00
    if (reservationType === "daily") {
      const cutoffTime = 15 * 60; // 15H00 in minutes
      return currentMinutes < cutoffTime;
    }

    // Hourly reservation: need at least 1h before closing
    if (reservationType === "hourly") {
      const today = new Date();
      const dayOfWeek = today.toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
      const dayHours = globalHours.defaultHours?.[dayOfWeek];

      if (!dayHours || !dayHours.isOpen || !dayHours.closeTime) return false;

      // Parse closing time
      const [closeHour, closeMinute] = dayHours.closeTime.split(":").map(Number);
      const closeMinutes = closeHour * 60 + closeMinute;

      // Need at least 1h before closing for an end time
      return currentMinutes + 60 < closeMinutes;
    }

    // Weekly/Monthly: always available (no time restriction for today)
    return true;
  };

  /**
   * Calcule les dates min/max pour le DatePicker
   */
  const getMinDate = (): string => {
    const today = new Date();

    // Si aujourd'hui n'a pas d'heures de fin disponibles, commencer demain
    if (!hasTodayAvailableEndTimes()) {
      today.setDate(today.getDate() + 1);
    }

    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(today.getDate()).padStart(2, "0")}`;
  };

  const getMaxDate = (): string => {
    // 10 semaines = 70 jours
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 70);
    return `${maxDate.getFullYear()}-${String(
      maxDate.getMonth() + 1
    ).padStart(2, "0")}-${String(maxDate.getDate()).padStart(2, "0")}`;
  };

  if (!reservationType) return null;

  return (
    <div className={`booking-section ${className}`}>
      {/* Header accordion */}
      <div
        className={`booking-section-header ${isOpen ? "active" : ""}`}
        onClick={onToggle}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && onToggle()}
        aria-expanded={isOpen}
        aria-controls="date-selection-content"
      >
        <div className="section-header-left">
          <i className="bi bi-calendar" aria-hidden="true" />
          <span>Date</span>
        </div>
        <div className={`section-header-right ${isOpen ? "expanded" : ""}`}>
          {/* Affiche la date sélectionnée quand fermé */}
          {!isOpen && selectedDate && (
            <span className="section-value">
              {formatDisplayDate(selectedDate)}
            </span>
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
      {(isOpen || isClosing) && (
        <div
          id="date-selection-content"
          className={`booking-section-content ${isClosing ? "closing" : ""}`}
          aria-hidden={!isOpen}
        >
          <CustomDatePicker
            selectedDate={selectedDate}
            onDateChange={onDateChange}
            minDate={getMinDate()}
            maxDate={getMaxDate()}
            reservationType={reservationType}
            endDate={endDate}
          />
        </div>
      )}
    </div>
  );
}
