"use client";

import { useState, useMemo } from "react";
import { useChartData } from "@/hooks/use-chart-data";
import { useB2BRevenue } from "@/hooks/useB2BRevenue";
import { useConsolidatedRevenue } from "@/hooks/useConsolidatedRevenue";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Euro, TrendingUp, FileText, DollarSign } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const MONTHS = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
];

export function ConsolidatedPageClient() {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();

  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);

  // Fetch turnovers
  const { data: turnoversData, isLoading: isLoadingTurnovers } = useChartData();

  // Calculer startDate et endDate pour B2B
  const { startDate, endDate } = useMemo(() => {
    const start = new Date(selectedYear, selectedMonth, 1);
    const end = new Date(selectedYear, selectedMonth + 1, 0);

    return {
      startDate: start.toISOString().slice(0, 10),
      endDate: end.toISOString().slice(0, 10),
    };
  }, [selectedYear, selectedMonth]);

  // Fetch B2B revenues
  const { data: b2bData, isLoading: isLoadingB2B } = useB2BRevenue({
    startDate,
    endDate,
  });

  // Consolider les données
  const { dailyData, monthlyStats, isLoading: isLoadingConsolidated } = useConsolidatedRevenue({
    turnovers: turnoversData || [],
    b2bRevenues: b2bData,
    selectedYear,
    selectedMonth,
  });

  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return [currentYear, currentYear - 1, currentYear - 2];
  }, []);

  const isLoading = isLoadingTurnovers || isLoadingB2B || isLoadingConsolidated;

  const formatDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Vue Consolidée</h1>
        <p className="text-muted-foreground mt-2">
          Chiffre d'affaires total (Caisse + B2B)
        </p>
      </div>

      {/* Filtres */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="font-semibold">Année :</span>
              <select
                className="rounded border px-3 py-2"
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
              >
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-semibold">Mois :</span>
              <select
                className="rounded border px-3 py-2"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
              >
                {MONTHS.map((month, idx) => (
                  <option key={month} value={idx}>
                    {month}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Caisse HT</CardTitle>
            <Euro className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {monthlyStats.turnovers.ht.toFixed(2)} €
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">B2B HT</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {monthlyStats.b2b.ht.toFixed(2)} €
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total HT</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {monthlyStats.total.ht.toFixed(2)} €
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total TVA</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {monthlyStats.total.tva.toFixed(2)} €
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tableau jour par jour */}
      <Card>
        <CardHeader>
          <CardTitle>Détail jour par jour</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Chargement...
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader className="bg-gray-100">
                  <TableRow>
                    <TableHead className="text-center">Date</TableHead>
                    <TableHead className="text-center">Caisse HT</TableHead>
                    <TableHead className="text-center">Caisse TTC</TableHead>
                    <TableHead className="text-center">B2B HT</TableHead>
                    <TableHead className="text-center">B2B TTC</TableHead>
                    <TableHead className="text-center font-bold">Total HT</TableHead>
                    <TableHead className="text-center font-bold">Total TTC</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dailyData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        Aucune donnée pour cette période
                      </TableCell>
                    </TableRow>
                  ) : (
                    dailyData.map((day) => (
                      <TableRow key={day.date}>
                        <TableCell className="text-center font-medium">
                          {formatDate(day.date)}
                        </TableCell>
                        <TableCell className="text-center">
                          {day.turnovers.ht.toFixed(2)} €
                        </TableCell>
                        <TableCell className="text-center">
                          {day.turnovers.ttc.toFixed(2)} €
                        </TableCell>
                        <TableCell className="text-center">
                          {day.b2b.ht.toFixed(2)} €
                        </TableCell>
                        <TableCell className="text-center">
                          {day.b2b.ttc.toFixed(2)} €
                        </TableCell>
                        <TableCell className="text-center font-bold">
                          {day.total.ht.toFixed(2)} €
                        </TableCell>
                        <TableCell className="text-center font-bold">
                          {day.total.ttc.toFixed(2)} €
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                  {/* Footer with totals */}
                  {dailyData.length > 0 && (
                    <TableRow className="bg-gray-50 font-bold">
                      <TableCell className="text-center">TOTAL</TableCell>
                      <TableCell className="text-center">
                        {monthlyStats.turnovers.ht.toFixed(2)} €
                      </TableCell>
                      <TableCell className="text-center">
                        {monthlyStats.turnovers.ttc.toFixed(2)} €
                      </TableCell>
                      <TableCell className="text-center">
                        {monthlyStats.b2b.ht.toFixed(2)} €
                      </TableCell>
                      <TableCell className="text-center">
                        {monthlyStats.b2b.ttc.toFixed(2)} €
                      </TableCell>
                      <TableCell className="text-center text-primary">
                        {monthlyStats.total.ht.toFixed(2)} €
                      </TableCell>
                      <TableCell className="text-center text-primary">
                        {monthlyStats.total.ttc.toFixed(2)} €
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
