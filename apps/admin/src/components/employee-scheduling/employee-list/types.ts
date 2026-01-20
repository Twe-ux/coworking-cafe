import type { Employee } from '@/hooks/useEmployees'

export type ViewMode = 'grid' | 'list'

export type EmployeeRole = 'all' | 'Manager' | 'Assistant manager' | 'Employé polyvalent'

export interface EmployeeListProps {
  onEmployeeSelect?: (employee: Employee) => void
  onEmployeeEdit?: (employee: Employee) => void
  className?: string
}

export interface EmployeeStatistics {
  active: number
  byRole: {
    Manager: number
    'Assistant manager': number
    'Employé polyvalent': number
  }
}

export interface EmployeeFilters {
  searchTerm: string
  selectedRole: EmployeeRole
}

export interface EmployeeActions {
  onCreateEmployee: () => void
  onEditEmployee: (employee: Employee) => void
  onDeleteEmployee: (employee: Employee) => void
}
