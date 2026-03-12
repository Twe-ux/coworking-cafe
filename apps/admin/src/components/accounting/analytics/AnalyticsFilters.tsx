import { Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import type { AnalyticsFilters as Filters } from '@/hooks/useAnalyticsData';

interface AnalyticsFiltersProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
}

export function AnalyticsFilters({ filters, onChange }: AnalyticsFiltersProps) {
  const handlePeriodChange = (period: Filters['period']) => {
    onChange({
      ...filters,
      period,
      startDate: undefined,
      endDate: undefined,
    });
  };

  const handleComparisonChange = (value: string) => {
    onChange({
      ...filters,
      compareWith: value === 'none' ? undefined : (value as Filters['compareWith']),
    });
  };

  const handleModeToggle = () => {
    onChange({
      ...filters,
      mode: filters.mode === 'ht' ? 'ttc' : 'ht',
    });
  };

  const handleDateChange = (field: 'startDate' | 'endDate', value: string) => {
    onChange({
      ...filters,
      [field]: value,
    });
  };

  const handleReset = () => {
    onChange({
      period: 'month',
      compareWith: 'previous',
      mode: 'ttc',
    });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px]">
          <Label htmlFor="period">Période</Label>
          <Select value={filters.period} onValueChange={handlePeriodChange}>
            <SelectTrigger id="period">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Aujourd&apos;hui</SelectItem>
              <SelectItem value="week">Cette semaine</SelectItem>
              <SelectItem value="month">Ce mois</SelectItem>
              <SelectItem value="year">Cette année</SelectItem>
              <SelectItem value="custom">Personnalisé</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {filters.period === 'custom' && (
          <>
            <div className="flex-1 min-w-[200px]">
              <Label htmlFor="startDate">Date de début</Label>
              <div className="relative">
                <Input
                  id="startDate"
                  type="date"
                  value={filters.startDate || ''}
                  onChange={(e) => handleDateChange('startDate', e.target.value)}
                  className="pl-10"
                />
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              </div>
            </div>

            <div className="flex-1 min-w-[200px]">
              <Label htmlFor="endDate">Date de fin</Label>
              <div className="relative">
                <Input
                  id="endDate"
                  type="date"
                  value={filters.endDate || ''}
                  onChange={(e) => handleDateChange('endDate', e.target.value)}
                  className="pl-10"
                />
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              </div>
            </div>
          </>
        )}

        <div className="flex-1 min-w-[200px]">
          <Label htmlFor="comparison">Comparaison</Label>
          <Select
            value={filters.compareWith || 'none'}
            onValueChange={handleComparisonChange}
          >
            <SelectTrigger id="comparison">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Aucune</SelectItem>
              <SelectItem value="previous">vs Période précédente</SelectItem>
              <SelectItem value="year-ago">vs Année passée</SelectItem>
              <SelectItem value="month-year-ago">vs Mois année passée</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1 min-w-[200px]">
          <Label htmlFor="mode">Mode d&apos;affichage</Label>
          <Button
            id="mode"
            variant="outline"
            onClick={handleModeToggle}
            className="w-full justify-center"
          >
            {filters.mode === 'ht' ? 'HT (Hors Taxes)' : 'TTC (Toutes Taxes)'}
          </Button>
        </div>

        <div className="flex items-end">
          <Button variant="ghost" onClick={handleReset}>
            Réinitialiser
          </Button>
        </div>
      </div>
    </div>
  );
}
