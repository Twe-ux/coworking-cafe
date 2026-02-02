"use client";

import { useState } from "react";
import { useComparisonStats } from "@/hooks/useComparisonStats";
import { PeriodSelector } from "@/components/accounting/stats/PeriodSelector";
import { ComparisonStatsCards } from "@/components/accounting/stats/ComparisonStatsCards";
import { ComparisonChart } from "@/components/accounting/stats/ComparisonChart";
import { ComparisonTable } from "@/components/accounting/stats/ComparisonTable";
import { StatsPageSkeleton } from "./StatsPageSkeleton";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import type { PeriodFilter } from "@/types/accounting";

export function StatsPageClient() {
  // Initialiser avec des périodes par défaut (ce mois vs mois dernier)
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth(); // 0-indexed

  const [period1, setPeriod1] = useState<PeriodFilter>({
    startDate: new Date(currentYear, currentMonth, 1).toISOString().slice(0, 10),
    endDate: new Date(currentYear, currentMonth + 1, 0).toISOString().slice(0, 10),
    label: getMonthLabel(currentYear, currentMonth),
  });

  const [period2, setPeriod2] = useState<PeriodFilter>({
    startDate: new Date(currentYear, currentMonth - 1, 1).toISOString().slice(0, 10),
    endDate: new Date(currentYear, currentMonth, 0).toISOString().slice(0, 10),
    label: getMonthLabel(currentYear, currentMonth - 1),
  });

  const [showTTC, setShowTTC] = useState(true); // true = TTC, false = HT

  // Fetch comparison data
  const { data, loading, error } = useComparisonStats(period1, period2);

  // Loading
  if (loading) {
    return <StatsPageSkeleton />;
  }

  // Error
  if (error) {
    return (
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-3xl font-bold">Statistiques Comparatives</h1>
          <p className="text-muted-foreground mt-2">
            Comparer le CA consolidé entre deux périodes
          </p>
        </div>
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-red-800 font-semibold">Erreur</p>
          <p className="text-red-600 text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Statistiques Comparatives</h1>
        <p className="text-muted-foreground mt-2">
          Comparer le CA consolidé (Caisse + B2B) entre deux périodes
        </p>
      </div>

      {/* Period Selector */}
      <PeriodSelector
        period1={period1}
        period2={period2}
        onPeriod1Change={setPeriod1}
        onPeriod2Change={setPeriod2}
      />

      {/* HT/TTC Switch */}
      {data && (
        <>
          <div className="flex items-center justify-end gap-2">
            <Label htmlFor="stats-ttc-switch" className="font-semibold">
              Affichage :
            </Label>
            <span
              className={!showTTC ? "font-medium text-primary" : "text-muted-foreground"}
            >
              HT
            </span>
            <Switch
              id="stats-ttc-switch"
              checked={showTTC}
              onCheckedChange={setShowTTC}
            />
            <span
              className={showTTC ? "font-medium text-primary" : "text-muted-foreground"}
            >
              TTC
            </span>
          </div>

          {/* Stats Cards */}
          <ComparisonStatsCards data={data} showTTC={showTTC} />

          {/* Chart */}
          <ComparisonChart data={data} showTTC={showTTC} />

          {/* Table */}
          <ComparisonTable data={data} showTTC={showTTC} />
        </>
      )}

      {/* No data message */}
      {!data && !loading && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
          <p className="text-gray-600">
            Sélectionnez deux périodes pour afficher la comparaison
          </p>
        </div>
      )}
    </div>
  );
}

// Helper
function getMonthLabel(year: number, month: number): string {
  const months = [
    "Janvier",
    "Février",
    "Mars",
    "Avril",
    "Mai",
    "Juin",
    "Juillet",
    "Août",
    "Septembre",
    "Octobre",
    "Novembre",
    "Décembre",
  ];

  // Gérer les mois négatifs (année précédente)
  if (month < 0) {
    return getMonthLabel(year - 1, 12 + month);
  }

  return `${months[month]} ${year}`;
}
