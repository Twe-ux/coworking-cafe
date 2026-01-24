/**
 * Types for ContractGenerationModal
 * Following conventions from /types/hr.ts
 */

import type { Employee, TimeSlot } from '@/types/hr'

// Re-export Employee type for convenience
export type { Employee }

// Contract day configuration
export interface ContractDay {
  key: DayKey
  label: string
}

export type DayKey =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday'

// Company information for contract
export interface CompanyInfo {
  name: string
  legalForm: string
  address: {
    street: string
    postalCode: string
    city: string
  }
  representative: {
    name: string
    role: string
  }
  nafCode: string
  urssaf: {
    name: string
    number: string
  }
}

// Contract generation state
export interface ContractGenerationState {
  isEditing: boolean
  generating: boolean
}

// Table cell styles
export interface TableCellStyle {
  border: string
  padding: string
  textAlign?: 'left' | 'center' | 'right'
  fontWeight?: 'normal' | 'bold'
  width?: string
  backgroundColor?: string
}

// Schedule slot for table display
export interface ScheduleSlot {
  firstSlot: string
  secondSlot: string
  totalHours: string
}

// Props for main modal
export interface ContractGenerationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  employee: Employee
}

// Props for contract content
export interface ContractContentProps {
  employee: Employee
  isEditing: boolean
  monthlySalary: string
  monthlyHours: string
  contractRef: React.RefObject<HTMLDivElement | null>
  viewMode?: 'edit' | 'preview'
}

// Props for parties section
export interface ContractPartiesProps {
  employee: Employee
}

// Props for articles section
export interface ContractArticlesProps {
  employee: Employee
  monthlySalary: string
  monthlyHours: string
}

// Props for availability table
export interface AvailabilityTableProps {
  employee: Employee
}

// Props for distribution table
export interface DistributionTableProps {
  employee: Employee
}

// Props for signature section
export interface ContractSignatureProps {
  employee: Employee
}

// Hook return type for calculations
export interface UseContractCalculationsReturn {
  monthlySalary: string
  monthlyHours: string
  calculateDayHours: (slots: TimeSlot[]) => string
  isFullTime: boolean
  contractTypeLabel: string
}

// Hook return type for generation
export interface UseContractGenerationReturn {
  generating: boolean
  generatePDF: () => Promise<void>
}
