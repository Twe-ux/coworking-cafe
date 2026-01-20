import { useState, useEffect, useCallback } from 'react'
import type { OnboardingData, OnboardingStep } from '@/types/onboarding'
import {
  transformDraftToOnboardingData,
  getStepFromStatus,
  type DraftApiResponse,
} from './onboardingUtils'

const STORAGE_KEY = 'onboarding-draft'

interface UseOnboardingDraftOptions {
  mode: 'create' | 'edit'
  initialData: OnboardingData
  onDataLoaded?: (data: OnboardingData, step: OnboardingStep) => void
}

interface UseOnboardingDraftReturn {
  draftId: string | null
  loadDraft: () => Promise<void>
  clearLocalStorage: () => void
  saveToLocalStorage: (data: OnboardingData, step: OnboardingStep) => void
  deleteDraftFromDb: () => Promise<void>
}

/**
 * Hook to manage onboarding draft persistence
 * - Loads draft from database on mount (create mode only)
 * - Saves to localStorage on data changes
 * - Provides methods to clear draft data
 */
export function useOnboardingDraft(
  options: UseOnboardingDraftOptions
): UseOnboardingDraftReturn {
  const { mode, onDataLoaded } = options
  const [draftId, setDraftId] = useState<string | null>(null)

  const loadDraft = useCallback(async () => {
    if (mode !== 'create') return

    try {
      const response = await fetch('/api/hr/employees/draft')
      const result: DraftApiResponse = await response.json()

      if (result.success && result.data) {
        const draft = result.data
        const draftData = transformDraftToOnboardingData(draft)

        if (draft._id) {
          setDraftId(draft._id.toString())
        }

        const currentStep = getStepFromStatus(draft.onboardingStatus)

        if (onDataLoaded) {
          onDataLoaded(draftData, currentStep)
        }
      }
    } catch (err) {
      console.error('Erreur chargement brouillon:', err)
    }
  }, [mode, onDataLoaded])

  useEffect(() => {
    loadDraft()
  }, [loadDraft])

  const saveToLocalStorage = useCallback(
    (data: OnboardingData, step: OnboardingStep) => {
      if (mode !== 'create' || typeof window === 'undefined') return

      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
      localStorage.setItem(`${STORAGE_KEY}-step`, step.toString())
    },
    [mode]
  )

  const clearLocalStorage = useCallback(() => {
    if (typeof window === 'undefined') return

    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(`${STORAGE_KEY}-step`)
  }, [])

  const deleteDraftFromDb = useCallback(async () => {
    try {
      await fetch('/api/hr/employees/draft', { method: 'DELETE' })
    } catch (err) {
      console.error('Erreur suppression brouillon:', err)
    }
  }, [])

  return {
    draftId,
    loadDraft,
    clearLocalStorage,
    saveToLocalStorage,
    deleteDraftFromDb,
  }
}
