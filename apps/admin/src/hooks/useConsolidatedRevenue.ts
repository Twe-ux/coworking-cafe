import { useMemo } from "react";
import type { ConsolidatedDailyRevenue, ConsolidatedMonthlyStats } from "@/types/accounting";
import type { B2BRevenueRow } from "@/types/accounting";
import type { TurnoverData } from "./use-chart-data";

interface UseConsolidatedRevenueOptions {
  turnovers: TurnoverData[];
  b2bRevenues: B2BRevenueRow[];
  selectedYear: number;
  selectedMonth: number;
}

interface UseConsolidatedRevenueReturn {
  dailyData: ConsolidatedDailyRevenue[];
  monthlyStats: ConsolidatedMonthlyStats;
  isLoading: boolean;
}

/**
 * Hook pour consolider les données Turnovers + B2B Revenue
 * Fusionne par date et calcule les totaux
 */
export function useConsolidatedRevenue({
  turnovers,
  b2bRevenues,
  selectedYear,
  selectedMonth,
}: UseConsolidatedRevenueOptions): UseConsolidatedRevenueReturn {
  // Consolider les données jour par jour
  const dailyData = useMemo(() => {
    const dataMap = new Map<string, ConsolidatedDailyRevenue>();

    // Ajouter les turnovers
    turnovers.forEach((turnover) => {
      const date = turnover.date;
      const d = new Date(date);

      // Filtrer par année/mois
      if (d.getFullYear() !== selectedYear || d.getMonth() !== selectedMonth) {
        return;
      }

      dataMap.set(date, {
        date,
        turnovers: {
          ht: turnover.HT || 0,
          ttc: turnover.TTC || 0,
          tva: turnover.TVA || 0,
        },
        b2b: {
          ht: 0,
          ttc: 0,
          tva: 0,
        },
        total: {
          ht: turnover.HT || 0,
          ttc: turnover.TTC || 0,
          tva: turnover.TVA || 0,
        },
      });
    });

    // Ajouter les B2B revenues
    b2bRevenues.forEach((b2b) => {
      const date = b2b.date;
      const d = new Date(date);

      // Filtrer par année/mois
      if (d.getFullYear() !== selectedYear || d.getMonth() !== selectedMonth) {
        return;
      }

      const existing = dataMap.get(date);

      if (existing) {
        // Merge avec turnover existant
        existing.b2b = {
          ht: b2b.ht || 0,
          ttc: b2b.ttc || 0,
          tva: b2b.tva || 0,
        };
        existing.total = {
          ht: existing.turnovers.ht + (b2b.ht || 0),
          ttc: existing.turnovers.ttc + (b2b.ttc || 0),
          tva: existing.turnovers.tva + (b2b.tva || 0),
        };
      } else {
        // Créer nouvelle entrée (jour sans turnover)
        dataMap.set(date, {
          date,
          turnovers: {
            ht: 0,
            ttc: 0,
            tva: 0,
          },
          b2b: {
            ht: b2b.ht || 0,
            ttc: b2b.ttc || 0,
            tva: b2b.tva || 0,
          },
          total: {
            ht: b2b.ht || 0,
            ttc: b2b.ttc || 0,
            tva: b2b.tva || 0,
          },
        });
      }
    });

    // Convertir en tableau et trier par date
    return Array.from(dataMap.values()).sort((a, b) =>
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, [turnovers, b2bRevenues, selectedYear, selectedMonth]);

  // Calculer les stats mensuelles
  const monthlyStats = useMemo(() => {
    const stats: ConsolidatedMonthlyStats = {
      month: `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}`,
      turnovers: {
        ht: 0,
        ttc: 0,
        tva: 0,
      },
      b2b: {
        ht: 0,
        ttc: 0,
        tva: 0,
      },
      total: {
        ht: 0,
        ttc: 0,
        tva: 0,
      },
    };

    dailyData.forEach((day) => {
      stats.turnovers.ht += day.turnovers.ht;
      stats.turnovers.ttc += day.turnovers.ttc;
      stats.turnovers.tva += day.turnovers.tva;

      stats.b2b.ht += day.b2b.ht;
      stats.b2b.ttc += day.b2b.ttc;
      stats.b2b.tva += day.b2b.tva;

      stats.total.ht += day.total.ht;
      stats.total.ttc += day.total.ttc;
      stats.total.tva += day.total.tva;
    });

    return stats;
  }, [dailyData, selectedYear, selectedMonth]);

  return {
    dailyData,
    monthlyStats,
    isLoading: false,
  };
}
