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
      <Card className="p-4 md:p-6">
        <div className="flex items-center justify-center gap-1 sm:gap-2 md:gap-4">
          {[1, 2, 3, 4].map((step) => {
            const stepNumber = step as OnboardingStep
            const isActive = stepNumber === currentStep
            const isCompleted = stepNumber < currentStep
            const canAccess = canGoToStep(stepNumber)

            return (
              <div key={step} className="flex items-center">
                <button
                  onClick={() => canAccess && goToStep(stepNumber)}
                  disabled={!canAccess}
                  className="flex flex-col items-center gap-1 sm:gap-2 w-16 sm:w-24 md:w-32 group"
                >
                  <div
                    className={`
                      w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-semibold text-sm sm:text-base
                      transition-all
                      ${
                        isActive
                          ? 'bg-primary text-primary-foreground ring-2 sm:ring-4 ring-primary/20'
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
                  <div
                    className={`
                      text-[10px] sm:text-xs text-center font-medium leading-tight
                      ${isActive ? 'text-primary' : isCompleted ? 'text-green-600' : 'text-muted-foreground'}
                    `}
                  >
                    <div>{ONBOARDING_STEP_LABELS[stepNumber].line1}</div>
                    <div>{ONBOARDING_STEP_LABELS[stepNumber].line2}</div>
                  </div>
                </button>
                {step < 4 && (
                  <div
                    className={`
                      h-0.5 w-4 sm:w-8 md:w-16 mx-0.5 sm:mx-1 md:mx-2
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
