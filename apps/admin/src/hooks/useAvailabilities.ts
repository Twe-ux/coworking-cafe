'use client'

import { useState, useEffect, useCallback } from 'react'
import type {
  Availability,
  CreateAvailabilityInput,
  UpdateAvailabilityInput,
  UseAvailabilitiesOptions,
} from '@/types/availability'

/**
 * Custom hook for managing employee availabilities
 * Provides CRUD operations and filtering capabilities
 */
export function useAvailabilities(options: UseAvailabilitiesOptions = {}) {
  const [availabilities, setAvailabilities] = useState<Availability[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAvailabilities = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Build query parameters
      const params = new URLSearchParams()
      if (options.employeeId) params.append('employeeId', options.employeeId)
      if (options.dayOfWeek !== undefined) params.append('dayOfWeek', String(options.dayOfWeek))
      if (options.active !== undefined) params.append('active', String(options.active))

      const response = await fetch(`/api/availabilities?${params.toString()}`)
      const result = await response.json()

      if (result.success) {
        setAvailabilities(result.data)
        setError(null)
      } else {
        setError(result.error || 'Error fetching availabilities')
        setAvailabilities([])
      }
    } catch (err) {
      console.error('Error useAvailabilities:', err)
      setError('Server connection error')
      setAvailabilities([])
    } finally {
      setIsLoading(false)
    }
  }, [options.employeeId, options.dayOfWeek, options.active])

  useEffect(() => {
    fetchAvailabilities()
  }, [fetchAvailabilities])

  const createAvailability = useCallback(async (data: CreateAvailabilityInput) => {
    try {
      const response = await fetch('/api/availabilities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (result.success) {
        setAvailabilities((prev) => [...prev, result.data])
        return { success: true, data: result.data }
      } else {
        return {
          success: false,
          error: result.error,
          details: result.details,
        }
      }
    } catch (error) {
      console.error('Error creating availability:', error)
      return { success: false, error: 'Server connection error' }
    }
  }, [])

  const updateAvailability = useCallback(
    async (id: string, updateData: UpdateAvailabilityInput) => {
      try {
        const response = await fetch(`/api/availabilities/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updateData),
        })

        const result = await response.json()

        if (result.success) {
          setAvailabilities((prev) =>
            prev.map((availability) =>
              availability.id === id ? result.data : availability
            )
          )
          return { success: true, data: result.data }
        } else {
          return {
            success: false,
            error: result.error,
            details: result.details,
          }
        }
      } catch (error) {
        console.error('Error updating availability:', error)
        return { success: false, error: 'Server connection error' }
      }
    },
    []
  )

  const deleteAvailability = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/availabilities/${id}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (result.success) {
        setAvailabilities((prev) =>
          prev.filter((availability) => availability.id !== id)
        )
        return { success: true }
      } else {
        return { success: false, error: result.error }
      }
    } catch (error) {
      console.error('Error deleting availability:', error)
      return { success: false, error: 'Server connection error' }
    }
  }, [])

  const getAvailabilitiesByEmployee = useCallback(
    (employeeId: string) => {
      return availabilities.filter((av) => av.employeeId === employeeId && av.isActive)
    },
    [availabilities]
  )

  const getAvailabilitiesByDay = useCallback(
    (dayOfWeek: number) => {
      return availabilities.filter((av) => av.dayOfWeek === dayOfWeek && av.isActive)
    },
    [availabilities]
  )

  return {
    availabilities,
    isLoading,
    error,
    refreshAvailabilities: fetchAvailabilities,
    createAvailability,
    updateAvailability,
    deleteAvailability,
    getAvailabilitiesByEmployee,
    getAvailabilitiesByDay,
  }
}
