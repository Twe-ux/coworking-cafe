'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { useYearlyComparison } from '@/hooks/useYearlyComparison';
import { SummaryCards } from './SummaryCards';
import { ComparisonTable } from './ComparisonTable';

interface YearlyTableProps {
  currentYear: number;
  previousYear: number;
  mode: 'ht' | 'ttc';
}

export function YearlyTable({
  currentYear,
  previousYear,
  mode,
}: YearlyTableProps) {
  const { data, isLoading, isError, error } = useYearlyComparison(
    currentYear,
    previousYear,
    mode
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 rounded-lg" />
          ))}
        </div>
        <Skeleton className="h-[600px] rounded-lg" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-800 font-semibold">
          Erreur lors du chargement des données
        </p>
        <p className="text-red-600 text-sm mt-2">
          {error instanceof Error ? error.message : 'Une erreur est survenue'}
        </p>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      <SummaryCards summary={data.summary} periodLabel="mois" />
      <ComparisonTable
        data={data.rows}
        columns={{
          period: 'Mois',
          current: `CA ${currentYear}`,
          previous: `CA ${previousYear}`,
        }}
      />
    </div>
  );
}
