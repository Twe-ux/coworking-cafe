// ============================================================================
// DateSelectionSection Component
// ============================================================================
// Section accordion pour la sélection de date avec CustomDatePicker
// ============================================================================

import CustomDatePicker from "./CustomDatePicker";
import type { ReservationType } from "@/types/booking";

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
   * Calcule les dates min/max pour le DatePicker
   */
  const getMinDate = (): string => {
    const today = new Date();
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
