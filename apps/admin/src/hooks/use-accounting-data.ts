import { useState, useEffect, useCallback } from 'react'
import type { CashEntry } from '@/types/accounting'
import { accountingApi } from '@/lib/api/accounting'

export function useAccountingData() {
  const [dataCash, setDataCash] = useState<CashEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await accountingApi.cashEntries.list()
      setDataCash(data)
    } catch (err) {
      console.error('Error fetching cash entries:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch data')
      setDataCash([])
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
    dataCash,
    isLoading,
    error,
    refetch,
    invalidate,
  }
}
