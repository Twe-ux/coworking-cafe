"use client"

import { useQuery } from "@tanstack/react-query"
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

/**
 * Transforme un Turnover en TurnoverData avec calculs
 */
function transformTurnover(item: Turnover): TurnoverData {
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
}

/**
 * Récupère et transforme les turnovers depuis l'API
 */
async function fetchChartData(): Promise<TurnoverData[]> {
  const response = await fetch("/api/accounting/turnovers")

  if (!response.ok) {
    console.warn(`API turnover returned ${response.status}, using empty data`)
    return []
  }

  const result = await response.json()

  if (!result.success || !Array.isArray(result.data)) {
    console.warn("Invalid turnover API response format, using empty data")
    return []
  }

  return result.data.map(transformTurnover)
}

/**
 * Hook pour récupérer les données de chart
 * Utilise React Query pour le cache et la gestion d'état
 *
 * @returns {object} - { data, isLoading, error, refetch }
 */
export function useChartData() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["chart-data"],
    queryFn: fetchChartData,
  })

  return {
    data: data ?? null,
    isLoading,
    error: error ? String(error) : null,
    refetch,
  }
}
