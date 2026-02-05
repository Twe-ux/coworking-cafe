"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency } from "@/types/cashRegister";
import type { CashRegisterEntry } from "@/types/cashRegister";

interface CashRegisterHistoryProps {
  /** Afficher la colonne "Détails" (comptage détaillé vs saisie directe) */
  showDetailsColumn?: boolean;
  /** Titre personnalisé */
  title?: string;
  /** Description personnalisée */
  description?: string;
}

/**
 * Composant réutilisable pour afficher l'historique du fond de caisse
 * Utilisé par les pages admin et staff
 */
export function CashRegisterHistory({
  showDetailsColumn = false,
  title = "Liste des Saisies",
  description,
}: CashRegisterHistoryProps) {
  const [entries, setEntries] = useState<CashRegisterEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState<string>(getCurrentMonth());
  const [error, setError] = useState<string | null>(null);

  // Charger les données
  useEffect(() => {
    fetchEntries();
  }, [selectedMonth]);

  const fetchEntries = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/cash-register/list?month=${selectedMonth}`
      );
      const result = await response.json();

      if (result.success) {
        setEntries(result.data.entries);
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

  // Calculer total mensuel
  const monthlyTotal = entries.reduce((sum, entry) => sum + entry.amount, 0);

  // Nettoyer les notes pour enlever la mention "Saisie rapide depuis le dashboard"
  const cleanNotes = (notes: string | undefined): string => {
    if (!notes) return "-";

    // Enlever "Saisie rapide depuis le dashboard" en début de note
    let cleaned = notes.replace(/^Saisie rapide depuis le dashboard\s*-?\s*/i, "");

    // Si la note ne contient que cette phrase, retourner "-"
    if (!cleaned.trim()) return "-";

    return cleaned;
  };

  return (
    <div className="space-y-6">
      {/* Stats Card */}
      <Card>
        <CardHeader>
          <CardTitle>Résumé Mensuel</CardTitle>
          <CardDescription>{formatMonthDisplay(selectedMonth)}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Nombre de saisies</p>
              <p className="text-2xl font-bold">{entries.length}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total mensuel</p>
              <p className="text-2xl font-bold">{formatCurrency(monthlyTotal)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Moyenne</p>
              <p className="text-2xl font-bold">
                {entries.length > 0
                  ? formatCurrency(monthlyTotal / entries.length)
                  : "0 €"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{title}</CardTitle>
              {description && <CardDescription>{description}</CardDescription>}
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
          ) : entries.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Aucune saisie pour ce mois</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Heure</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Compté par</TableHead>
                  {showDetailsColumn && <TableHead>Détails</TableHead>}
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((entry) => (
                  <TableRow key={entry._id}>
                    <TableCell className="font-medium">
                      {formatDate(entry.date)}
                    </TableCell>
                    <TableCell>{formatTime(entry.createdAt)}</TableCell>
                    <TableCell className="font-bold">
                      {formatCurrency(entry.amount)}
                    </TableCell>
                    <TableCell>{entry.countedBy.name}</TableCell>
                    {showDetailsColumn && (
                      <TableCell className="text-sm text-muted-foreground">
                        {entry.countDetails ? "Comptage détaillé" : "Saisie directe"}
                      </TableCell>
                    )}
                    <TableCell className="text-sm">
                      {cleanNotes(entry.notes)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
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

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatTime(date: Date): string {
  return new Date(date).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getMonthOptions(): Array<{ value: string; label: string }> {
  const options = [];
  const now = new Date();

  for (let i = 0; i < 6; i++) {
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
