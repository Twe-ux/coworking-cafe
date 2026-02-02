import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { ComparisonStats } from "@/types/accounting";

interface ComparisonTableProps {
  data: ComparisonStats;
  showTTC: boolean;
}

export function ComparisonTable({ data, showTTC }: ComparisonTableProps) {
  const { period1, period2, evolution } = data;

  const formatDate = (dateStr: string) => {
    if (!dateStr || dateStr === "undefined") return "Date invalide";
    const [year, month, day] = dateStr.split("-");
    if (!year || !month || !day) return dateStr;
    return `${day}/${month}/${year}`;
  };

  // Données à afficher
  const rows = [
    {
      label: "Caisse",
      period1Value: showTTC ? period1.turnovers.ttc : period1.turnovers.ht,
      period2Value: showTTC ? period2.turnovers.ttc : period2.turnovers.ht,
    },
    {
      label: "B2B",
      period1Value: showTTC ? period1.b2b.ttc : period1.b2b.ht,
      period2Value: showTTC ? period2.b2b.ttc : period2.b2b.ht,
    },
    {
      label: "Total",
      period1Value: showTTC ? period1.total.ttc : period1.total.ht,
      period2Value: showTTC ? period2.total.ttc : period2.total.ht,
      highlight: true,
    },
  ];

  // Calculer évolution pour chaque ligne
  const rowsWithEvolution = rows.map((row) => {
    const amount = row.period1Value - row.period2Value;
    const percent =
      row.period2Value === 0 ? 0 : (amount / row.period2Value) * 100;

    return {
      ...row,
      evolution: {
        amount: parseFloat(amount.toFixed(2)),
        percent: parseFloat(percent.toFixed(1)),
      },
    };
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tableau récapitulatif {showTTC ? "TTC" : "HT"}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader className="bg-gray-100">
              <TableRow>
                <TableHead className="text-center">Type</TableHead>
                <TableHead className="text-center">
                  {period1.period.label || "Période 1"}
                  <br />
                  <span className="text-xs text-muted-foreground font-normal">
                    {formatDate(period1.period.startDate)} -{" "}
                    {formatDate(period1.period.endDate)}
                  </span>
                </TableHead>
                <TableHead className="text-center">
                  {period2.period.label || "Période 2"}
                  <br />
                  <span className="text-xs text-muted-foreground font-normal">
                    {formatDate(period2.period.startDate)} -{" "}
                    {formatDate(period2.period.endDate)}
                  </span>
                </TableHead>
                <TableHead className="text-center">Écart €</TableHead>
                <TableHead className="text-center">Écart %</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rowsWithEvolution.map((row, idx) => (
                <TableRow
                  key={idx}
                  className={row.highlight ? "bg-gray-50 font-semibold" : ""}
                >
                  <TableCell className="text-center font-medium">{row.label}</TableCell>
                  <TableCell className="text-center">
                    {row.period1Value.toFixed(2)} €
                  </TableCell>
                  <TableCell className="text-center">
                    {row.period2Value.toFixed(2)} €
                  </TableCell>
                  <TableCell className="text-center">
                    <span
                      className={
                        row.evolution.amount > 0
                          ? "text-green-600"
                          : row.evolution.amount < 0
                          ? "text-red-600"
                          : "text-gray-600"
                      }
                    >
                      {row.evolution.amount > 0 ? "+" : ""}
                      {row.evolution.amount.toFixed(2)} €
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      {row.evolution.percent > 0 ? (
                        <TrendingUp className="w-4 h-4 text-green-600" />
                      ) : row.evolution.percent < 0 ? (
                        <TrendingDown className="w-4 h-4 text-red-600" />
                      ) : (
                        <Minus className="w-4 h-4 text-gray-400" />
                      )}
                      <span
                        className={
                          row.evolution.percent > 0
                            ? "text-green-600"
                            : row.evolution.percent < 0
                            ? "text-red-600"
                            : "text-gray-600"
                        }
                      >
                        {row.evolution.percent > 0 ? "+" : ""}
                        {row.evolution.percent.toFixed(1)}%
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Informations supplémentaires */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-1">
            <p className="font-semibold text-primary">
              {period1.period.label || "Période 1"}
            </p>
            <p className="text-muted-foreground">
              {period1.daysCount} jours - Moyenne journalière :{" "}
              {(showTTC ? period1.dailyAverage.ttc : period1.dailyAverage.ht).toFixed(
                2
              )}{" "}
              €
            </p>
          </div>
          <div className="space-y-1">
            <p className="font-semibold text-secondary">
              {period2.period.label || "Période 2"}
            </p>
            <p className="text-muted-foreground">
              {period2.daysCount} jours - Moyenne journalière :{" "}
              {(showTTC ? period2.dailyAverage.ttc : period2.dailyAverage.ht).toFixed(
                2
              )}{" "}
              €
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
