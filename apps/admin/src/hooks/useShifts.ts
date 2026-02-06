'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Shift, CreateShiftInput, UpdateShiftInput, UseShiftsOptions } from '@/types/shift'

// Re-export types for convenience
export type { Shift, CreateShiftInput, UpdateShiftInput } from '@/types/shift'

/**
 * Helper to format date to YYYY-MM-DD in local timezone
 * Avoids timezone conversion issues with toISOString()
 */
const formatDateToLocalString = (date: Date | string): string => {
  if (typeof date === 'string') {
    // Extract YYYY-MM-DD from ISO string or return as-is
    return date.split('T')[0]
  }
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Custom hook for managing shifts
 * Provides CRUD operations and filtering capabilities
 */
export function useShifts(options: UseShiftsOptions = {}) {
  const [shifts, setShifts] = useState<Shift[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Manual refresh function (without AbortController, for user-triggered refreshes)
  const fetchShifts = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Build query parameters
      const params = new URLSearchParams()
      if (options.employeeId) params.append('employeeId', options.employeeId)
      if (options.startDate) params.append('startDate', options.startDate)
      if (options.endDate) params.append('endDate', options.endDate)
      if (options.type) params.append('type', options.type)
      if (options.active !== undefined)
        params.append('active', String(options.active))

      const response = await fetch(`/api/shifts?${params.toString()}`)
      const result = await response.json()

      if (result.success) {
        const shiftsWithNormalizedDates = result.data.map((shift: Shift) => ({
          ...shift,
          date: formatDateToLocalString(shift.date),
        }))
        setShifts(shiftsWithNormalizedDates)
        setError(null)
      } else {
        setError(result.error || 'Error fetching shifts')
        setShifts([])
      }
    } catch (err) {
      console.error('Error useShifts:', err)
      setError('Server connection error')
      setShifts([])
    } finally {
      setIsLoading(false)
    }
  }, [
    options.employeeId,
    options.startDate,
    options.endDate,
    options.type,
    options.active,
  ])

  useEffect(() => {
    // AbortController to cancel previous requests
    const abortController = new AbortController()

    // Create a version of fetchShifts that can be aborted
    const fetchWithAbort = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Build query parameters
        const params = new URLSearchParams()
        if (options.employeeId) params.append('employeeId', options.employeeId)
        if (options.startDate) params.append('startDate', options.startDate)
        if (options.endDate) params.append('endDate', options.endDate)
        if (options.type) params.append('type', options.type)
        if (options.active !== undefined)
          params.append('active', String(options.active))

        console.log('🔵 [useShifts] Fetching shifts:', {
          startDate: options.startDate,
          endDate: options.endDate,
        })

        const response = await fetch(`/api/shifts?${params.toString()}`, {
          signal: abortController.signal, // Pass abort signal
        })

        // If aborted, don't process the result
        if (abortController.signal.aborted) {
          return
        }

        const result = await response.json()

        if (result.success) {
          // Keep dates as strings (YYYY-MM-DD) to avoid timezone issues
          const shiftsWithNormalizedDates = result.data.map((shift: any) => ({
            ...shift,
            date: formatDateToLocalString(shift.date),
          }))

          // Always update shifts - React will handle re-render optimization
          setShifts(shiftsWithNormalizedDates)
          setError(null)
        } else {
          setError(result.error || 'Error fetching shifts')
          setShifts([])
        }
      } catch (err: unknown) {
        // Don't log error if request was aborted
        if (err instanceof Error && err.name === 'AbortError') {
          return
        }
        console.error('Error useShifts:', err)
        setError('Server connection error')
        setShifts([])
      } finally {
        if (!abortController.signal.aborted) {
          setIsLoading(false)
        }
      }
    }

    fetchWithAbort()

    // Cleanup: abort request when component unmounts or dependencies change
    return () => {
      abortController.abort()
    }
  }, [
    options.employeeId,
    options.startDate,
    options.endDate,
    options.type,
    options.active,
  ])

  const createShift = useCallback(async (shiftData: CreateShiftInput) => {
    try {
      const response = await fetch('/api/shifts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...shiftData,
          date: formatDateToLocalString(shiftData.date),
        }),
      })

      const result = await response.json()

      if (result.success) {
        const newShift = {
          ...result.data,
          date: formatDateToLocalString(result.data.date),
        }
        setShifts((prev) => [...prev, newShift])
        return { success: true, data: newShift }
      } else {
        return {
          success: false,
          error: result.error,
          details: result.details,
        }
      }
    } catch (error) {
      console.error('Error creating shift:', error)
      return { success: false, error: 'Server connection error' }
    }
  }, [])

  const updateShift = useCallback(async (id: string, updateData: UpdateShiftInput) => {
    try {
      const response = await fetch(`/api/shifts/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...updateData,
          date: updateData.date ? formatDateToLocalString(updateData.date) : undefined,
        }),
      })

      const result = await response.json()

      if (result.success) {
        const updatedShift = {
          ...result.data,
          date: formatDateToLocalString(result.data.date),
        }
        setShifts((prev) =>
          prev.map((shift) => (shift.id === id ? updatedShift : shift))
        )
        return { success: true, data: updatedShift }
      } else {
        return {
          success: false,
          error: result.error,
          details: result.details,
        }
      }
    } catch (error) {
      console.error('Error updating shift:', error)
      return { success: false, error: 'Server connection error' }
    }
  }, [])

  const deleteShift = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/shifts/${id}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (result.success) {
        setShifts((prev) => prev.filter((shift) => shift.id !== id))
        return { success: true }
      } else {
        return { success: false, error: result.error }
      }
    } catch (error) {
      console.error('Error deleting shift:', error)
      return { success: false, error: 'Server connection error' }
    }
  }, [])

  const getShiftById = useCallback(
    (id: string) => {
      return shifts.find((shift) => shift.id === id)
    },
    [shifts]
  )

  const getShiftsByDate = useCallback(
    (date: Date | string) => {
      const dateStr = formatDateToLocalString(date)
      return shifts.filter(
        (shift) => shift.isActive && formatDateToLocalString(shift.date) === dateStr
      )
    },
    [shifts]
  )

  const getShiftsByEmployee = useCallback(
    (employeeId: string) => {
      return shifts.filter(
        (shift) => shift.isActive && shift.employeeId === employeeId
      )
    },
    [shifts]
  )

  const getShiftsByDateRange = useCallback(
    (startDate: Date | string, endDate: Date | string) => {
      const startStr = formatDateToLocalString(startDate)
      const endStr = formatDateToLocalString(endDate)
      return shifts.filter((shift) => {
        if (!shift.isActive) return false
        const shiftDateStr = formatDateToLocalString(shift.date)
        return shiftDateStr >= startStr && shiftDateStr <= endStr
      })
    },
    [shifts]
  )

  // Statistics
  const statistics = {
    total: shifts.length,
    active: shifts.filter((shift) => shift.isActive).length,
    inactive: shifts.filter((shift) => !shift.isActive).length,
    byType: shifts.reduce(
      (acc, shift) => {
        if (shift.isActive) {
          acc[shift.type] = (acc[shift.type] || 0) + 1
        }
        return acc
      },
      {} as Record<string, number>
    ),
    totalHours: shifts.reduce((total, shift) => {
      if (!shift.isActive) return total

      const start = new Date(`2000-01-01 ${shift.startTime}`)
      let end = new Date(`2000-01-01 ${shift.endTime}`)

      if (end <= start) {
        end.setDate(end.getDate() + 1)
      }

      const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60)
      return total + hours
    }, 0),
  }

  return {
    shifts,
    isLoading,
    error,
    refreshShifts: fetchShifts,
    createShift,
    updateShift,
    deleteShift,
    getShiftById,
    getShiftsByDate,
    getShiftsByEmployee,
    getShiftsByDateRange,
    statistics,
  }
}
