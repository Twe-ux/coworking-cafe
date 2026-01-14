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
  // Checkboxes de suivi administratif
  dpaeCompleted?: boolean
  medicalVisitCompleted?: boolean
  mutuelleCompleted?: boolean
  bankDetailsProvided?: boolean
  registerCompleted?: boolean
  contractSent?: boolean
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
  { name: 'Bleu', value: '#3B82F6' },
  { name: 'Vert', value: '#10B981' },
  { name: 'Violet', value: '#8B5CF6' },
  { name: 'Orange', value: '#F97316' },
  { name: 'Rouge', value: '#EF4444' },
  { name: 'Cyan', value: '#06B6D4' },
  { name: 'Indigo', value: '#6366F1' },
  { name: 'Rose', value: '#EC4899' },
  { name: 'Jaune', value: '#EAB308' },
  { name: 'Lime', value: '#84CC16' },
  { name: 'Emeraude', value: '#059669' },
  { name: 'Fuchsia', value: '#D946EF' },
  { name: 'Ambre', value: '#F59E0B' },
  { name: 'Bleu ciel', value: '#0EA5E9' },
  { name: 'Pourpre', value: '#A855F7' },
]

export const DEFAULT_AVAILABILITY: Availability = {
  monday: { available: false, slots: [] },
  tuesday: { available: false, slots: [] },
  wednesday: { available: false, slots: [] },
  thursday: { available: false, slots: [] },
  friday: { available: false, slots: [] },
  saturday: { available: false, slots: [] },
  sunday: { available: false, slots: [] },
}
