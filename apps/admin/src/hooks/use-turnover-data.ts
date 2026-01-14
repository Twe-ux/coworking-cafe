import { useState, useEffect, useCallback } from 'react'
import type { Turnover } from '@/types/accounting'
import { accountingApi } from '@/lib/api/accounting'

export function useTurnoverData() {
  const [dataTurnover, setDataTurnover] = useState<Turnover[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await accountingApi.turnovers.list()
      setDataTurnover(data)
    } catch (err) {
      console.error('Error fetching turnovers:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch data')
      setDataTurnover([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const refetch = useCallback(() => {
    fetchData()
  }, [fetchData])

  const invalidate = useCallback(() => {
    fetchData()
  }, [fetchData])

  return {
    dataTurnover,
    isLoading,
    error,
    refetch,
    invalidate,
  }
}
