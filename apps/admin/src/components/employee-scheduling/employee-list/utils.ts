import type { Employee } from '@/hooks/useEmployees'
import type { EmployeeStatistics, EmployeeFilters } from './types'

/**
 * Calculate employee statistics by role
 */
export function calculateEmployeeStatistics(employees: Employee[]): EmployeeStatistics {
  return {
    active: employees.filter(e => e.status === 'active').length,
    byRole: {
      Manager: employees.filter(e => e.employeeRole === 'Manager').length,
      'Assistant manager': employees.filter(e => e.employeeRole === 'Assistant manager').length,
      'Employé polyvalent': employees.filter(e => e.employeeRole === 'Employé polyvalent').length,
    }
  }
}

/**
 * Filter employees based on search term and role
 */
export function filterEmployees(
  employees: Employee[],
  filters: EmployeeFilters
): Employee[] {
  const { searchTerm, selectedRole } = filters

  return employees.filter((employee) => {
    const matchesSearch =
      employee.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (employee.email &&
        employee.email.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesRole = selectedRole === 'all' || employee.employeeRole === selectedRole

    return matchesSearch && matchesRole
  })
}

/**
 * Available employee roles for filter
 */
export const EMPLOYEE_ROLES = [
  'all',
  'Manager',
  'Assistant manager',
  'Employé polyvalent',
] as const
