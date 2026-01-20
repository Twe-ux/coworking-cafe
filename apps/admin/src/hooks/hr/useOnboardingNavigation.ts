import { useState, useCallback } from 'react'
import type { OnboardingData, OnboardingStep } from '@/types/onboarding'

const STORAGE_KEY = 'onboarding-draft'

/**
 * Gets the initial step from localStorage (create mode only)
 */
function getInitialStepFromStorage(mode: 'create' | 'edit'): OnboardingStep {
  if (typeof window === 'undefined' || mode !== 'create') {
    return 1
  }

  const saved = localStorage.getItem(`${STORAGE_KEY}-step`)
  if (saved) {
    const step = parseInt(saved, 10)
    if (step >= 1 && step <= 4) {
      return step as OnboardingStep
    }
  }

  return 1
}

interface UseOnboardingNavigationOptions {
  mode: 'create' | 'edit'
}

interface UseOnboardingNavigationReturn {
  currentStep: OnboardingStep
  setCurrentStep: React.Dispatch<React.SetStateAction<OnboardingStep>>
  goToStep: (step: OnboardingStep) => void
  goBack: () => void
  canGoToStep: (step: OnboardingStep, data: OnboardingData) => boolean
}

/**
 * Hook to manage onboarding step navigation
 * - Tracks current step
 * - Provides navigation methods (goToStep, goBack)
 * - Validates step accessibility based on completed data
 *
 * @param options.mode - 'create' or 'edit' mode
 */
export function useOnboardingNavigation(
  options: UseOnboardingNavigationOptions
): UseOnboardingNavigationReturn {
  const { mode } = options

  const [currentStep, setCurrentStep] = useState<OnboardingStep>(() =>
    getInitialStepFromStorage(mode)
  )

  /**
   * Navigate to a specific step
   */
  const goToStep = useCallback((step: OnboardingStep) => {
    setCurrentStep(step)
  }, [])

  /**
   * Go back to previous step
   */
  const goBack = useCallback(() => {
    setCurrentStep((prev) => {
      if (prev > 1) {
        return (prev - 1) as OnboardingStep
      }
      return prev
    })
  }, [])

  /**
   * Check if navigation to a step is allowed
   * Based on whether previous steps have data
   */
  const canGoToStep = useCallback(
    (step: OnboardingStep, data: OnboardingData): boolean => {
      switch (step) {
        case 1:
          return true
        case 2:
          return !!data.step1
        case 3:
          return !!data.step1 && !!data.step2
        case 4:
          return !!data.step1 && !!data.step2 && !!data.step3
        default:
          return false
      }
    },
    []
  )

  return {
    currentStep,
    setCurrentStep,
    goToStep,
    goBack,
    canGoToStep,
  }
}
