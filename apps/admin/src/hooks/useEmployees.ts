'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Employee } from '@/types/hr'

// Re-export Employee type for convenience
export type { Employee } from '@/types/hr'

interface UseEmployeesOptions {
  role?: string
  active?: boolean
  status?: 'active' | 'inactive' | 'all'
}

export function useEmployees(options: UseEmployeesOptions = {}) {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchEmployees = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Build query parameters
      const params = new URLSearchParams()
      if (options.role) params.append('role', options.role)
      if (options.status) params.append('status', options.status)

      const response = await fetch(`/api/hr/employees?${params.toString()}`)
      const result = await response.json()

      if (result.success) {
        // Filtrer pour masquer le compte Admin Dev (compte technique pour tests)
        const filteredEmployees = (result.data || []).filter((emp: Employee) => {
          return emp.email !== "dev@coworkingcafe.com" &&
                 !(emp.firstName === "Admin" && emp.lastName === "Dev");
        });
        setEmployees(filteredEmployees)
        setError(null)
      } else {
        setError(result.error || 'Error fetching employees')
        setEmployees([])
      }
    } catch (err) {
      console.error('Error useEmployees:', err)
      setError('Server connection error')
      setEmployees([])
    } finally {
      setIsLoading(false)
    }
  }, [options.role, options.status])

  useEffect(() => {
    fetchEmployees()
  }, [fetchEmployees])

  const getEmployeeById = useCallback(
    (id: string) => {
      return employees.find((emp) => emp.id === id || emp._id === id)
    },
    [employees]
  )

  const getEmployeesByRole = useCallback(
    (role: string) => {
      return employees.filter((emp) => emp.employeeRole === role && emp.status === 'active')
    },
    [employees]
  )

  const getActiveEmployees = useCallback(() => {
    return employees.filter((emp) => emp.status === 'active')
  }, [employees])

  return {
    employees,
    isLoading,
    error,
    refreshEmployees: fetchEmployees,
    getEmployeeById,
    getEmployeesByRole,
    getActiveEmployees,
  }
}
