import { useState, useCallback, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import type {
  OnboardingData,
  OnboardingStep,
  PersonalInfo,
  ContractInfo,
  Availability,
  AdministrativeInfo,
} from '@/types/onboarding'
import { DEFAULT_AVAILABILITY } from '@/types/onboarding'
import type { Employee } from '@/types/hr'

interface UseOnboardingOptions {
  initialEmployee?: Employee
  mode?: 'create' | 'edit'
  employeeId?: string
}

const STORAGE_KEY = 'onboarding-draft'

export function useOnboarding(options?: UseOnboardingOptions) {
  const router = useRouter()
  const { initialEmployee, mode = 'create', employeeId } = options || {}

  const initialData = useMemo<OnboardingData>(() => {
    // Mode édition : utiliser les données de l'employé
    if (initialEmployee) {
      return {
        step1: {
          firstName: initialEmployee.firstName,
          lastName: initialEmployee.lastName,
          dateOfBirth: initialEmployee.dateOfBirth,
          placeOfBirth: initialEmployee.placeOfBirth,
          address: initialEmployee.address,
          phone: initialEmployee.phone,
          email: initialEmployee.email,
          socialSecurityNumber: initialEmployee.socialSecurityNumber,
        },
        step2: {
          contractType: initialEmployee.contractType,
          contractualHours: initialEmployee.contractualHours,
          hireDate: initialEmployee.hireDate,
          hireTime: initialEmployee.hireTime,
          endDate: initialEmployee.endDate,
          level: initialEmployee.level,
          step: initialEmployee.step,
          hourlyRate: initialEmployee.hourlyRate,
          monthlySalary: initialEmployee.monthlySalary,
          employeeRole: initialEmployee.employeeRole,
        },
        step3: (initialEmployee.availability as Availability) || DEFAULT_AVAILABILITY,
        weeklyDistribution: initialEmployee.workSchedule?.weeklyDistributionData || {},
        step4: {
          clockingCode: initialEmployee.clockingCode || '',
          color: initialEmployee.color || '#3b82f6',
          dpaeCompleted: initialEmployee.onboardingStatus?.dpaeCompleted || false,
          dpaeCompletedAt: initialEmployee.onboardingStatus?.dpaeCompletedAt
            ? new Date(initialEmployee.onboardingStatus.dpaeCompletedAt)
                .toISOString()
                .split('T')[0]
            : '',
          medicalVisitCompleted: initialEmployee.onboardingStatus?.medicalVisitCompleted || false,
          mutuelleCompleted: initialEmployee.onboardingStatus?.mutuelleCompleted || false,
          bankDetailsProvided: initialEmployee.onboardingStatus?.bankDetailsProvided || false,
          registerCompleted: initialEmployee.onboardingStatus?.registerCompleted || false,
          contractSent: initialEmployee.onboardingStatus?.contractSent || false,
        },
      }
    }

    return {
      step3: DEFAULT_AVAILABILITY,
      weeklyDistribution: {}
    }
  }, [initialEmployee])

  // Charger le brouillon depuis BD au montage (mode création uniquement)
  useEffect(() => {
    if (mode === 'create' && !initialEmployee) {
      const loadDraft = async () => {
        try {
          const response = await fetch('/api/hr/employees/draft')
          const result = await response.json()

          if (result.success && result.data) {
            const draft = result.data
            const draftData: OnboardingData = {}

            // Reconstituer les données du brouillon
            if (draft.firstName) {
              draftData.step1 = {
                firstName: draft.firstName,
                lastName: draft.lastName,
                dateOfBirth: draft.dateOfBirth,
                placeOfBirth: draft.placeOfBirth,
                address: draft.address,
                phone: draft.phone,
                email: draft.email,
                socialSecurityNumber: draft.socialSecurityNumber,
              }
            }

            if (draft.contractType) {
              draftData.step2 = {
                contractType: draft.contractType,
                contractualHours: draft.contractualHours,
                hireDate: draft.hireDate,
                hireTime: draft.hireTime,
                endDate: draft.endDate,
                level: draft.level,
                step: draft.step,
                hourlyRate: draft.hourlyRate,
                monthlySalary: draft.monthlySalary,
                employeeRole: draft.employeeRole,
              }
            }

            if (draft.availability) {
              draftData.step3 = draft.availability as Availability
            }

            if (draft.clockingCode) {
              draftData.step4 = {
                clockingCode: draft.clockingCode,
                color: draft.color || '#3b82f6',
                dpaeCompleted: draft.onboardingStatus?.dpaeCompleted || false,
                dpaeCompletedAt: draft.onboardingStatus?.dpaeCompletedAt
                  ? new Date(draft.onboardingStatus.dpaeCompletedAt)
                      .toISOString()
                      .split('T')[0]
                  : '',
                medicalVisitCompleted: draft.onboardingStatus?.medicalVisitCompleted || false,
                mutuelleCompleted: draft.onboardingStatus?.mutuelleCompleted || false,
                bankDetailsProvided: draft.onboardingStatus?.bankDetailsProvided || false,
                registerCompleted: draft.onboardingStatus?.registerCompleted || false,
                contractSent: draft.onboardingStatus?.contractSent || false,
              }
            }

            // Charger la répartition hebdomadaire
            if (draft.workSchedule?.weeklyDistributionData) {
              draftData.weeklyDistribution = draft.workSchedule.weeklyDistributionData
            }

            setData((prev) => ({ ...prev, ...draftData }))

            // Stocker l'ID du brouillon pour pouvoir le mettre à jour
            if (draft._id) {
              setDraftId(draft._id.toString())
            }

            // Définir l'étape courante selon la progression
            if (draft.onboardingStatus) {
              const status = draft.onboardingStatus
              if (!status.step1Completed) setCurrentStep(1)
              else if (!status.step2Completed) setCurrentStep(2)
              else if (!status.step3Completed) setCurrentStep(3)
              else if (!status.step4Completed) setCurrentStep(4)
            }
          }
        } catch (err) {
          console.error('Erreur chargement brouillon:', err)
        }
      }

      loadDraft()
    }
  }, [mode, initialEmployee])

  const [currentStep, setCurrentStep] = useState<OnboardingStep>(() => {
    if (typeof window !== 'undefined' && mode === 'create') {
      const saved = localStorage.getItem(`${STORAGE_KEY}-step`)
      if (saved) {
        return parseInt(saved) as OnboardingStep
      }
    }
    return 1
  })

  const [data, setData] = useState<OnboardingData>(initialData)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [draftId, setDraftId] = useState<string | null>(null)

  // Sauvegarder dans localStorage à chaque changement (mode création uniquement)
  useEffect(() => {
    if (mode === 'create' && typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
      localStorage.setItem(`${STORAGE_KEY}-step`, currentStep.toString())
    }
  }, [data, currentStep, mode])

  const saveStep1 = useCallback(
    async (personalInfo: PersonalInfo) => {
      const updatedData = { ...data, step1: personalInfo }
      setData(updatedData)

      // Sauvegarder en BD si mode création
      if (mode === 'create') {
        try {
          await fetch('/api/hr/employees/draft', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...personalInfo,
              onboardingStatus: {
                step1Completed: true,
                step2Completed: false,
                step3Completed: false,
                step4Completed: false,
              },
            }),
          })
        } catch (err) {
          console.error('Erreur sauvegarde brouillon:', err)
        }
      }

      setCurrentStep(2)
    },
    [data, mode]
  )

  const saveStep2 = useCallback(
    async (contractInfo: ContractInfo) => {
      const updatedData = { ...data, step2: contractInfo }
      setData(updatedData)

      // Sauvegarder en BD si mode création
      if (mode === 'create') {
        try {
          await fetch('/api/hr/employees/draft', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...data.step1,
              ...contractInfo,
              onboardingStatus: {
                step1Completed: true,
                step2Completed: true,
                step3Completed: false,
                step4Completed: false,
              },
            }),
          })
        } catch (err) {
          console.error('Erreur sauvegarde brouillon:', err)
        }
      }

      setCurrentStep(3)
    },
    [data, mode]
  )

  const saveStep3 = useCallback(
    async (availability: Availability, weeklyDistribution?: any) => {
      const updatedData = {
        ...data,
        step3: availability,
        weeklyDistribution
      }
      setData(updatedData)

      // Sauvegarder en BD si mode création
      if (mode === 'create') {
        try {
          await fetch('/api/hr/employees/draft', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...data.step1,
              ...data.step2,
              availability,
              workSchedule: weeklyDistribution ? {
                weeklyDistribution: JSON.stringify(weeklyDistribution),
                timeSlots: '',
                weeklyDistributionData: weeklyDistribution,
              } : undefined,
              onboardingStatus: {
                step1Completed: true,
                step2Completed: true,
                step3Completed: true,
                step4Completed: false,
              },
            }),
          })
        } catch (err) {
          console.error('Erreur sauvegarde brouillon:', err)
        }
      }

      setCurrentStep(4)
    },
    [data, mode]
  )

  const saveStep4 = useCallback(
    async (adminInfo: AdministrativeInfo) => {
      setData((prev) => ({ ...prev, step4: adminInfo }))
      setLoading(true)
      setError(null)

      try {
        // Construire l'objet employee complet
        const employeeData: any = {
          // Step 1 - Infos personnelles
          firstName: data.step1!.firstName,
          lastName: data.step1!.lastName,
          dateOfBirth: data.step1!.dateOfBirth,
          placeOfBirth: data.step1?.placeOfBirth,
          address: data.step1!.address,
          phone: data.step1!.phone,
          email: data.step1!.email,
          socialSecurityNumber: data.step1!.socialSecurityNumber,

          // Step 2 - Infos contractuelles
          contractType: data.step2!.contractType,
          contractualHours: data.step2!.contractualHours,
          hireDate: data.step2!.hireDate,
          hireTime: data.step2?.hireTime,
          endDate: data.step2?.endDate,
          level: data.step2!.level,
          step: data.step2!.step,
          hourlyRate: data.step2!.hourlyRate,
          monthlySalary: data.step2?.monthlySalary,
          employeeRole: data.step2!.employeeRole,

          // Step 3 - Disponibilités + répartition hebdomadaire
          availability: data.step3!,
          workSchedule: data.weeklyDistribution
            ? {
                weeklyDistribution: JSON.stringify(data.weeklyDistribution),
                timeSlots: '',
                weeklyDistributionData: data.weeklyDistribution,
              }
            : undefined,

          // Step 4 - Infos administratives
          clockingCode: adminInfo.clockingCode,
          color: adminInfo.color,

          // Checkboxes administratives vont dans onboardingStatus
          onboardingStatus: {
            step1Completed: true,
            step2Completed: true,
            step3Completed: true,
            step4Completed: true,
            contractGenerated: false,
            dpaeCompleted: adminInfo.dpaeCompleted || false,
            dpaeCompletedAt: adminInfo.dpaeCompletedAt
              ? new Date(adminInfo.dpaeCompletedAt)
              : undefined,
            medicalVisitCompleted: adminInfo.medicalVisitCompleted || false,
            mutuelleCompleted: adminInfo.mutuelleCompleted || false,
            bankDetailsProvided: adminInfo.bankDetailsProvided || false,
            registerCompleted: adminInfo.registerCompleted || false,
            contractSent: adminInfo.contractSent || false,
          },

          // Status flags (will be set below)
          isActive: false,
          isDraft: false,
        }

        // Déterminer isActive en fonction de la date d'embauche
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const hireDate = new Date(data.step2!.hireDate)
        hireDate.setHours(0, 0, 0, 0)

        // Actif si la date d'embauche est aujourd'hui ou dans le passé
        employeeData.isActive = hireDate <= today

        // Si on a un draftId, on met à jour le brouillon au lieu de créer un nouvel employé
        const url =
          mode === 'edit'
            ? `/api/hr/employees/${employeeId}`
            : draftId
              ? `/api/hr/employees/${draftId}`
              : '/api/hr/employees'
        const method = mode === 'edit' || draftId ? 'PUT' : 'POST'

        // Si on finalise un brouillon, marquer isDraft: false
        if (draftId) {
          employeeData.isDraft = false
        }

        const response = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(employeeData),
        })

        const result = await response.json()

        if (!response.ok) {
          throw new Error(
            result.error ||
              `Erreur lors de la ${mode === 'edit' ? 'modification' : 'création'}`
          )
        }

        setLoading(false)

        // Nettoyer localStorage après succès
        if (mode === 'create') {
          if (typeof window !== 'undefined') {
            localStorage.removeItem(STORAGE_KEY)
            localStorage.removeItem(`${STORAGE_KEY}-step`)
          }

          // Si on n'a PAS finalisé un brouillon (draftId === null), supprimer le brouillon en BD
          // Si on a finalisé un brouillon, il a été transformé en employé donc pas besoin de le supprimer
          if (!draftId) {
            try {
              await fetch('/api/hr/employees/draft', {
                method: 'DELETE',
              })
            } catch (err) {
              console.error('Erreur suppression brouillon:', err)
            }
          }
        }

        // Afficher un toast de succès en mode création
        if (mode === 'create') {
          toast.success('Employé créé avec succès', {
            description: 'Le processus d\'onboarding est terminé'
          })
        }

        // Retourner l'employé créé au lieu de rediriger
        return result.data
      } catch (err: any) {
        const errorMessage = err.message || 'Une erreur est survenue'
        setError(errorMessage)
        setLoading(false)

        // Afficher un toast d'erreur
        toast.error('Erreur lors de la création', {
          description: errorMessage
        })

        return null
      }
    },
    [data, mode, employeeId]
  )

  const goToStep = useCallback((step: OnboardingStep) => {
    setCurrentStep(step)
  }, [])

  const goBack = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as OnboardingStep)
    }
  }, [currentStep])

  const canGoToStep = useCallback(
    (step: OnboardingStep): boolean => {
      if (step === 1) return true
      if (step === 2) return !!data.step1
      if (step === 3) return !!data.step1 && !!data.step2
      if (step === 4) return !!data.step1 && !!data.step2 && !!data.step3
      return false
    },
    [data]
  )

  return {
    currentStep,
    data,
    loading,
    error,
    mode,
    saveStep1,
    saveStep2,
    saveStep3,
    saveStep4,
    goToStep,
    goBack,
    canGoToStep,
  }
}
