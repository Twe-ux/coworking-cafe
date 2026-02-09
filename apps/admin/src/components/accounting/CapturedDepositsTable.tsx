"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { CapturedDeposit } from "@/types/accounting";
import { useEffect, useMemo, useState } from "react";

/**
 * Composant pour afficher les empreintes bancaires capturées
 */
export function CapturedDepositsTable() {
  const [deposits, setDeposits] = useState<CapturedDeposit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string>(getCurrentMonth());

  useEffect(() => {
    fetchDeposits();
  }, []);

  const fetchDeposits = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/accounting/captured-deposits");
      const result = await response.json();

      if (result.success) {
        setDeposits(result.data.deposits);
      } else {
        setError(result.error || "Erreur lors du chargement");
      }
    } catch (err) {
      setError("Erreur réseau");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Filtrer par mois sélectionné
  const filteredDeposits = useMemo(() => {
    return deposits.filter((deposit) => {
      const depositMonth = deposit.cancelledAt.substring(0, 7); // YYYY-MM
      return depositMonth === selectedMonth;
    });
  }, [deposits, selectedMonth]);

  // Calculer stats du mois sélectionné
  const monthlyTotal = useMemo(() => {
    return filteredDeposits.reduce(
      (sum, deposit) => sum + deposit.depositAmount,
      0,
    );
  }, [filteredDeposits]);

  const formatCurrency = (amount: number): string => {
    return `${(amount / 100).toFixed(2)} €`;
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatSpaceType = (spaceType: string): string => {
    const mapping: Record<string, string> = {
      "open-space": "Open Space",
      "salle-verriere": "Salle Verrière",
      "salle-etage": "Salle Étage",
      evenementiel: "Événementiel",
      desk: "Bureau",
      "meeting-room": "Salle de Réunion",
      "meeting-room-glass": "Salle Verrière",
      "meeting-room-floor": "Salle Étage",
      "private-office": "Bureau Privé",
      "event-space": "Espace Événement",
    };
    return mapping[spaceType] || spaceType;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex-1">
            <CardTitle>Empreintes Capturées</CardTitle>
            <CardDescription>
              {formatMonthDisplay(selectedMonth)} • {filteredDeposits.length}{" "}
              empreinte
              {filteredDeposits.length > 1 ? "s" : ""} •{" "}
              {formatCurrency(monthlyTotal)}
            </CardDescription>
          </div>
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Sélectionner un mois" />
            </SelectTrigger>
            <SelectContent>
              {getMonthOptions().map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Chargement...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-destructive">{error}</p>
          </div>
        ) : filteredDeposits.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              Aucune empreinte capturée pour ce mois
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Espace</TableHead>
                <TableHead>Date Réservation</TableHead>
                <TableHead>Date Annulation</TableHead>
                <TableHead>Montant</TableHead>
                <TableHead>Raison</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDeposits.map((deposit) => (
                <TableRow key={deposit._id}>
                  <TableCell className="font-medium">
                    <div>
                      <p>{deposit.companyName || deposit.userName}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {formatSpaceType(deposit.spaceType)}
                  </TableCell>
                  <TableCell>{formatDate(deposit.bookingDate)}</TableCell>
                  <TableCell>{formatDate(deposit.cancelledAt)}</TableCell>
                  <TableCell className="font-bold text-green-600">
                    {formatCurrency(deposit.depositAmount)}
                  </TableCell>
                  <TableCell className="text-sm max-w-[250px] truncate">
                    {deposit.cancelReason}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

// Helpers
function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function formatMonthDisplay(month: string): string {
  const [year, monthNum] = month.split("-");
  const date = new Date(parseInt(year), parseInt(monthNum) - 1);
  return date.toLocaleDateString("fr-FR", { year: "numeric", month: "long" });
}

function getMonthOptions(): Array<{ value: string; label: string }> {
  const options = [];
  const now = new Date();

  for (let i = 0; i < 12; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const label = date.toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
    });
    options.push({ value, label });
  }

  return options;
}
