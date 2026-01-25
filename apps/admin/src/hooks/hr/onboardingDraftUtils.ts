import type { OnboardingData, OnboardingStep, Availability } from '@/types/onboarding'

/**
 * Draft data structure from API
 */
export interface DraftData {
  _id?: { toString: () => string }
  firstName?: string
  lastName?: string
  dateOfBirth?: string
  placeOfBirth?: string
  nationality?: string
  address?: { street: string; postalCode: string; city: string }
  phone?: string
  email?: string
  socialSecurityNumber?: string
  contractType?: 'CDI' | 'CDD' | 'Stage'
  contractualHours?: number
  hireDate?: string
  hireTime?: string
  endDate?: string
  level?: string
  step?: number
  hourlyRate?: number
  monthlySalary?: number
  employeeRole?: 'Manager' | 'Assistant manager' | 'Employé polyvalent'
  availability?: Availability
  clockingCode?: string
  color?: string
  onboardingStatus?: {
    step1Completed?: boolean
    step2Completed?: boolean
    step3Completed?: boolean
    step4Completed?: boolean
    dpaeCompleted?: boolean
    dpaeCompletedAt?: string
    medicalVisitCompleted?: boolean
    mutuelleCompleted?: boolean
    bankDetailsProvided?: boolean
    registerCompleted?: boolean
    contractSent?: boolean
  }
  workSchedule?: {
    weeklyDistributionData?: Record<string, Record<string, string>>
  }
}

export interface DraftApiResponse {
  success: boolean
  data?: DraftData
}

/**
 * Transforms API draft data to OnboardingData format
 */
export function transformDraftToOnboardingData(draft: DraftData): OnboardingData {
  const draftData: OnboardingData = {}

  if (draft.firstName) {
    draftData.step1 = {
      firstName: draft.firstName,
      lastName: draft.lastName || '',
      dateOfBirth: draft.dateOfBirth || '',
      placeOfBirth: draft.placeOfBirth,
      nationality: draft.nationality,
      address: draft.address || { street: '', postalCode: '', city: '' },
      phone: draft.phone || '',
      email: draft.email || '',
      socialSecurityNumber: draft.socialSecurityNumber || '',
    }
  }

  if (draft.contractType) {
    draftData.step2 = {
      contractType: draft.contractType,
      contractualHours: draft.contractualHours || 0,
      hireDate: draft.hireDate || '',
      hireTime: draft.hireTime,
      endDate: draft.endDate,
      level: draft.level || '',
      step: draft.step || 1,
      hourlyRate: draft.hourlyRate || 0,
      monthlySalary: draft.monthlySalary,
      employeeRole: draft.employeeRole || 'Employé polyvalent',
    }
  }

  if (draft.availability) {
    draftData.step3 = draft.availability
  }

  if (draft.clockingCode) {
    const status = draft.onboardingStatus
    draftData.step4 = {
      clockingCode: draft.clockingCode,
      color: draft.color || '#3b82f6',
      dpaeCompleted: status?.dpaeCompleted || false,
      dpaeCompletedAt: status?.dpaeCompletedAt
        ? new Date(status.dpaeCompletedAt).toISOString().split('T')[0]
        : '',
      medicalVisitCompleted: status?.medicalVisitCompleted || false,
      mutuelleCompleted: status?.mutuelleCompleted || false,
      bankDetailsProvided: status?.bankDetailsProvided || false,
      registerCompleted: status?.registerCompleted || false,
      contractSent: status?.contractSent || false,
    }
  }

  if (draft.workSchedule?.weeklyDistributionData) {
    draftData.weeklyDistribution = draft.workSchedule.weeklyDistributionData
  }

  return draftData
}

/**
 * Determines current step based on onboarding status
 */
export function getStepFromStatus(status: DraftData['onboardingStatus']): OnboardingStep {
  if (!status) return 1
  if (!status.step1Completed) return 1
  if (!status.step2Completed) return 2
  if (!status.step3Completed) return 3
  if (!status.step4Completed) return 4
  return 4
}
