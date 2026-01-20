import { useMemo } from 'react'
import type { Employee } from '@/types/hr'
import type { OnboardingData, Availability } from '@/types/onboarding'
import { DEFAULT_AVAILABILITY } from '@/types/onboarding'

/**
 * Transforms an Employee object into OnboardingData format
 * Used when editing an existing employee
 */
function transformEmployeeToOnboardingData(employee: Employee): OnboardingData {
  return {
    step1: {
      firstName: employee.firstName,
      lastName: employee.lastName,
      dateOfBirth: employee.dateOfBirth,
      placeOfBirth: employee.placeOfBirth,
      address: employee.address,
      phone: employee.phone,
      email: employee.email,
      socialSecurityNumber: employee.socialSecurityNumber,
    },
    step2: {
      contractType: employee.contractType,
      contractualHours: employee.contractualHours,
      hireDate: employee.hireDate,
      hireTime: employee.hireTime,
      endDate: employee.endDate,
      level: employee.level,
      step: employee.step,
      hourlyRate: employee.hourlyRate,
      monthlySalary: employee.monthlySalary,
      employeeRole: employee.employeeRole,
    },
    step3: (employee.availability as Availability) || DEFAULT_AVAILABILITY,
    weeklyDistribution: employee.workSchedule?.weeklyDistributionData || {},
    step4: transformAdministrativeInfo(employee),
  }
}

/**
 * Extracts administrative info from employee onboarding status
 */
function transformAdministrativeInfo(employee: Employee) {
  const status = employee.onboardingStatus

  return {
    clockingCode: employee.clockingCode || '',
    color: employee.color || '#3b82f6',
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

/**
 * Returns default empty onboarding data for new employees
 */
function getEmptyOnboardingData(): OnboardingData {
  return {
    step3: DEFAULT_AVAILABILITY,
    weeklyDistribution: {},
  }
}

interface UseOnboardingInitialDataOptions {
  initialEmployee?: Employee
}

interface UseOnboardingInitialDataReturn {
  initialData: OnboardingData
}

/**
 * Hook to compute initial onboarding data
 * - If editing an employee: transforms employee data to onboarding format
 * - If creating new: returns empty default data
 *
 * @param options.initialEmployee - Employee to edit (undefined for creation)
 * @returns initialData - OnboardingData to use as initial state
 */
export function useOnboardingInitialData(
  options: UseOnboardingInitialDataOptions
): UseOnboardingInitialDataReturn {
  const { initialEmployee } = options

  const initialData = useMemo<OnboardingData>(() => {
    if (initialEmployee) {
      return transformEmployeeToOnboardingData(initialEmployee)
    }
    return getEmptyOnboardingData()
  }, [initialEmployee])

  return { initialData }
}
