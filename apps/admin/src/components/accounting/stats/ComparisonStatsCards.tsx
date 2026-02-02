import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Euro, FileText, TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { ComparisonStats } from "@/types/accounting";

interface ComparisonStatsCardsProps {
  data: ComparisonStats;
  showTTC: boolean;
}

export function ComparisonStatsCards({ data, showTTC }: ComparisonStatsCardsProps) {
  const { period1, period2, evolution } = data;

  // Sélectionner HT ou TTC selon showTTC
  const currentEvolution = showTTC ? evolution.ttc : evolution.ht;

  const cards = [
    {
      title: `Caisse ${showTTC ? "TTC" : "HT"}`,
      icon: Euro,
      period1Value: showTTC ? period1.turnovers.ttc : period1.turnovers.ht,
      period2Value: showTTC ? period2.turnovers.ttc : period2.turnovers.ht,
    },
    {
      title: `B2B ${showTTC ? "TTC" : "HT"}`,
      icon: FileText,
      period1Value: showTTC ? period1.b2b.ttc : period1.b2b.ht,
      period2Value: showTTC ? period2.b2b.ttc : period2.b2b.ht,
    },
    {
      title: `Total ${showTTC ? "TTC" : "HT"}`,
      icon: TrendingUp,
      period1Value: showTTC ? period1.total.ttc : period1.total.ht,
      period2Value: showTTC ? period2.total.ttc : period2.total.ht,
      highlight: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {cards.map((card, idx) => {
        const evolution = calculateEvolution(card.period1Value, card.period2Value);

        return (
          <Card key={idx} className={card.highlight ? "border-primary" : ""}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <card.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Période 1 */}
              <div>
                <p className="text-xs text-primary font-medium">
                  {period1.period.label || "Période 1"}
                </p>
                <p className="text-2xl font-bold">{card.period1Value.toFixed(2)} €</p>
              </div>

              {/* Période 2 */}
              <div>
                <p className="text-xs text-secondary font-medium">
                  {period2.period.label || "Période 2"}
                </p>
                <p className="text-xl font-semibold text-muted-foreground">
                  {card.period2Value.toFixed(2)} €
                </p>
              </div>

              {/* Évolution */}
              <div className="pt-2 border-t">
                <div className="flex items-center gap-2">
                  {evolution.percent > 0 ? (
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  ) : evolution.percent < 0 ? (
                    <TrendingDown className="w-4 h-4 text-red-600" />
                  ) : (
                    <Minus className="w-4 h-4 text-gray-400" />
                  )}
                  <div>
                    <p
                      className={`text-sm font-semibold ${
                        evolution.percent > 0
                          ? "text-green-600"
                          : evolution.percent < 0
                          ? "text-red-600"
                          : "text-gray-600"
                      }`}
                    >
                      {evolution.percent > 0 ? "+" : ""}
                      {evolution.percent.toFixed(1)}%
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {evolution.amount > 0 ? "+" : ""}
                      {evolution.amount.toFixed(2)} €
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

// Helper
function calculateEvolution(current: number, previous: number) {
  const amount = current - previous;
  const percent = previous === 0 ? 0 : (amount / previous) * 100;

  return {
    amount: parseFloat(amount.toFixed(2)),
    percent: parseFloat(percent.toFixed(1)),
  };
}
