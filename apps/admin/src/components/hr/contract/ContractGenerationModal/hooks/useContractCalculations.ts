/**
 * Hook for contract calculations
 * Handles salary and hours calculations for PDF generation
 */

import { useMemo } from 'react'
import type { Employee, UseContractCalculationsReturn } from '../types'

// Constants
const WEEKS_PER_MONTH = 4.33 // Average weeks per month

interface UseContractCalculationsOptions {
  employee: Employee
}

/**
 * Calculate contract salary and hours
 * Used by ContractGenerationModal for PDF generation
 */
export function useContractCalculations({
  employee,
}: UseContractCalculationsOptions): UseContractCalculationsReturn {
  // Calculate monthly salary
  const monthlySalary = useMemo(() => {
    if (!employee.hourlyRate) return '0.00'
    const salary = employee.hourlyRate * employee.contractualHours * WEEKS_PER_MONTH
    return salary.toFixed(2)
  }, [employee.hourlyRate, employee.contractualHours])

  // Calculate monthly hours
  const monthlyHours = useMemo(() => {
    return (employee.contractualHours * WEEKS_PER_MONTH).toFixed(2)
  }, [employee.contractualHours])

  return {
    monthlySalary,
    monthlyHours,
  }
}
