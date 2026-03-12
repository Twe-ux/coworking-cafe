'use client';

import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useMonthlyComparison } from '@/hooks/useMonthlyComparison';
import { SummaryCards } from './SummaryCards';
import { ComparisonTable } from './ComparisonTable';

interface MonthlyTableProps {
  year: number;
  month: number;
  previousYear: number;
  mode: 'ht' | 'ttc';
  onMonthChange: (month: number) => void;
}

const MONTHS = [
  { value: 1, label: 'Janvier' },
  { value: 2, label: 'Février' },
  { value: 3, label: 'Mars' },
  { value: 4, label: 'Avril' },
  { value: 5, label: 'Mai' },
  { value: 6, label: 'Juin' },
  { value: 7, label: 'Juillet' },
  { value: 8, label: 'Août' },
  { value: 9, label: 'Septembre' },
  { value: 10, label: 'Octobre' },
  { value: 11, label: 'Novembre' },
  { value: 12, label: 'Décembre' },
];

export function MonthlyTable({
  year,
  month,
  previousYear,
  mode,
  onMonthChange,
}: MonthlyTableProps) {
  const { data, isLoading, isError, error } = useMonthlyComparison(
    year,
    month,
    previousYear,
    mode
  );

  const selectedMonthLabel =
    MONTHS.find((m) => m.value === month)?.label || 'Mars';

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-end mb-4">
          <Skeleton className="h-10 w-[180px]" />
        </div>
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
      <div className="flex justify-end">
        <Select
          value={month.toString()}
          onValueChange={(value) => onMonthChange(Number(value))}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {MONTHS.map((m) => (
              <SelectItem key={m.value} value={m.value.toString()}>
                {m.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <SummaryCards summary={data.summary} periodLabel="jour" />
      <ComparisonTable
        data={data.rows}
        columns={{
          period: 'Date',
          current: `${selectedMonthLabel} ${year}`,
          previous: `${selectedMonthLabel} ${previousYear}`,
        }}
      />
    </div>
  );
}
