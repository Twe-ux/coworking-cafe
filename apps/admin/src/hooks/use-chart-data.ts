"use client"

import { useEffect, useState, useCallback } from "react"
import type { Turnover } from "@/types/accounting"

export type TurnoverData = Turnover & {
  date: string
  HT: number
  TTC: number
  TVA?: number
  "ca-ttc"?: { [key: string]: number }
  "ca-ht"?: { [key: string]: number }
  "ca-tva"?: { [key: string]: number }
}

export function useChartData() {
  const [data, setData] = useState<TurnoverData[] | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch("/api/accounting/turnovers")

      if (!response.ok) {
        console.warn(`API turnover returned ${response.status}, using empty data`)
        setData([])
        return
      }

      const result = await response.json()

      if (!result.success || !Array.isArray(result.data)) {
        console.warn('Invalid turnover API response format, using empty data')
        setData([])
        return
      }

      // Transformer les données Turnover en TurnoverData avec calculs
      const transformedData = result.data.map((item: Turnover) => {
        // Calculer les totaux HT, TTC, TVA
        const vat20HT = item["vat-20"]?.["total-ht"] ?? 0
        const vat20TTC = item["vat-20"]?.["total-ttc"] ?? 0
        const vat20Taxes = item["vat-20"]?.["total-taxes"] ?? 0

        const vat10HT = item["vat-10"]?.["total-ht"] ?? 0
        const vat10TTC = item["vat-10"]?.["total-ttc"] ?? 0
        const vat10Taxes = item["vat-10"]?.["total-taxes"] ?? 0

        const vat55HT = item["vat-55"]?.["total-ht"] ?? 0
        const vat55TTC = item["vat-55"]?.["total-ttc"] ?? 0
        const vat55Taxes = item["vat-55"]?.["total-taxes"] ?? 0

        const vat0HT = item["vat-0"]?.["total-ht"] ?? 0
        const vat0TTC = item["vat-0"]?.["total-ttc"] ?? 0

        const totalHT = vat20HT + vat10HT + vat55HT + vat0HT
        const totalTTC = vat20TTC + vat10TTC + vat55TTC + vat0TTC
        const totalTVA = vat20Taxes + vat10Taxes + vat55Taxes

        return {
          ...item,
          date: item._id, // _id est au format YYYY/MM/DD
          HT: totalHT,
          TTC: totalTTC,
          TVA: totalTVA,
          "ca-ht": {
            "20": vat20HT,
            "10": vat10HT,
            "5.5": vat55HT,
            "0": vat0HT,
          },
          "ca-ttc": {
            "20": vat20TTC,
            "10": vat10TTC,
            "5.5": vat55TTC,
            "0": vat0TTC,
          },
          "ca-tva": {
            "20": vat20Taxes,
            "10": vat10Taxes,
            "5.5": vat55Taxes,
            "0": 0,
          },
        }
      })

      setData(transformedData)
    } catch (err) {
      console.error('Failed to fetch turnover data:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch data')
      setData([])
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

  return {
    data,
    isLoading,
    error,
    refetch,
  }
}
