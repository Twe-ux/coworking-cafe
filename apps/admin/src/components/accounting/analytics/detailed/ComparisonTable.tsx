'use client';

import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface ComparisonTableProps {
  data: ComparisonRow[];
  columns: {
    period: string;
    current: string;
    previous: string;
  };
}

interface ComparisonRow {
  period: string;
  label?: string;
  date?: string;
  current: number;
  previous: number;
  evolution: {
    amount: number;
    percentage: number;
    trend: 'up' | 'down' | 'stable';
  };
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(value);
}

function getEvolutionColor(trend: 'up' | 'down' | 'stable'): string {
  if (trend === 'up') return 'text-green-700';
  if (trend === 'down') return 'text-red-700';
  return 'text-gray-700';
}

function getTrendIcon(trend: 'up' | 'down' | 'stable', percentage: number) {
  if (percentage > 5) return <TrendingUp className="h-5 w-5 text-green-600" />;
  if (percentage < -5) return <TrendingDown className="h-5 w-5 text-red-600" />;
  return <Minus className="h-5 w-5 text-gray-600" />;
}

export function ComparisonTable({ data, columns }: ComparisonTableProps) {
  const totalCurrent = data.reduce((sum, row) => sum + row.current, 0);
  const totalPrevious = data.reduce((sum, row) => sum + row.previous, 0);
  const totalEvolutionAmount = totalCurrent - totalPrevious;
  const totalEvolutionPercentage =
    totalPrevious > 0 ? ((totalEvolutionAmount / totalPrevious) * 100) : 0;

  const totalTrend: 'up' | 'down' | 'stable' =
    totalEvolutionPercentage > 5 ? 'up' :
    totalEvolutionPercentage < -5 ? 'down' : 'stable';

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{columns.period}</TableHead>
            <TableHead className="text-right">{columns.current}</TableHead>
            <TableHead className="text-right">{columns.previous}</TableHead>
            <TableHead className="text-right">Évolution €</TableHead>
            <TableHead className="text-right">Évolution %</TableHead>
            <TableHead className="text-center">Trend</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {data.map((row, idx) => (
            <TableRow key={idx}>
              <TableCell className="font-medium">{row.period}</TableCell>
              <TableCell className="text-right">
                {formatCurrency(row.current)}
              </TableCell>
              <TableCell className="text-right">
                {formatCurrency(row.previous)}
              </TableCell>

              <TableCell
                className={`text-right font-semibold ${getEvolutionColor(row.evolution.trend)}`}
              >
                {row.evolution.amount > 0 ? '+' : ''}
                {formatCurrency(row.evolution.amount)}
              </TableCell>

              <TableCell
                className={`text-right font-semibold ${getEvolutionColor(row.evolution.trend)}`}
              >
                {row.evolution.percentage > 0 ? '+' : ''}
                {row.evolution.percentage.toFixed(1)}%
              </TableCell>

              <TableCell className="text-center">
                {getTrendIcon(row.evolution.trend, row.evolution.percentage)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>

        <TableFooter>
          <TableRow>
            <TableCell className="font-bold">TOTAL</TableCell>
            <TableCell className="text-right font-bold">
              {formatCurrency(totalCurrent)}
            </TableCell>
            <TableCell className="text-right font-bold">
              {formatCurrency(totalPrevious)}
            </TableCell>
            <TableCell
              className={`text-right font-bold ${getEvolutionColor(totalTrend)}`}
            >
              {totalEvolutionAmount > 0 ? '+' : ''}
              {formatCurrency(totalEvolutionAmount)}
            </TableCell>
            <TableCell
              className={`text-right font-bold ${getEvolutionColor(totalTrend)}`}
            >
              {totalEvolutionPercentage > 0 ? '+' : ''}
              {totalEvolutionPercentage.toFixed(1)}%
            </TableCell>
            <TableCell></TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
}
