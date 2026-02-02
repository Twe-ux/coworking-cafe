import { useState, useEffect } from "react";
import type {
  PeriodFilter,
  PeriodStats,
  ComparisonStats,
  ComparisonEvolution,
  ConsolidatedDailyRevenue,
} from "@/types/accounting";

interface ConsolidatedRangeResponse {
  dailyData: ConsolidatedDailyRevenue[];
  stats: {
    turnovers: { ht: number; ttc: number; tva: number };
    b2b: { ht: number; ttc: number; tva: number };
    total: { ht: number; ttc: number; tva: number };
    dailyAverage: { ht: number; ttc: number };
    daysCount: number;
  };
}

interface UseComparisonStatsReturn {
  data: ComparisonStats | null;
  loading: boolean;
  error: string | null;
}

/**
 * Hook pour comparer les CA entre deux périodes
 * Fetch les données consolidées pour chaque période et calcule les évolutions
 */
export function useComparisonStats(
  period1: PeriodFilter | null,
  period2: PeriodFilter | null
): UseComparisonStatsReturn {
  const [data, setData] = useState<ComparisonStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Si l'une des périodes est null, ne rien faire
    if (!period1 || !period2) {
      setData(null);
      setLoading(false);
      setError(null);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch les deux périodes en parallèle
        const [response1, response2] = await Promise.all([
          fetch(
            `/api/accounting/consolidated-range?startDate=${period1.startDate}&endDate=${period1.endDate}`
          ),
          fetch(
            `/api/accounting/consolidated-range?startDate=${period2.startDate}&endDate=${period2.endDate}`
          ),
        ]);

        if (!response1.ok || !response2.ok) {
          throw new Error("Erreur lors de la récupération des données");
        }

        const result1: { success: boolean; data: ConsolidatedRangeResponse } =
          await response1.json();
        const result2: { success: boolean; data: ConsolidatedRangeResponse } =
          await response2.json();

        if (!result1.success || !result2.success) {
          throw new Error("Erreur dans la réponse API");
        }

        // Construire PeriodStats pour chaque période
        const periodStats1: PeriodStats = {
          period: period1,
          turnovers: result1.data.stats.turnovers,
          b2b: result1.data.stats.b2b,
          total: result1.data.stats.total,
          dailyAverage: result1.data.stats.dailyAverage,
          daysCount: result1.data.stats.daysCount,
        };

        const periodStats2: PeriodStats = {
          period: period2,
          turnovers: result2.data.stats.turnovers,
          b2b: result2.data.stats.b2b,
          total: result2.data.stats.total,
          dailyAverage: result2.data.stats.dailyAverage,
          daysCount: result2.data.stats.daysCount,
        };

        // Calculer les évolutions
        const evolutionHT = calculateEvolution(
          periodStats1.total.ht,
          periodStats2.total.ht
        );
        const evolutionTTC = calculateEvolution(
          periodStats1.total.ttc,
          periodStats2.total.ttc
        );

        // Construire ComparisonStats
        const comparisonStats: ComparisonStats = {
          period1: periodStats1,
          period2: periodStats2,
          evolution: {
            ht: evolutionHT,
            ttc: evolutionTTC,
          },
          dailyData: {
            period1: result1.data.dailyData,
            period2: result2.data.dailyData,
          },
        };

        setData(comparisonStats);
      } catch (err) {
        console.error("useComparisonStats error:", err);
        setError(
          err instanceof Error ? err.message : "Erreur lors du chargement des données"
        );
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [
    period1?.startDate,
    period1?.endDate,
    period1?.label,
    period2?.startDate,
    period2?.endDate,
    period2?.label,
  ]);

  return { data, loading, error };
}

/**
 * Calcule l'évolution entre deux valeurs (montant et pourcentage)
 */
function calculateEvolution(current: number, previous: number): ComparisonEvolution {
  const amount = current - previous;
  const percent = previous === 0 ? 0 : (amount / previous) * 100;

  return {
    amount: parseFloat(amount.toFixed(2)),
    percent: parseFloat(percent.toFixed(1)),
  };
}
