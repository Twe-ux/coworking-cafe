import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CalendarIcon,
  Download,
  RefreshCw,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import React from "react";

import {
  CASH_CONTROL_CONSTANTS,
  CashControlCalculations,
  CashControlFilters,
} from "@/hooks/use-cash-control";

// Composant pour les filtres de date
interface CashControlFiltersProps {
  filters: CashControlFilters;
  years: number[];
}

export function CashControlFiltersComponent({
  filters,
  years,
}: CashControlFiltersProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <CalendarIcon className="h-5 w-5" />
          <span>Filtres de période</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          {/* Sélection d'année */}
          <div className="space-y-2">
            <Label htmlFor="year-select">Année</Label>
            <Select
              value={filters.selectedYear?.toString() || ""}
              onValueChange={(value) =>
                filters.updateYear(value ? parseInt(value) : null)
              }
            >
              <SelectTrigger id="year-select">
                <SelectValue placeholder="Sélectionner une année" />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sélection de mois */}
          <div className="space-y-2">
            <Label htmlFor="month-select">Mois</Label>
            <Select
              value={filters.selectedMonth?.toString() || ""}
              onValueChange={(value) =>
                filters.updateMonth(value ? parseInt(value) : null)
              }
            >
              <SelectTrigger id="month-select">
                <SelectValue placeholder="Sélectionner un mois" />
              </SelectTrigger>
              <SelectContent>
                {CASH_CONTROL_CONSTANTS.MONTHS.map((month, index) => (
                  <SelectItem key={index + 1} value={(index + 1).toString()}>
                    {month}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date de début */}
          <div className="space-y-2">
            <Label htmlFor="date-from">Date de début</Label>
            <Input
              id="date-from"
              type="date"
              value={filters.dateRange.from}
              onChange={(e) =>
                filters.updateDateRange({
                  from: e.target.value,
                  to: filters.dateRange.to,
                })
              }
            />
          </div>

          {/* Date de fin */}
          <div className="space-y-2">
            <Label htmlFor="date-to">Date de fin</Label>
            <Input
              id="date-to"
              type="date"
              value={filters.dateRange.to}
              onChange={(e) =>
                filters.updateDateRange({
                  from: filters.dateRange.from,
                  to: e.target.value,
                })
              }
            />
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <Button variant="outline" onClick={filters.resetFilters}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Réinitialiser
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Composant pour les statistiques financières
interface FinancialStatsProps {
  calculations: CashControlCalculations;
}

export function FinancialStats({ calculations }: FinancialStatsProps) {
  const stats = [
    {
      title: "Chiffre d'affaires TTC",
      value: calculations.turnover.total,
      format: "currency",
      trend: calculations.turnover.total > 0 ? "up" : "neutral",
    },
    {
      title: "Total HT",
      value: calculations.turnover.ht,
      format: "currency",
      trend: "neutral",
    },
    {
      title: "Total TVA",
      value: calculations.turnover.tva,
      format: "currency",
      trend: "neutral",
    },
    {
      title: "Total paiements",
      value: calculations.payments.total,
      format: "currency",
      trend: calculations.payments.total > 0 ? "up" : "neutral",
    },
    {
      title: "Différence",
      value: calculations.difference,
      format: "currency",
      trend: calculations.isBalanced ? "neutral" : "down",
      highlight: !calculations.isBalanced,
    },
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  };

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
      {stats.map((stat, index) => (
        <Card key={index} className={stat.highlight ? "border-orange-500" : ""}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">
                  {stat.title}
                </p>
                <p
                  className={`text-2xl font-bold ${
                    stat.highlight ? "text-orange-600" : ""
                  }`}
                >
                  {stat.format === "currency"
                    ? formatCurrency(stat.value)
                    : stat.value}
                </p>
              </div>
              <div className="flex items-center">
                {stat.trend === "up" && (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                )}
                {stat.trend === "down" && (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Composant pour les moyens de paiement
interface PaymentMethodsStatsProps {
  payments: CashControlCalculations["payments"];
}

export function PaymentMethodsStats({ payments }: PaymentMethodsStatsProps) {
  const paymentMethods = [
    { key: "virement", label: "Virement", value: payments.virement },
    { key: "cbClassique", label: "CB Classique", value: payments.cbClassique },
    {
      key: "cbSansContact",
      label: "CB Sans Contact",
      value: payments.cbSansContact,
    },
    { key: "especes", label: "Espèces", value: payments.especes },
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Moyens de paiement</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {paymentMethods.map((method) => (
            <div key={method.key} className="flex items-center justify-between">
              <span className="text-sm font-medium">{method.label}</span>
              <Badge variant={method.value > 0 ? "default" : "secondary"}>
                {formatCurrency(method.value)}
              </Badge>
            </div>
          ))}

          <div className="border-t pt-4">
            <div className="flex items-center justify-between font-bold">
              <span>Total</span>
              <span>{formatCurrency(payments.total)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Composant pour les actions rapides
interface QuickActionsProps {
  onGeneratePDF: () => void;
  onRefresh: () => void;
  onExport: () => void;
  isGeneratingPDF?: boolean;
  isLoading?: boolean;
}

export function QuickActions({
  onGeneratePDF,
  onRefresh,
  onExport,
  isGeneratingPDF = false,
  isLoading = false,
}: QuickActionsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Actions rapides</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <Button
            onClick={onGeneratePDF}
            disabled={isGeneratingPDF}
            className="w-full"
          >
            <Download className="mr-2 h-4 w-4" />
            {isGeneratingPDF ? "Génération..." : "Générer PDF"}
          </Button>

          <Button
            variant="outline"
            onClick={onRefresh}
            disabled={isLoading}
            className="w-full"
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            />
            Actualiser les données
          </Button>

          <Button variant="outline" onClick={onExport} className="w-full">
            <Download className="mr-2 h-4 w-4" />
            Exporter CSV
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Composant pour l'indicateur de statut
interface StatusIndicatorProps {
  isBalanced: boolean;
  difference: number;
}

export function StatusIndicator({
  isBalanced,
  difference,
}: StatusIndicatorProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(Math.abs(amount));
  };

  if (isBalanced) {
    return (
      <div className="flex items-center space-x-2 text-green-600">
        <div className="h-2 w-2 rounded-full bg-green-500"></div>
        <span className="text-sm font-medium">Comptes équilibrés</span>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2 text-orange-600">
      <div className="h-2 w-2 rounded-full bg-orange-500"></div>
      <span className="text-sm font-medium">
        Différence de {formatCurrency(difference)}
        {difference > 0 ? " en excédent" : " en déficit"}
      </span>
    </div>
  );
}

// Composant conteneur pour la page
interface CashControlPageLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export function CashControlPageLayout({
  children,
  title = "Contrôle de Caisse",
  subtitle = "Gestion et suivi des entrées de caisse",
}: CashControlPageLayoutProps) {
  return (
    <div className="container mx-auto space-y-6 p-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
      </div>

      {children}
    </div>
  );
}
