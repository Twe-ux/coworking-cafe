import { useState, useCallback, useEffect } from 'react'
import type { Employee } from '@/types/hr'
import type {
  OnboardingData,
  OnboardingStep,
  PersonalInfo,
  ContractInfo,
  Availability,
  AdministrativeInfo,
  WeeklyDistributionData,
} from '@/types/onboarding'

import { useOnboardingInitialData } from './useOnboardingInitialData'
import { useOnboardingDraft } from './useOnboardingDraft'
import { useOnboardingSteps } from './useOnboardingSteps'
import { useOnboardingNavigation } from './useOnboardingNavigation'

interface UseOnboardingOptions {
  initialEmployee?: Employee
  mode?: 'create' | 'edit'
  employeeId?: string
}

interface UseOnboardingReturn {
  currentStep: OnboardingStep
  data: OnboardingData
  loading: boolean
  error: string | null
  mode: 'create' | 'edit'
  employeeId?: string
  saveStep1: (personalInfo: PersonalInfo) => Promise<void>
  saveStep2: (contractInfo: ContractInfo) => Promise<void>
  saveStep3: (availability: Availability, weeklyDistribution?: WeeklyDistributionData) => Promise<void>
  saveStep4: (adminInfo: AdministrativeInfo) => Promise<Employee | null>
  goToStep: (step: OnboardingStep) => void
  goBack: () => void
  canGoToStep: (step: OnboardingStep) => boolean
}

/**
 * Main onboarding orchestrator hook
 *
 * Combines specialized hooks:
 * - useOnboardingInitialData: transforms employee data for editing
 * - useOnboardingDraft: manages draft persistence (DB + localStorage)
 * - useOnboardingSteps: handles step-by-step data saving
 * - useOnboardingNavigation: manages step navigation
 *
 * @param options.initialEmployee - Employee to edit (undefined for creation)
 * @param options.mode - 'create' or 'edit' mode
 * @param options.employeeId - Employee ID when editing
 */
export function useOnboarding(options?: UseOnboardingOptions): UseOnboardingReturn {
  const { initialEmployee, mode = 'create', employeeId } = options || {}

  // Get initial data (from employee or empty)
  const { initialData } = useOnboardingInitialData({ initialEmployee })

  // State for onboarding data
  const [data, setData] = useState<OnboardingData>(initialData)

  // Navigation state and methods
  const {
    currentStep,
    setCurrentStep,
    goToStep,
    goBack,
    canGoToStep: canGoToStepFn,
  } = useOnboardingNavigation({ mode })

  // Handler when draft is loaded from database
  const handleDraftLoaded = useCallback(
    (draftData: OnboardingData, step: OnboardingStep) => {
      setData((prev) => ({ ...prev, ...draftData }))
      setCurrentStep(step)
    },
    [setCurrentStep]
  )

  // Draft management (persistence)
  const {
    draftId,
    clearLocalStorage,
    saveToLocalStorage,
    deleteDraftFromDb,
  } = useOnboardingDraft({
    mode,
    initialData,
    onDataLoaded: mode === 'create' && !initialEmployee ? handleDraftLoaded : undefined,
  })

  // Step saving logic
  const { loading, error, saveStep1, saveStep2, saveStep3, saveStep4 } =
    useOnboardingSteps({
      mode,
      employeeId,
      draftId,
      data,
      setData,
      setCurrentStep,
      clearLocalStorage,
      deleteDraftFromDb,
    })

  // Save to localStorage when data or step changes (create mode only)
  useEffect(() => {
    if (mode === 'create') {
      saveToLocalStorage(data, currentStep)
    }
  }, [data, currentStep, mode, saveToLocalStorage])

  // Wrapper for canGoToStep that binds current data
  const canGoToStep = useCallback(
    (step: OnboardingStep): boolean => {
      return canGoToStepFn(step, data)
    },
    [canGoToStepFn, data]
  )

  return {
    currentStep,
    data,
    loading,
    error,
    mode,
    employeeId,
    saveStep1,
    saveStep2,
    saveStep3,
    saveStep4,
    goToStep,
    goBack,
    canGoToStep,
  }
}
