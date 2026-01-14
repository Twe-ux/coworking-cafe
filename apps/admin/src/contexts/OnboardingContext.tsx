'use client'

import { createContext, useContext, ReactNode } from 'react'
import { useOnboarding } from '@/hooks/hr/useOnboarding'
import type { Employee } from '@/types/hr'

type OnboardingContextType = ReturnType<typeof useOnboarding>

const OnboardingContext = createContext<OnboardingContextType | undefined>(
  undefined
)

interface OnboardingProviderProps {
  children: ReactNode
  initialEmployee?: Employee
  mode?: 'create' | 'edit'
  employeeId?: string
}

export function OnboardingProvider({
  children,
  initialEmployee,
  mode,
  employeeId,
}: OnboardingProviderProps) {
  const onboarding = useOnboarding({ initialEmployee, mode, employeeId })

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
