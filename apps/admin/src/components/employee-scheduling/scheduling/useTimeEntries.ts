'use client'

import { useState, useCallback, useEffect } from 'react'
import type { TimeEntry } from '@/types/timeEntry'

interface TimeEntryAPIResponse {
  id: string
  employeeId: string
  date: string
  clockIn: string
  clockOut?: string | null
  status: 'active' | 'completed'
  shiftNumber: 1 | 2
  totalHours?: number
}

interface UseTimeEntriesProps {
  currentDate: Date
}

interface UseTimeEntriesReturn {
  timeEntries: TimeEntry[]
  fetchTimeEntries: () => Promise<void>
}

/**
 * Hook for fetching and managing time entries
 */
export function useTimeEntries({ currentDate }: UseTimeEntriesProps): UseTimeEntriesReturn {
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([])

  const fetchTimeEntries = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      const startOfMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        1
      )
      const endOfMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        0
      )

      params.append('startDate', startOfMonth.toISOString().split('T')[0])
      params.append('endDate', endOfMonth.toISOString().split('T')[0])

      const response = await fetch(`/api/time-entries?${params.toString()}`)
      const timeEntriesData = await response.json()

      if (timeEntriesData.success) {
        const entries = (timeEntriesData.data || []).map((entry: TimeEntryAPIResponse) => ({
          ...entry,
          date: new Date(entry.date),
          clockIn: new Date(entry.clockIn),
          clockOut: entry.clockOut ? new Date(entry.clockOut) : null,
        }))
        setTimeEntries(entries)
      }
    } catch (error) {
      console.error('Error fetching time entries:', error)
      setTimeEntries([])
    }
  }, [currentDate])

  useEffect(() => {
    fetchTimeEntries()
  }, [fetchTimeEntries])

  return {
    timeEntries,
    fetchTimeEntries,
  }
}
