import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import type {
  OnboardingData,
  OnboardingStep,
  PersonalInfo,
  ContractInfo,
  Availability,
  AdministrativeInfo,
} from '@/types/onboarding'
import { DEFAULT_AVAILABILITY } from '@/types/onboarding'

export function useOnboarding() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<OnboardingStep>(1)
  const [data, setData] = useState<OnboardingData>({
    step3: DEFAULT_AVAILABILITY,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const saveStep1 = useCallback((personalInfo: PersonalInfo) => {
    setData((prev) => ({ ...prev, step1: personalInfo }))
    setCurrentStep(2)
  }, [])

  const saveStep2 = useCallback((contractInfo: ContractInfo) => {
    setData((prev) => ({ ...prev, step2: contractInfo }))
    setCurrentStep(3)
  }, [])

  const saveStep3 = useCallback((availability: Availability) => {
    setData((prev) => ({ ...prev, step3: availability }))
    setCurrentStep(4)
  }, [])

  const saveStep4 = useCallback(
    async (adminInfo: AdministrativeInfo) => {
      setData((prev) => ({ ...prev, step4: adminInfo }))
      setLoading(true)
      setError(null)

      try {
        // Construire l'objet employee complet
        const employeeData = {
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

          // Step 3 - Disponibilités
          availability: data.step3!,

          // Step 4 - Infos administratives
          clockingCode: adminInfo.clockingCode,
          color: adminInfo.color,
          role: adminInfo.role,
          bankDetails: adminInfo.bankDetails,
        }

        const response = await fetch('/api/hr/employees', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(employeeData),
        })

        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || 'Erreur lors de la création')
        }

        // Rediriger vers la page de l'employé créé
        router.push(`/hr/employees/${result.data.id}`)
      } catch (err: any) {
        setError(err.message || 'Une erreur est survenue')
        setLoading(false)
      }
    },
    [data, router]
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
    saveStep1,
    saveStep2,
    saveStep3,
    saveStep4,
    goToStep,
    goBack,
    canGoToStep,
  }
}
