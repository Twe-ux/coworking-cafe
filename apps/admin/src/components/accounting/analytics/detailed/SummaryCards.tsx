'use client';

import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface Evolution {
  amount: number;
  percentage: number;
  trend: 'up' | 'down' | 'stable';
}

interface SummaryCardsProps {
  summary: {
    total: { current: number; previous: number; evolution: Evolution };
    average: number;
    best: { period: string; value: number };
    worst: { period: string; value: number };
  };
  periodLabel: string;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(value);
}

function getColor(trend: 'up' | 'down' | 'stable'): string {
  if (trend === 'up') return 'text-green-700';
  if (trend === 'down') return 'text-red-700';
  return 'text-gray-700';
}

function getTrendIcon(trend: 'up' | 'down' | 'stable', percentage: number) {
  if (percentage > 5) return <TrendingUp className="h-4 w-4 text-green-600" />;
  if (percentage < -5) return <TrendingDown className="h-4 w-4 text-red-600" />;
  return <Minus className="h-4 w-4 text-gray-600" />;
}

export function SummaryCards({ summary, periodLabel }: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {/* Card 1 : Total */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">
            Total Période
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(summary.total.current)}
          </div>
          <div className="flex items-center gap-1 mt-1">
            {getTrendIcon(
              summary.total.evolution.trend,
              summary.total.evolution.percentage
            )}
            <span
              className={`text-sm font-semibold ${getColor(summary.total.evolution.trend)}`}
            >
              {summary.total.evolution.percentage > 0 ? '+' : ''}
              {summary.total.evolution.percentage.toFixed(1)}%
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            vs {formatCurrency(summary.total.previous)}
          </p>
        </CardContent>
      </Card>

      {/* Card 2 : Moyenne */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">
            Moyenne / {periodLabel}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(summary.average)}
          </div>
        </CardContent>
      </Card>

      {/* Card 3 : Meilleur */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-green-700">
            Meilleur {periodLabel}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-700">
            {summary.best.period}
          </div>
          <p className="text-sm text-green-600 mt-1">
            {formatCurrency(summary.best.value)}
          </p>
        </CardContent>
      </Card>

      {/* Card 4 : Pire */}
      <Card className="border-red-200 bg-red-50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-red-700">
            Pire {periodLabel}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-700">
            {summary.worst.period}
          </div>
          <p className="text-sm text-red-600 mt-1">
            {formatCurrency(summary.worst.value)}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
