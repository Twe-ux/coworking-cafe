'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Shift, CreateShiftInput, UpdateShiftInput, UseShiftsOptions } from '@/types/shift'

// Re-export types for convenience
export type { Shift, CreateShiftInput, UpdateShiftInput } from '@/types/shift'

/**
 * Helper to format date to YYYY-MM-DD in local timezone
 */
const formatDateToLocalString = (date: Date | string): string => {
  if (typeof date === 'string') {
    return date.split('T')[0]
  }
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Query key factory for shifts
 */
const shiftsKeys = {
  all: ['shifts'] as const,
  lists: () => [...shiftsKeys.all, 'list'] as const,
  list: (filters: UseShiftsOptions) => [...shiftsKeys.lists(), filters] as const,
}

/**
 * Fetch shifts from API
 */
async function fetchShifts(options: UseShiftsOptions = {}): Promise<Shift[]> {
  const params = new URLSearchParams()
  if (options.employeeId) params.append('employeeId', options.employeeId)
  if (options.startDate) params.append('startDate', options.startDate)
  if (options.endDate) params.append('endDate', options.endDate)
  if (options.type) params.append('type', options.type)
  if (options.active !== undefined) params.append('active', String(options.active))

  const response = await fetch(`/api/shifts?${params.toString()}`)
  const result = await response.json()

  if (!result.success) {
    throw new Error(result.error || 'Error fetching shifts')
  }

  // Normalize dates to strings
  return result.data.map((shift: any) => ({
    ...shift,
    date: formatDateToLocalString(shift.date),
  }))
}

/**
 * Custom hook for managing shifts with React Query
 * Provides automatic caching, refetching, and optimistic updates
 */
export function useShiftsQuery(options: UseShiftsOptions = {}) {
  const queryClient = useQueryClient()

  // Query for fetching shifts
  // Uses global config: 5min in dev, 24h in prod
  const {
    data: shifts = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: shiftsKeys.list(options),
    queryFn: () => fetchShifts(options),
    // No staleTime override - uses global config (5min dev / 24h prod)
  })

  // Mutation for creating a shift
  const createShiftMutation = useMutation({
    mutationFn: async (shiftData: CreateShiftInput) => {
      const response = await fetch('/api/shifts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...shiftData,
          date: formatDateToLocalString(shiftData.date),
        }),
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Error creating shift')
      }

      return {
        ...result.data,
        date: formatDateToLocalString(result.data.date),
      }
    },
    onSuccess: () => {
      // Invalidate all shift queries to refetch
      queryClient.invalidateQueries({ queryKey: shiftsKeys.lists() })
    },
  })

  // Mutation for updating a shift
  const updateShiftMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateShiftInput }) => {
      const response = await fetch(`/api/shifts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          date: data.date ? formatDateToLocalString(data.date) : undefined,
        }),
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Error updating shift')
      }

      return {
        ...result.data,
        date: formatDateToLocalString(result.data.date),
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: shiftsKeys.lists() })
    },
  })

  // Mutation for deleting a shift
  const deleteShiftMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/shifts/${id}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Error deleting shift')
      }

      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: shiftsKeys.lists() })
    },
  })

  // Helper functions with mutation wrappers
  const createShift = async (shiftData: CreateShiftInput) => {
    try {
      const data = await createShiftMutation.mutateAsync(shiftData)
      return { success: true, data }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  const updateShift = async (id: string, updateData: UpdateShiftInput) => {
    try {
      const data = await updateShiftMutation.mutateAsync({ id, data: updateData })
      return { success: true, data }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  const deleteShift = async (id: string) => {
    try {
      await deleteShiftMutation.mutateAsync(id)
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  // Helper functions for filtering shifts
  const getShiftById = (id: string) => {
    return shifts.find((shift) => shift.id === id)
  }

  const getShiftsByDate = (date: Date | string) => {
    const dateStr = formatDateToLocalString(date)
    return shifts.filter(
      (shift) => shift.isActive && formatDateToLocalString(shift.date) === dateStr
    )
  }

  const getShiftsByEmployee = (employeeId: string) => {
    return shifts.filter((shift) => shift.isActive && shift.employeeId === employeeId)
  }

  const getShiftsByDateRange = (startDate: Date | string, endDate: Date | string) => {
    const startStr = formatDateToLocalString(startDate)
    const endStr = formatDateToLocalString(endDate)
    return shifts.filter((shift) => {
      if (!shift.isActive) return false
      const shiftDateStr = formatDateToLocalString(shift.date)
      return shiftDateStr >= startStr && shiftDateStr <= endStr
    })
  }

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
    error: error ? String(error) : null,
    refreshShifts: refetch,
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
