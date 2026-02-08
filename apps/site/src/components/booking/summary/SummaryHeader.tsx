"use client";

import BookingProgressBar from "@/components/site/booking/BookingProgressBar";
import { useRouter } from "next/navigation";

interface SummaryHeaderProps {
  currentStep: 1 | 2 | 3 | 4;
  spaceSubtitle: string;
  dateLabel: string;
  timeLabel: string;
  peopleLabel: string;
  spaceType: string;
  onBack: () => void;
}

export default function SummaryHeader({
  currentStep,
  spaceSubtitle,
  dateLabel,
  timeLabel,
  peopleLabel,
  spaceType,
  onBack,
}: SummaryHeaderProps) {
  const router = useRouter();

  return (
    <div className="booking-card mb-4">
      {/* Progress Bar */}
      <BookingProgressBar
        currentStep={currentStep}
        customLabels={{
          step1: spaceSubtitle,
          step2: `${dateLabel} ${timeLabel}\n${peopleLabel}`,
          step3: "Détails",
        }}
        onStepClick={(step) => {
          if (step === 1) {
            router.push("/booking");
          } else if (step === 2) {
            router.push(`/booking/${spaceType}/new`);
          } else if (step === 3) {
            router.push("/booking/details");
          }
        }}
      />

      <hr className="my-3" style={{ opacity: 0.1 }} />

      {/* Navigation and Title */}
      <div className="custom-breadcrumb d-flex justify-content-between align-items-center">
        <button onClick={onBack} className="breadcrumb-link">
          <i className="bi bi-arrow-left"></i>
          <span>Retour</span>
        </button>
        <h1 className="breadcrumb-current m-0">Récapitulatif</h1>
        <div style={{ width: "80px" }}></div>
      </div>
    </div>
  );
}
