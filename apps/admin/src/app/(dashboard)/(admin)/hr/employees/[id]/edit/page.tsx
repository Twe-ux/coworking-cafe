'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { OnboardingProvider, useOnboardingContext } from '@/contexts/OnboardingContext'
import { OnboardingWizard } from '@/components/hr/onboarding/OnboardingWizard'
import { Step1PersonalInfo } from '@/components/hr/onboarding/Step1PersonalInfo'
import { Step2ContractInfo } from '@/components/hr/onboarding/Step2ContractInfo'
import { Step3Availability } from '@/components/hr/onboarding/Step3Availability'
import { Step4Administrative } from '@/components/hr/onboarding/Step4Administrative'
import { LoadingSkeleton } from '@/components/ui/loading-skeleton'
import type { Employee } from '@/types/hr'
import { toast } from 'sonner'

function OnboardingContent() {
  const { currentStep } = useOnboardingContext()

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Modifier un employé</h1>
        <p className="text-muted-foreground mt-2">
          Modifiez les informations de l'employé
        </p>
      </div>

      <OnboardingWizard>
        {currentStep === 1 && <Step1PersonalInfo />}
        {currentStep === 2 && <Step2ContractInfo />}
        {currentStep === 3 && <Step3Availability />}
        {currentStep === 4 && <Step4Administrative />}
      </OnboardingWizard>
    </div>
  )
}

export default function EditEmployeePage() {
  const params = useParams()
  const router = useRouter()
  const [employee, setEmployee] = useState<Employee | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const response = await fetch(`/api/hr/employees/${params.id}`)
        const result = await response.json()

        if (result.success) {
          setEmployee(result.data)
        } else {
          toast.error('Erreur', {
            description: 'Impossible de charger l\'employé'
          })
          router.push('/hr')
        }
      } catch (error) {
        console.error('Erreur chargement employé:', error)
        toast.error('Erreur', {
          description: 'Une erreur est survenue'
        })
        router.push('/hr')
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchEmployee()
    }
  }, [params.id, router])

  if (loading) {
    return <LoadingSkeleton variant="page" count={4} />
  }

  if (!employee) {
    return null
  }

  return (
    <OnboardingProvider
      initialEmployee={employee}
      mode="edit"
      employeeId={params.id as string}
    >
      <OnboardingContent />
    </OnboardingProvider>
  )
}
