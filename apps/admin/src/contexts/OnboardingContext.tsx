'use client'

import { createContext, useContext, ReactNode } from 'react'
import { useOnboarding } from '@/hooks/hr/useOnboarding'

type OnboardingContextType = ReturnType<typeof useOnboarding>

const OnboardingContext = createContext<OnboardingContextType | undefined>(
  undefined
)

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const onboarding = useOnboarding()

  return (
    <OnboardingContext.Provider value={onboarding}>
      {children}
    </OnboardingContext.Provider>
  )
}

export function useOnboardingContext() {
  const context = useContext(OnboardingContext)
  if (context === undefined) {
    throw new Error(
      'useOnboardingContext must be used within OnboardingProvider'
    )
  }
  return context
}
