'use client';

import { useMonthlyBreakdown } from '@/hooks/useRevenueBreakdown';
import { RevenueBreakdownTable } from './RevenueBreakdownTable';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface MonthlyBreakdownTableProps {
  year: number;
  month: number;
  mode: 'ht' | 'ttc';
  onMonthChange: (month: number) => void;
}

export function MonthlyBreakdownTable({
  year,
  month,
  mode,
  onMonthChange,
}: MonthlyBreakdownTableProps) {
  const { data, isLoading, error } = useMonthlyBreakdown(year, month, mode);

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
    <div className="space-y-4">
      <div className="flex justify-end">
        <div className="w-48">
          <Label htmlFor="month-select">Mois</Label>
          <Select value={month.toString()} onValueChange={(val) => onMonthChange(parseInt(val))}>
            <SelectTrigger id="month-select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 12 }, (_, i) => (
                <SelectItem key={i + 1} value={(i + 1).toString()}>
                  {new Date(2000, i).toLocaleDateString('fr-FR', { month: 'long' })}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <RevenueBreakdownTable data={data} periodLabel="Jour" />
    </div>
  );
}
