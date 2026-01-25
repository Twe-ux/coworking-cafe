/**
 * Types for ContractGenerationModal
 * Simplified to include only types used by the PDF generation modal
 */

import type { Employee } from '@/types/hr'

// Re-export Employee type for convenience
export type { Employee }

/**
 * Props for ContractGenerationModal component
 */
export interface ContractGenerationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  employee: Employee
}

/**
 * Return type for useContractCalculations hook
 */
export interface UseContractCalculationsReturn {
  monthlySalary: string
  monthlyHours: string
}

/**
 * Return type for useContractGeneration hook
 */
export interface UseContractGenerationReturn {
  generating: boolean
  sending: boolean
  generatePDF: () => Promise<void>
  sendEmail: (recipientEmail?: string) => Promise<void>
}
