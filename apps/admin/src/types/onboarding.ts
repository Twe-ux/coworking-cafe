export interface PersonalInfo {
  firstName: string
  lastName: string
  dateOfBirth: string
  placeOfBirth?: string
  address: {
    street: string
    postalCode: string
    city: string
  }
  phone: string
  email: string
  socialSecurityNumber: string
}

export interface ContractInfo {
  contractType: 'CDI' | 'CDD' | 'Stage'
  contractualHours: number
  hireDate: string
  hireTime?: string
  endDate?: string
  level: string
  step: number
  hourlyRate: number
  monthlySalary?: number
  employeeRole: 'Manager' | 'Employé'
}

export interface AvailabilitySlot {
  start: string
  end: string
}

export interface DayAvailability {
  available: boolean
  slots: AvailabilitySlot[]
}

export interface Availability {
  monday: DayAvailability
  tuesday: DayAvailability
  wednesday: DayAvailability
  thursday: DayAvailability
  friday: DayAvailability
  saturday: DayAvailability
  sunday: DayAvailability
}

export interface AdministrativeInfo {
  clockingCode: string
  color: string
  role: 'Manager' | 'Reception' | 'Security' | 'Maintenance' | 'Cleaning' | 'Staff'
  bankDetails?: {
    iban: string
    bic: string
    bankName: string
  }
}

export interface OnboardingData {
  step1?: PersonalInfo
  step2?: ContractInfo
  step3?: Availability
  step4?: AdministrativeInfo
}

export type OnboardingStep = 1 | 2 | 3 | 4

export const ONBOARDING_STEPS = {
  PERSONAL_INFO: 1 as OnboardingStep,
  CONTRACT_INFO: 2 as OnboardingStep,
  AVAILABILITY: 3 as OnboardingStep,
  ADMINISTRATIVE: 4 as OnboardingStep,
}

export const ONBOARDING_STEP_LABELS = {
  1: 'Informations personnelles',
  2: 'Informations contractuelles',
  3: 'Disponibilités',
  4: 'Informations administratives',
}

export const EMPLOYEE_COLORS = [
  'bg-blue-500',
  'bg-green-500',
  'bg-purple-500',
  'bg-orange-500',
  'bg-red-500',
  'bg-teal-500',
  'bg-indigo-500',
  'bg-pink-500',
  'bg-yellow-500',
  'bg-cyan-500',
]

export const DEFAULT_AVAILABILITY: Availability = {
  monday: { available: true, slots: [] },
  tuesday: { available: true, slots: [] },
  wednesday: { available: true, slots: [] },
  thursday: { available: true, slots: [] },
  friday: { available: true, slots: [] },
  saturday: { available: false, slots: [] },
  sunday: { available: false, slots: [] },
}
