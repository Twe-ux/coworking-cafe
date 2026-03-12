"use client";

import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Minus, TrendingDown, TrendingUp } from "lucide-react";

interface CombinedBreakdownRow {
  period: string;
  label?: string;
  current: {
    b2c: number;
    b2b: number;
    total: number;
  };
  previous: {
    b2c: number;
    b2b: number;
    total: number;
  };
  evolution: {
    amount: number;
    percentage: number;
    trend: "up" | "down" | "stable";
  };
}

interface CombinedBreakdownTableProps {
  data: CombinedBreakdownRow[];
  periodLabel: string;
  currentYear: number;
  previousYear: number;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(value);
}

function getEvolutionColor(trend: "up" | "down" | "stable"): string {
  if (trend === "up") return "text-green-700";
  if (trend === "down") return "text-red-700";
  return "text-gray-700";
}

function getTrendIcon(trend: "up" | "down" | "stable", percentage: number) {
  if (percentage > 5) return <TrendingUp className="h-5 w-5 text-green-600" />;
  if (percentage < -5) return <TrendingDown className="h-5 w-5 text-red-600" />;
  return <Minus className="h-5 w-5 text-gray-600" />;
}

export function CombinedBreakdownTable({
  data,
  periodLabel,
  currentYear,
  previousYear,
}: CombinedBreakdownTableProps) {
  const totalCurrentB2C = data.reduce((sum, row) => sum + row.current.b2c, 0);
  const totalCurrentB2B = data.reduce((sum, row) => sum + row.current.b2b, 0);
  const totalCurrent = data.reduce((sum, row) => sum + row.current.total, 0);

  const totalPreviousB2C = data.reduce((sum, row) => sum + row.previous.b2c, 0);
  const totalPreviousB2B = data.reduce((sum, row) => sum + row.previous.b2b, 0);
  const totalPrevious = data.reduce((sum, row) => sum + row.previous.total, 0);

  const totalEvolutionAmount = totalCurrent - totalPrevious;
  const totalEvolutionPercentage =
    totalPrevious > 0 ? (totalEvolutionAmount / totalPrevious) * 100 : 0;
  const totalTrend: "up" | "down" | "stable" =
    totalEvolutionPercentage > 5
      ? "up"
      : totalEvolutionPercentage < -5
        ? "down"
        : "stable";

  return (
    <Card className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead rowSpan={2} className="align-middle">
              {periodLabel}
            </TableHead>
            <TableHead colSpan={3} className="text-center border-r bg-blue-50">
              {currentYear}
            </TableHead>
            <TableHead colSpan={3} className="text-center border-r bg-amber-50">
              {previousYear}
            </TableHead>
            <TableHead colSpan={2} className="text-center bg-slate-50">
              Évolution
            </TableHead>
          </TableRow>
          <TableRow>
            <TableHead className="text-right text-blue-700 bg-blue-50">
              B2C
            </TableHead>
            <TableHead className="text-right text-green-700 bg-blue-50">
              B2B
            </TableHead>
            <TableHead className="text-right font-semibold border-r bg-blue-50">
              TOTAL
            </TableHead>
            <TableHead className="text-right text-blue-700 bg-amber-50">
              B2C
            </TableHead>
            <TableHead className="text-right text-green-700 bg-amber-50">
              B2B
            </TableHead>
            <TableHead className="text-right font-semibold border-r bg-amber-50">
              TOTAL
            </TableHead>
            <TableHead className="text-right bg-slate-50">€</TableHead>
            <TableHead className="text-center bg-slate-50">%</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {data.map((row, index) => (
            <TableRow key={index}>
              <TableCell className="font-medium">
                {row.label || row.period}
              </TableCell>
              <TableCell className="text-right text-blue-700 bg-blue-50/50">
                {formatCurrency(row.current.b2c)}
              </TableCell>
              <TableCell className="text-right text-green-700 bg-blue-50/50">
                {formatCurrency(row.current.b2b)}
              </TableCell>
              <TableCell className="text-right font-semibold border-r bg-blue-50/50">
                {formatCurrency(row.current.total)}
              </TableCell>
              <TableCell className="text-right text-blue-700 bg-amber-50/50">
                {formatCurrency(row.previous.b2c)}
              </TableCell>
              <TableCell className="text-right text-green-700 bg-amber-50/50">
                {formatCurrency(row.previous.b2b)}
              </TableCell>
              <TableCell className="text-right font-semibold border-r bg-amber-50/50">
                {formatCurrency(row.previous.total)}
              </TableCell>
              <TableCell
                className={`text-right bg-slate-50/50 ${getEvolutionColor(row.evolution.trend)}`}
              >
                {formatCurrency(row.evolution.amount)}
              </TableCell>
              <TableCell className="text-center bg-slate-50/50">
                <div className="flex items-center justify-center gap-2">
                  {getTrendIcon(row.evolution.trend, row.evolution.percentage)}
                  <span className={getEvolutionColor(row.evolution.trend)}>
                    {row.evolution.percentage > 0 ? "+" : ""}
                    {row.evolution.percentage.toFixed(1)}%
                  </span>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>

        <TableFooter>
          <TableRow>
            <TableCell className="font-bold">Total</TableCell>
            <TableCell className="text-right font-bold text-blue-700 bg-blue-100">
              {formatCurrency(totalCurrentB2C)}
            </TableCell>
            <TableCell className="text-right font-bold text-green-700 bg-blue-100">
              {formatCurrency(totalCurrentB2B)}
            </TableCell>
            <TableCell className="text-right font-bold border-r bg-blue-100">
              {formatCurrency(totalCurrent)}
            </TableCell>
            <TableCell className="text-right font-bold text-blue-700 bg-amber-100">
              {formatCurrency(totalPreviousB2C)}
            </TableCell>
            <TableCell className="text-right font-bold text-green-700 bg-amber-100">
              {formatCurrency(totalPreviousB2B)}
            </TableCell>
            <TableCell className="text-right font-bold border-r bg-amber-100">
              {formatCurrency(totalPrevious)}
            </TableCell>
            <TableCell
              className={`text-right font-bold bg-slate-100 ${getEvolutionColor(totalTrend)}`}
            >
              {formatCurrency(totalEvolutionAmount)}
            </TableCell>
            <TableCell className="text-center font-bold bg-slate-100">
              <div className="flex items-center justify-center gap-2">
                {getTrendIcon(totalTrend, totalEvolutionPercentage)}
                <span className={getEvolutionColor(totalTrend)}>
                  {totalEvolutionPercentage > 0 ? "+" : ""}
                  {totalEvolutionPercentage.toFixed(1)}%
                </span>
              </div>
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </Card>
  );
}
