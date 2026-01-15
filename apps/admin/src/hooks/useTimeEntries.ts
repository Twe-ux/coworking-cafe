import { useState, useEffect, useCallback } from 'react'
import type { TimeEntry, TimeEntryFilter, ApiResponse } from '@/types/timeEntry'

interface UseTimeEntriesOptions {
  employeeId?: string
  startDate?: string
  endDate?: string
  status?: 'active' | 'completed'
  autoFetch?: boolean
}

export function useTimeEntries(options: UseTimeEntriesOptions = {}) {
  const { employeeId, startDate, endDate, status, autoFetch = true } = options

  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchTimeEntries = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const params = new URLSearchParams()
      if (employeeId) params.append('employeeId', employeeId)
      if (startDate) params.append('startDate', startDate)
      if (endDate) params.append('endDate', endDate)
      if (status) params.append('status', status)

      const response = await fetch(`/api/time-entries?${params.toString()}`)
      const data: ApiResponse<TimeEntry[]> = await response.json()

      if (data.success && data.data) {
        setTimeEntries(data.data)
      } else {
        setError(data.error || 'Erreur lors de la récupération des pointages')
      }
    } catch (err) {
      setError('Erreur de connexion')
      console.error('Error fetching time entries:', err)
    } finally {
      setIsLoading(false)
    }
  }, [employeeId, startDate, endDate, status])

  useEffect(() => {
    if (autoFetch) {
      fetchTimeEntries()
    }
  }, [fetchTimeEntries, autoFetch])

  const refreshTimeEntries = useCallback(() => {
    return fetchTimeEntries()
  }, [fetchTimeEntries])

  return {
    timeEntries,
    isLoading,
    error,
    refreshTimeEntries,
  }
}
