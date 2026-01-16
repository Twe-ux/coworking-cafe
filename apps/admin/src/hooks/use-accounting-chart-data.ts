import { useState, useEffect } from 'react'
import type { TurnoverData } from '@/types/accounting'

// Données mockées
const MOCK_TURNOVER_DATA: TurnoverData[] = [
  { date: '2025/01/01', HT: 100, TTC: 120, TVA: 20 },
  { date: '2025/01/02', HT: 150, TTC: 180, TVA: 30 },
  { date: '2025/01/03', HT: 200, TTC: 240, TVA: 40 },
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
