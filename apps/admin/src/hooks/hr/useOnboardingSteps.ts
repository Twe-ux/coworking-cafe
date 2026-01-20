import { useCallback } from 'react'
import type {
  OnboardingData,
  OnboardingStep,
  PersonalInfo,
  ContractInfo,
  Availability,
  AdministrativeInfo,
  WeeklyDistributionData,
} from '@/types/onboarding'
import type { Employee } from '@/types/hr'
import { buildOnboardingStatus, buildWorkSchedulePayload } from './onboardingUtils'
import { useOnboardingSubmit } from './useOnboardingSubmit'

interface UseOnboardingStepsOptions {
  mode: 'create' | 'edit'
  employeeId?: string
  draftId: string | null
  data: OnboardingData
  setData: React.Dispatch<React.SetStateAction<OnboardingData>>
  setCurrentStep: React.Dispatch<React.SetStateAction<OnboardingStep>>
  clearLocalStorage: () => void
  deleteDraftFromDb: () => Promise<void>
}

interface UseOnboardingStepsReturn {
  loading: boolean
  error: string | null
  saveStep1: (personalInfo: PersonalInfo) => Promise<void>
  saveStep2: (contractInfo: ContractInfo) => Promise<void>
  saveStep3: (availability: Availability, weeklyDistribution?: WeeklyDistributionData) => Promise<void>
  saveStep4: (adminInfo: AdministrativeInfo) => Promise<Employee | null>
}

/**
 * Hook to manage saving each onboarding step
 */
export function useOnboardingSteps(options: UseOnboardingStepsOptions): UseOnboardingStepsReturn {
  const { mode, employeeId, draftId, data, setData, setCurrentStep, clearLocalStorage, deleteDraftFromDb } = options

  const { loading, error, submitEmployee } = useOnboardingSubmit({
    mode, employeeId, draftId, data, clearLocalStorage, deleteDraftFromDb,
  })

  const saveDraftToDb = useCallback(async (payload: Record<string, unknown>) => {
    if (mode !== 'create') return
    try {
      await fetch('/api/hr/employees/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
    } catch (err) {
      console.error('Erreur sauvegarde brouillon:', err)
    }
  }, [mode])

  const saveStep1 = useCallback(async (personalInfo: PersonalInfo) => {
    setData((prev) => ({ ...prev, step1: personalInfo }))
    await saveDraftToDb({
      ...personalInfo,
      onboardingStatus: buildOnboardingStatus({ step1: true, step2: false, step3: false, step4: false }),
    })
    setCurrentStep(2)
  }, [setData, saveDraftToDb, setCurrentStep])

  const saveStep2 = useCallback(async (contractInfo: ContractInfo) => {
    setData((prev) => ({ ...prev, step2: contractInfo }))
    await saveDraftToDb({
      ...data.step1,
      ...contractInfo,
      onboardingStatus: buildOnboardingStatus({ step1: true, step2: true, step3: false, step4: false }),
    })
    setCurrentStep(3)
  }, [data.step1, setData, saveDraftToDb, setCurrentStep])

  const saveStep3 = useCallback(
    async (availability: Availability, weeklyDistribution?: WeeklyDistributionData) => {
      setData((prev) => ({ ...prev, step3: availability, weeklyDistribution }))
      await saveDraftToDb({
        ...data.step1,
        ...data.step2,
        availability,
        workSchedule: buildWorkSchedulePayload(weeklyDistribution),
        onboardingStatus: buildOnboardingStatus({ step1: true, step2: true, step3: true, step4: false }),
      })
      setCurrentStep(4)
    },
    [data.step1, data.step2, setData, saveDraftToDb, setCurrentStep]
  )

  const saveStep4 = useCallback(async (adminInfo: AdministrativeInfo): Promise<Employee | null> => {
    setData((prev) => ({ ...prev, step4: adminInfo }))
    return submitEmployee(adminInfo)
  }, [setData, submitEmployee])

  return { loading, error, saveStep1, saveStep2, saveStep3, saveStep4 }
}
