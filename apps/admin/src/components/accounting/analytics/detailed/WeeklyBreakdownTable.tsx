'use client';

import { useWeeklyBreakdown } from '@/hooks/useRevenueBreakdown';
import { RevenueBreakdownTable } from './RevenueBreakdownTable';
import { Skeleton } from '@/components/ui/skeleton';

interface WeeklyBreakdownTableProps {
  year: number;
  mode: 'ht' | 'ttc';
}

export function WeeklyBreakdownTable({ year, mode }: WeeklyBreakdownTableProps) {
  const { data, isLoading, error } = useWeeklyBreakdown(year, mode);

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

  return <RevenueBreakdownTable data={data} periodLabel="Semaine" />;
}
