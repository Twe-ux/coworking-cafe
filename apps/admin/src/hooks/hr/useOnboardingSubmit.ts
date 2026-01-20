import { useCallback, useState } from 'react'
import { toast } from 'sonner'
import type { OnboardingData, AdministrativeInfo } from '@/types/onboarding'
import type { Employee } from '@/types/hr'
import { buildEmployeePayload, getApiEndpoint } from './onboardingUtils'

interface UseOnboardingSubmitOptions {
  mode: 'create' | 'edit'
  employeeId?: string
  draftId: string | null
  data: OnboardingData
  clearLocalStorage: () => void
  deleteDraftFromDb: () => Promise<void>
}

interface UseOnboardingSubmitReturn {
  loading: boolean
  error: string | null
  submitEmployee: (adminInfo: AdministrativeInfo) => Promise<Employee | null>
}

/**
 * Hook to handle final employee submission (step 4)
 * - Builds employee payload from onboarding data
 * - Submits to API (create or update)
 * - Handles cleanup on success
 */
export function useOnboardingSubmit(
  options: UseOnboardingSubmitOptions
): UseOnboardingSubmitReturn {
  const { mode, employeeId, draftId, data, clearLocalStorage, deleteDraftFromDb } =
    options

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submitEmployee = useCallback(
    async (adminInfo: AdministrativeInfo): Promise<Employee | null> => {
      setLoading(true)
      setError(null)

      try {
        const employeeData = buildEmployeePayload(data, adminInfo)
        const { url, method } = getApiEndpoint(mode, employeeId, draftId)

        if (draftId) {
          employeeData.isDraft = false
        }

        const response = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(employeeData),
        })

        const result = await response.json()

        if (!response.ok) {
          throw new Error(
            result.error ||
              `Erreur lors de la ${mode === 'edit' ? 'modification' : 'création'}`
          )
        }

        if (mode === 'create') {
          clearLocalStorage()
          if (!draftId) {
            await deleteDraftFromDb()
          }
          toast.success('Employé créé avec succès', {
            description: "Le processus d'onboarding est terminé",
          })
        }

        setLoading(false)
        return result.data as Employee
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Une erreur est survenue'
        setError(errorMessage)
        setLoading(false)

        toast.error('Erreur lors de la création', {
          description: errorMessage,
        })

        return null
      }
    },
    [data, mode, employeeId, draftId, clearLocalStorage, deleteDraftFromDb]
  )

  return {
    loading,
    error,
    submitEmployee,
  }
}
