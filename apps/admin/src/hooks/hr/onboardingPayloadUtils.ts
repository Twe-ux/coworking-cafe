import type { OnboardingData, AdministrativeInfo } from '@/types/onboarding'

interface StepsCompleted {
  step1: boolean
  step2: boolean
  step3: boolean
  step4: boolean
}

/**
 * Builds work schedule payload for API
 */
export function buildWorkSchedulePayload(
  weeklyDistribution?: Record<string, Record<string, string>>
) {
  if (!weeklyDistribution) return undefined

  return {
    weeklyDistribution: JSON.stringify(weeklyDistribution),
    timeSlots: '',
    weeklyDistributionData: weeklyDistribution,
  }
}

/**
 * Builds onboarding status object for API
 */
export function buildOnboardingStatus(stepsCompleted: StepsCompleted) {
  return {
    step1Completed: stepsCompleted.step1,
    step2Completed: stepsCompleted.step2,
    step3Completed: stepsCompleted.step3,
    step4Completed: stepsCompleted.step4,
  }
}

/**
 * Builds the complete employee payload for final submission
 */
export function buildEmployeePayload(
  data: OnboardingData,
  adminInfo: AdministrativeInfo
): Record<string, unknown> {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const hireDate = new Date(data.step2!.hireDate)
  hireDate.setHours(0, 0, 0, 0)
  const isActive = hireDate <= today

  return {
    // Step 1 - Personal info
    firstName: data.step1!.firstName,
    lastName: data.step1!.lastName,
    dateOfBirth: data.step1!.dateOfBirth,
    placeOfBirth: data.step1?.placeOfBirth,
    nationality: data.step1?.nationality,
    address: data.step1!.address,
    phone: data.step1!.phone,
    email: data.step1!.email,
    socialSecurityNumber: data.step1!.socialSecurityNumber,
    // Step 2 - Contract info
    contractType: data.step2!.contractType,
    contractualHours: Number(data.step2!.contractualHours),
    hireDate: data.step2!.hireDate,
    hireTime: data.step2?.hireTime,
    endDate: data.step2?.endDate || undefined,
    level: data.step2!.level,
    step: Number(data.step2!.step),
    hourlyRate: Number(data.step2!.hourlyRate),
    monthlySalary: data.step2?.monthlySalary ? Number(data.step2.monthlySalary) : undefined,
    employeeRole: data.step2!.employeeRole,
    // Step 3 - Availability
    availability: data.step3!,
    workSchedule: buildWorkSchedulePayload(data.weeklyDistribution),
    // Step 4 - Administrative info
    clockingCode: adminInfo.clockingCode,
    color: adminInfo.color,
    onboardingStatus: {
      step1Completed: true,
      step2Completed: true,
      step3Completed: true,
      step4Completed: true,
      contractGenerated: false,
      dpaeCompleted: adminInfo.dpaeCompleted || false,
      dpaeCompletedAt: adminInfo.dpaeCompletedAt ? new Date(adminInfo.dpaeCompletedAt) : undefined,
      medicalVisitCompleted: adminInfo.medicalVisitCompleted || false,
      mutuelleCompleted: adminInfo.mutuelleCompleted || false,
      bankDetailsProvided: adminInfo.bankDetailsProvided || false,
      registerCompleted: adminInfo.registerCompleted || false,
      contractSent: adminInfo.contractSent || false,
    },
    isActive,
    isDraft: false,
  }
}

/**
 * Determines the API endpoint and method based on mode
 */
export function getApiEndpoint(
  mode: 'create' | 'edit',
  employeeId?: string,
  draftId?: string | null
): { url: string; method: string } {
  if (mode === 'edit') {
    return { url: `/api/hr/employees/${employeeId}`, method: 'PUT' }
  }
  if (draftId) {
    return { url: `/api/hr/employees/${draftId}`, method: 'PUT' }
  }
  return { url: '/api/hr/employees', method: 'POST' }
}
