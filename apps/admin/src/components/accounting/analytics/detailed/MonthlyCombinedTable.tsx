"use client";

import { useMonthlyCombined } from "@/hooks/useCombinedBreakdown";
import { CombinedBreakdownTable } from "./CombinedBreakdownTable";
import { Skeleton } from "@/components/ui/skeleton";

interface MonthlyCombinedTableProps {
  year: number;
  month: number;
  previousYear: number;
  mode: "ht" | "ttc";
}

export function MonthlyCombinedTable({
  year,
  month,
  previousYear,
  mode,
}: MonthlyCombinedTableProps) {
  const { data, isLoading, error } = useMonthlyCombined(
    year,
    month,
    previousYear,
    mode,
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 p-4">
        Erreur lors du chargement des données
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center text-muted-foreground p-4">
        Aucune donnée disponible
      </div>
    );
  }

  return (
    <CombinedBreakdownTable
      data={data}
      periodLabel="Jour"
      currentYear={year}
      previousYear={previousYear}
    />
  );
}
