'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { useOnboardingContext } from '@/contexts/OnboardingContext'
import { ONBOARDING_STEP_LABELS } from '@/types/onboarding'
import type { OnboardingStep } from '@/types/onboarding'

interface OnboardingWizardProps {
  children: React.ReactNode
}

export function OnboardingWizard({ children }: OnboardingWizardProps) {
  const { currentStep, goToStep, goBack, canGoToStep } = useOnboardingContext()

  return (
    <div className="space-y-6">
      {/* Stepper */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          {[1, 2, 3, 4].map((step) => {
            const stepNumber = step as OnboardingStep
            const isActive = stepNumber === currentStep
            const isCompleted = stepNumber < currentStep
            const canAccess = canGoToStep(stepNumber)

            return (
              <div key={step} className="flex items-center flex-1">
                <button
                  onClick={() => canAccess && goToStep(stepNumber)}
                  disabled={!canAccess}
                  className="flex flex-col items-center gap-2 flex-1 group"
                >
                  <div
                    className={`
                      w-10 h-10 rounded-full flex items-center justify-center font-semibold
                      transition-all
                      ${
                        isActive
                          ? 'bg-primary text-primary-foreground ring-4 ring-primary/20'
                          : isCompleted
                            ? 'bg-green-500 text-white'
                            : canAccess
                              ? 'bg-muted text-muted-foreground group-hover:bg-muted/80'
                              : 'bg-muted text-muted-foreground/40'
                      }
                    `}
                  >
                    {isCompleted ? '✓' : step}
                  </div>
                  <span
                    className={`
                      text-xs text-center font-medium
                      ${isActive ? 'text-primary' : isCompleted ? 'text-green-600' : 'text-muted-foreground'}
                    `}
                  >
                    {ONBOARDING_STEP_LABELS[stepNumber]}
                  </span>
                </button>
                {step < 4 && (
                  <div
                    className={`
                      h-0.5 flex-1 mx-2
                      ${isCompleted ? 'bg-green-500' : 'bg-muted'}
                    `}
                  />
                )}
              </div>
            )
          })}
        </div>
      </Card>

      {/* Back Button */}
      {currentStep > 1 && (
        <Button
          variant="ghost"
          onClick={goBack}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour
        </Button>
      )}

      {/* Step Content */}
      {children}
    </div>
  )
}
