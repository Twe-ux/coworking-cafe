'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface YearSelectorProps {
  currentYear: number;
  previousYear: number;
  onCurrentYearChange: (year: number) => void;
  onPreviousYearChange: (year: number) => void;
}

const YEARS = Array.from({ length: 10 }, (_, i) => 2026 - i);

export function YearSelector({
  currentYear,
  previousYear,
  onCurrentYearChange,
  onPreviousYearChange,
}: YearSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <Select
        value={currentYear.toString()}
        onValueChange={(value) => onCurrentYearChange(Number(value))}
      >
        <SelectTrigger className="w-[100px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {YEARS.map((year) => (
            <SelectItem key={year} value={year.toString()}>
              {year}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <span className="text-sm text-gray-600">vs</span>

      <Select
        value={previousYear.toString()}
        onValueChange={(value) => onPreviousYearChange(Number(value))}
      >
        <SelectTrigger className="w-[100px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {YEARS.map((year) => (
            <SelectItem key={year} value={year.toString()}>
              {year}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
