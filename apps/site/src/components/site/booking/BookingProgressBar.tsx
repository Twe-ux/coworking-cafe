'use client';

import { Icon } from "@/components/common/Icon";

interface BookingProgressBarProps {
  currentStep: 1 | 2 | 3 | 4;
  customLabels?: {
    step1?: string;
    step2?: string;
    step3?: string;
    step4?: string;
  };
  onStepClick?: (step: number) => void;
}

export default function BookingProgressBar({ currentStep, customLabels, onStepClick }: BookingProgressBarProps) {
  const steps = [
    { number: 1, label: customLabels?.step1 || 'Espace' },
    { number: 2, label: customLabels?.step2 || 'Date' },
    { number: 3, label: customLabels?.step3 || 'Détails' },
    { number: 4, label: customLabels?.step4 || 'Paiement' },
  ];
  const progressPercentage = Math.min(((currentStep - 1) / (steps.length - 1)) * 100, 100);

  return (
    <div className="booking-progress-bar mb-4">
      {/* Progress bar line */}
      <div className="progress-line-container position-relative mb-3">
        <div className="progress-line-background"></div>
        <div
          className="progress-line-fill"
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>

      {/* Step labels */}
      <div className="d-flex justify-content-between">
        {steps.map((step) => {
          const isCompleted = step.number < currentStep;
          const isClickable = isCompleted && onStepClick;

          return (
            <div
              key={step.number}
              className={`step-label text-center ${
                step.number === currentStep
                  ? 'active'
                  : step.number < currentStep
                  ? 'completed'
                  : 'pending'
              } ${isClickable ? 'clickable' : ''}`}
              onClick={() => isClickable && onStepClick(step.number)}
              style={{ cursor: isClickable ? 'pointer' : 'default' }}
            >
              <div className="step-circle-wrapper d-flex justify-content-center mb-2">
                <div className="step-circle">
                  {step.number < currentStep ? (
                    <Icon name="check" size={16} />
                  ) : (
                    step.number
                  )}
                </div>
              </div>
              <div className="step-text" style={{ whiteSpace: 'pre-line' }}>{step.label}</div>
            </div>
          );
        })}
      </div>

      <style jsx>{`
        .booking-progress-bar {
          padding: 0 0 20px 0;
        }

        .progress-line-container {
          height: 4px;
          margin-bottom: 15px;
        }

        .progress-line-background {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 4px;
          background-color: #e0e0e0;
          border-radius: 2px;
        }

        .progress-line-fill {
          position: absolute;
          top: 0;
          left: 0;
          height: 4px;
          background-color: #417972;
          border-radius: 2px;
          transition: width 0.3s ease;
        }

        .step-label {
          flex: 1;
          position: relative;
        }

        .step-circle-wrapper {
          position: relative;
        }

        .step-circle {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 14px;
          transition: all 0.3s ease;
          background-color: #e0e0e0;
          color: #666;
        }

        .step-label.active .step-circle {
          background-color: #417972;
          color: white;
          box-shadow: 0 0 0 4px rgba(65, 121, 114, 0.2);
        }

        .step-label.completed .step-circle {
          background-color: #417972;
          color: white;
        }

        .step-text {
          font-size: 13px;
          color: #999;
          font-weight: 500;
        }

        .step-label.active .step-text {
          color: #333;
          font-weight: 600;
        }

        .step-label.completed .step-text {
          color: #666;
        }

        .step-label.clickable:hover .step-circle {
          transform: scale(1.1);
          box-shadow: 0 0 0 4px rgba(65, 121, 114, 0.2);
        }

        .step-label.clickable:hover .step-text {
          color: #417972;
        }

        @media (max-width: 576px) {
          .step-text {
            font-size: 11px;
          }

          .step-circle {
            width: 28px;
            height: 28px;
            font-size: 12px;
          }
        }
      `}</style>
    </div>
  );
}
