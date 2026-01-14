import { useState, useEffect } from 'react'
import type { TurnoverData } from '@/types/accounting'

// Données mockées
const MOCK_TURNOVER_DATA: TurnoverData[] = [
  { date: '2025/01/01', TVA: 20 },
  { date: '2025/01/02', TVA: 20 },
  { date: '2025/01/03', TVA: 20 },
]

export function useAccountingChartData() {
  const [data, setData] = useState<TurnoverData[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simuler un chargement
    setTimeout(() => {
      setData(MOCK_TURNOVER_DATA)
      setIsLoading(false)
    }, 500)
  }, [])

  return {
    data,
    isLoading,
  }
}
