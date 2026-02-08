// ============================================================================
// DateHeader Component
// ============================================================================
// Displays progress bar and space information for booking flow
// ============================================================================

import BookingProgressBar from "@/components/site/booking/BookingProgressBar";

export interface DateHeaderProps {
  /** Current step in booking flow (1-4) */
  currentStep: 1 | 2 | 3 | 4;
  /** Space subtitle for step 1 */
  spaceSubtitle: string;
  /** Selected date for step 2 (YYYY-MM-DD format) */
  selectedDate: string;
  /** Optional custom class name */
  className?: string;
}

/**
 * Header with progress bar for booking date selection page
 */
export function DateHeader({
  currentStep,
  spaceSubtitle,
  selectedDate,
  className = "",
}: DateHeaderProps) {
  // Format date for display (e.g., "16 Jan")
  const formattedDate = selectedDate
    ? new Date(selectedDate).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "short",
      })
    : "Date";

  return (
    <div className={className}>
      <BookingProgressBar
        currentStep={currentStep}
        customLabels={{
          step1: spaceSubtitle,
          step2: formattedDate,
          step3: "Détails",
          step4: "Paiement",
        }}
      />
    </div>
  );
}
