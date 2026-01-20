import { useState } from 'react'
import { useEmployees, type Employee } from '@/hooks/useEmployees'
import { calculateEmployeeStatistics, filterEmployees } from './utils'
import type { ViewMode, EmployeeRole, EmployeeStatistics, EmployeeFilters } from './types'

interface UseEmployeeListLogicReturn {
  // Data
  employees: Employee[]
  filteredEmployees: Employee[]
  statistics: EmployeeStatistics
  isLoading: boolean
  error: string | null

  // Filters state
  searchTerm: string
  selectedRole: EmployeeRole
  viewMode: ViewMode

  // Modals state
  showCreateModal: boolean
  showEditModal: boolean
  showDeleteDialog: boolean
  selectedEmployee: Employee | null
  isDeleting: boolean

  // Actions
  setSearchTerm: (term: string) => void
  setSelectedRole: (role: EmployeeRole) => void
  setViewMode: (mode: ViewMode) => void
  handleCreateClick: () => void
  handleEditEmployee: (employee: Employee) => void
  handleDeleteEmployee: (employee: Employee) => void
  handleCreateSuccess: (newEmployee: Employee) => void
  handleUpdateSuccess: (updatedEmployee: Employee) => void
  handleDeleteConfirm: (employeeId: string) => Promise<void>
  handleCloseCreateModal: () => void
  handleCloseEditModal: () => void
  handleCloseDeleteDialog: () => void
  refreshEmployees: () => Promise<void>
}

export function useEmployeeListLogic(): UseEmployeeListLogicReturn {
  const {
    employees,
    isLoading,
    error,
    refreshEmployees,
  } = useEmployees({ active: true })

  // Filters state
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRole, setSelectedRole] = useState<EmployeeRole>('all')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Calculate statistics
  const statistics = calculateEmployeeStatistics(employees)

  // Filter employees
  const filteredEmployees = filterEmployees(employees, { searchTerm, selectedRole })

  // Handlers
  const handleCreateClick = () => {
    setShowCreateModal(true)
  }

  const handleEditEmployee = (employee: Employee) => {
    setSelectedEmployee(employee)
    setShowEditModal(true)
  }

  const handleDeleteEmployee = (employee: Employee) => {
    setSelectedEmployee(employee)
    setShowDeleteDialog(true)
  }

  const handleCreateSuccess = (newEmployee: Employee) => {
    console.log('Nouvel employé créé:', newEmployee)
    // Hook already refreshes the list
  }

  const handleUpdateSuccess = (updatedEmployee: Employee) => {
    console.log('Employé modifié:', updatedEmployee)
    // Hook already refreshes the list
  }

  const handleDeleteConfirm = async (employeeId: string) => {
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/hr/employees/${employeeId}`, {
        method: 'DELETE',
      })
      const result = await response.json()

      if (result.success) {
        console.log('Employé supprimé avec succès')
        await refreshEmployees()
      } else {
        console.error('Erreur lors de la suppression:', result.error)
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
      setSelectedEmployee(null)
    }
  }

  const handleCloseCreateModal = () => {
    setShowCreateModal(false)
  }

  const handleCloseEditModal = () => {
    setShowEditModal(false)
    setSelectedEmployee(null)
  }

  const handleCloseDeleteDialog = () => {
    setShowDeleteDialog(false)
    setSelectedEmployee(null)
  }

  return {
    // Data
    employees,
    filteredEmployees,
    statistics,
    isLoading,
    error,

    // Filters state
    searchTerm,
    selectedRole,
    viewMode,

    // Modals state
    showCreateModal,
    showEditModal,
    showDeleteDialog,
    selectedEmployee,
    isDeleting,

    // Actions
    setSearchTerm,
    setSelectedRole,
    setViewMode,
    handleCreateClick,
    handleEditEmployee,
    handleDeleteEmployee,
    handleCreateSuccess,
    handleUpdateSuccess,
    handleDeleteConfirm,
    handleCloseCreateModal,
    handleCloseEditModal,
    handleCloseDeleteDialog,
    refreshEmployees,
  }
}
