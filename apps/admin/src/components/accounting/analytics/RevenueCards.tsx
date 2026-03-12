import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { RevenueData, ComparisonData } from '@/types/accounting';

interface RevenueCardsProps {
  data: RevenueData;
  comparison?: ComparisonData;
  mode: 'ht' | 'ttc';
}

interface CardData {
  title: string;
  current: number;
  comparison?: number;
  color: string;
}

export function RevenueCards({ data, comparison, mode }: RevenueCardsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(value);
  };

  const calculateVariation = (current: number, previous?: number) => {
    if (!previous || previous === 0) return null;
    const variation = ((current - previous) / previous) * 100;
    return {
      value: Math.abs(variation),
      trend: variation > 0 ? 'up' : variation < 0 ? 'down' : 'neutral',
    };
  };

  const cards: CardData[] = [
    {
      title: 'CA B2C',
      current: mode === 'ht' ? data.b2c.ht : data.b2c.ttc,
      comparison: comparison ? (mode === 'ht' ? comparison.b2c.ht : comparison.b2c.ttc) : undefined,
      color: 'blue',
    },
    {
      title: 'CA B2B',
      current: mode === 'ht' ? data.b2b.ht : data.b2b.ttc,
      comparison: comparison ? (mode === 'ht' ? comparison.b2b.ht : comparison.b2b.ttc) : undefined,
      color: 'purple',
    },
    {
      title: 'CA Total',
      current: mode === 'ht' ? data.total.ht : data.total.ttc,
      comparison: comparison ? (mode === 'ht' ? comparison.total.ht : comparison.total.ttc) : undefined,
      color: 'green',
    },
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-50 border-blue-200 text-blue-700',
      purple: 'bg-purple-50 border-purple-200 text-purple-700',
      green: 'bg-green-50 border-green-200 text-green-700',
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const getTrendIcon = (trend: string) => {
    if (trend === 'up') return <TrendingUp className="h-5 w-5 text-green-600" />;
    if (trend === 'down') return <TrendingDown className="h-5 w-5 text-red-600" />;
    return <Minus className="h-5 w-5 text-gray-600" />;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {cards.map((card) => {
        const variation = calculateVariation(card.current, card.comparison);

        return (
          <div
            key={card.title}
            className={`p-6 rounded-lg border-2 ${getColorClasses(card.color)}`}
          >
            <h3 className="text-sm font-medium text-gray-600 mb-2">{card.title}</h3>

            <div className="flex items-baseline justify-between">
              <p className="text-3xl font-bold">
                {formatCurrency(card.current)}
              </p>

              {variation && (
                <div className="flex items-center gap-1">
                  {getTrendIcon(variation.trend)}
                  <span
                    className={`text-sm font-semibold ${
                      variation.trend === 'up'
                        ? 'text-green-600'
                        : variation.trend === 'down'
                        ? 'text-red-600'
                        : 'text-gray-600'
                    }`}
                  >
                    {variation.value.toFixed(1)}%
                  </span>
                </div>
              )}
            </div>

            {card.comparison !== undefined && (
              <p className="text-xs text-gray-500 mt-2">
                vs {formatCurrency(card.comparison)}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
