'use client'

import { OnboardingProvider, useOnboardingContext } from '@/contexts/OnboardingContext'
import { OnboardingWizard } from '@/components/hr/onboarding/OnboardingWizard'
import { Step1PersonalInfo } from '@/components/hr/onboarding/Step1PersonalInfo'
import { Step2ContractInfo } from '@/components/hr/onboarding/Step2ContractInfo'
import { Step3Availability } from '@/components/hr/onboarding/Step3Availability'
import { Step4Administrative } from '@/components/hr/onboarding/Step4Administrative'

function OnboardingContent() {
  const { currentStep } = useOnboardingContext()

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Nouvel employé</h1>
        <p className="text-muted-foreground mt-2">
          Suivez les étapes pour créer un nouveau profil employé
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

export default function NewEmployeePage() {
  return (
    <OnboardingProvider>
      <OnboardingContent />
    </OnboardingProvider>
  )
}
