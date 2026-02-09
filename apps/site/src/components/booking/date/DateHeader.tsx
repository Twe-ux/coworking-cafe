// ============================================================================
// DateHeader Component
// ============================================================================
// Displays progress bar, back button, and space information for booking flow
// Consistent with DetailsHeader and SummaryHeader design
// ============================================================================

import BookingProgressBar from "@/components/site/booking/BookingProgressBar";

export interface DateHeaderProps {
  /** Current step in booking flow (1-4) */
  currentStep: 1 | 2 | 3 | 4;
  /** Space subtitle for step 1 */
  spaceSubtitle: string;
  /** Selected date for step 2 (YYYY-MM-DD format) */
  selectedDate: string;
  /** Handler for step navigation clicks */
  onStepClick: (step: number) => void;
  /** Handler for back button click */
  onBack: () => void;
  /** Optional custom class name */
  className?: string;
}

/**
 * Header with progress bar and navigation for booking date selection page
 * Matches the design pattern from DetailsHeader and SummaryHeader
 */
export function DateHeader({
  currentStep,
  spaceSubtitle,
  selectedDate,
  onStepClick,
  onBack,
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
        onStepClick={onStepClick}
      />

      <hr className="my-3" style={{ opacity: 0.1 }} />

      {/* Navigation */}
      <div className="custom-breadcrumb d-flex justify-content-between align-items-center mb-4">
        <button onClick={onBack} className="breadcrumb-link">
          <i className="bi bi-arrow-left"></i>
          <span>Retour</span>
        </button>
        <h1 className="breadcrumb-current m-0">Sélection de date</h1>
        <div style={{ width: "80px" }}></div>
      </div>
    </div>
  );
}
