"use client";

import { Button } from "@/components/ui/button";
import {
  GenericTable,
  GenericTableConfig,
  commonActions,
} from "@/components/ui/generic-table";
import { FileText, Plus, TrendingUp } from "lucide-react";
import { useState } from "react";
import { CashEntryFormData } from "./cash-entry-form-generic";

// Type pour les entrées de caisse avec métadonnées
type CashEntry = CashEntryFormData & {
  id: string;
  createdAt: string;
  createdBy: string;
  status: "pending" | "validated" | "rejected";
  totalIncome: number;
  totalExpenses: number;
  balance: number;
};

interface CashControlTableProps {
  data: CashEntry[];
  onEdit?: (entry: CashEntry) => void;
  onDelete?: (entry: CashEntry) => void;
  onValidate?: (entry: CashEntry) => void;
  onCreateNew?: () => void;
  loading?: boolean;
}

export function CashControlTable({
  data,
  onEdit,
  onDelete,
  onValidate,
  onCreateNew,
  loading = false,
}: CashControlTableProps) {
  const [selectedEntries, setSelectedEntries] = useState<CashEntry[]>([]);

  // Configuration de la table
  const tableConfig: GenericTableConfig<CashEntry> = {
    title: "Contrôle de Caisse",
    description: "Gestion des entrées et sorties de caisse quotidiennes",
    loading,
    emptyMessage: "Aucune entrée de caisse enregistrée",

    columns: [
      {
        id: "date",
        label: "Date",
        type: "date",
        sortable: true,
        sticky: "left",
        width: 120,
      },
      {
        id: "status",
        label: "Statut",
        type: "custom",
        sortable: true,
        format: (value: string) => {
          const variants = {
            pending: {
              label: "En attente",
              color: "bg-yellow-100 text-yellow-800",
            },
            validated: {
              label: "Validé",
              color: "bg-green-100 text-green-800",
            },
            rejected: { label: "Rejeté", color: "bg-red-100 text-red-800" },
          };
          const variant = variants[value as keyof typeof variants];
          return (
            <span
              className={`rounded-full px-2 py-1 text-xs font-medium ${variant.color}`}
            >
              {variant.label}
            </span>
          );
        },
        width: 100,
      },
      {
        id: "prestaB2B",
        label: "Prestations B2B",
        type: "custom",
        format: (prestations: CashEntry["prestaB2B"]) => {
          const total = prestations.reduce(
            (sum, p) => sum + (parseFloat(p.value) || 0),
            0,
          );
          const count = prestations.filter((p) => p.label && p.value).length;
          return (
            <div className="text-sm">
              <div className="font-medium">
                {count} prestation{count !== 1 ? "s" : ""}
              </div>
              <div className="text-muted-foreground">{total.toFixed(2)} €</div>
            </div>
          );
        },
        width: 140,
      },
      {
        id: "depenses",
        label: "Dépenses",
        type: "custom",
        format: (depenses: CashEntry["depenses"]) => {
          const total = depenses.reduce(
            (sum, d) => sum + (parseFloat(d.value) || 0),
            0,
          );
          const count = depenses.filter((d) => d.label && d.value).length;
          return (
            <div className="text-sm">
              <div className="font-medium">
                {count} dépense{count !== 1 ? "s" : ""}
              </div>
              <div className="text-red-600">-{total.toFixed(2)} €</div>
            </div>
          );
        },
        width: 120,
      },
      {
        id: "totalPayments",
        label: "Encaissements",
        type: "custom",
        align: "right",
        format: (_, row: CashEntry) => {
          const total =
            (parseFloat(row.virement) || 0) +
            (parseFloat(row.especes) || 0) +
            (parseFloat(row.cbClassique) || 0) +
            (parseFloat(row.cbSansContact) || 0);
          return (
            <div className="text-sm">
              <div className="font-medium text-green-600">
                {total.toFixed(2)} €
              </div>
              <div className="text-muted-foreground text-xs">
                {[
                  parseFloat(row.virement) > 0 &&
                    `V: ${parseFloat(row.virement).toFixed(0)}€`,
                  parseFloat(row.especes) > 0 &&
                    `E: ${parseFloat(row.especes).toFixed(0)}€`,
                  parseFloat(row.cbClassique) > 0 &&
                    `CB: ${parseFloat(row.cbClassique).toFixed(0)}€`,
                  parseFloat(row.cbSansContact) > 0 &&
                    `SC: ${parseFloat(row.cbSansContact).toFixed(0)}€`,
                ]
                  .filter(Boolean)
                  .join(" | ")}
              </div>
            </div>
          );
        },
        sortable: true,
        width: 160,
      },
      {
        id: "balance",
        label: "Solde",
        type: "custom",
        align: "right",
        format: (_, row: CashEntry) => {
          const income =
            (parseFloat(row.virement) || 0) +
            (parseFloat(row.especes) || 0) +
            (parseFloat(row.cbClassique) || 0) +
            (parseFloat(row.cbSansContact) || 0) +
            row.prestaB2B.reduce(
              (sum, p) => sum + (parseFloat(p.value) || 0),
              0,
            );

          const expenses = row.depenses.reduce(
            (sum, d) => sum + (parseFloat(d.value) || 0),
            0,
          );
          const balance = income - expenses;

          return (
            <div
              className={`text-sm font-medium ${balance >= 0 ? "text-green-600" : "text-red-600"}`}
            >
              {balance >= 0 ? "+" : ""}
              {balance.toFixed(2)} €
            </div>
          );
        },
        sortable: true,
        cellClassName: (_, row) => {
          const income =
            (parseFloat(row.virement) || 0) +
            (parseFloat(row.especes) || 0) +
            (parseFloat(row.cbClassique) || 0) +
            (parseFloat(row.cbSansContact) || 0);
          const expenses = row.depenses.reduce(
            (sum, d) => sum + (parseFloat(d.value) || 0),
            0,
          );
          const balance = income - expenses;
          return balance >= 0 ? "bg-green-50" : "bg-red-50";
        },
        width: 120,
      },
      {
        id: "createdBy",
        label: "Créé par",
        type: "text",
        width: 120,
      },
    ],

    actions: [
      commonActions.view((entry) => {
        console.log("Voir l'entrée:", entry);
      }),
      commonActions.edit((entry) => onEdit?.(entry)),
      {
        id: "validate",
        label: "Valider",
        icon: TrendingUp,
        variant: "default",
        onClick: (entry) => onValidate?.(entry),
        hidden: (entry) => entry.status !== "pending",
      },
      {
        id: "duplicate",
        label: "Dupliquer",
        icon: FileText,
        variant: "ghost",
        onClick: (entry) => {
          const duplicatedEntry = {
            ...entry,
            id: `temp-${Date.now()}`,
            date: new Date().toISOString().slice(0, 10),
            status: "pending" as const,
          };
          onEdit?.(duplicatedEntry);
        },
      },
      commonActions.delete((entry) => onDelete?.(entry)),
    ],

    filters: [
      {
        id: "status",
        label: "Statut",
        type: "select",
        options: [
          { value: "pending", label: "En attente" },
          { value: "validated", label: "Validé" },
          { value: "rejected", label: "Rejeté" },
        ],
      },
      {
        id: "date",
        label: "Date",
        type: "date",
        placeholder: "Filtrer par date",
      },
    ],

    search: {
      enabled: true,
      placeholder: "Rechercher dans les entrées...",
      searchableColumns: ["createdBy", "prestaB2B", "depenses"],
    },

    selection: {
      enabled: true,
      onSelectionChange: setSelectedEntries,
    },

    pagination: {
      pageSize: 15,
      showSizeSelector: true,
      pageSizeOptions: [10, 15, 25, 50],
    },

    export: {
      enabled: true,
      formats: ["csv", "excel"],
      onExport: (data, format) => {
        console.log(`Export ${format}:`, data);
        // Implémentation de l'export
      },
    },

    sorting: {
      defaultSort: { column: "date", direction: "desc" },
    },

    refreshButton: true,
    onRefresh: () => {
      console.log("Actualisation des données...");
      // Logique de rafraîchissement
    },
  };

  return (
    <div className="space-y-4">
      {/* Actions globales */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h1 className="text-2xl font-bold">Contrôle de Caisse</h1>
          {selectedEntries.length > 0 && (
            <span className="text-muted-foreground text-sm">
              {selectedEntries.length} sélectionné
              {selectedEntries.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {selectedEntries.length > 0 && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  selectedEntries.forEach((entry) => onValidate?.(entry));
                  setSelectedEntries([]);
                }}
                disabled={selectedEntries.some((e) => e.status !== "pending")}
              >
                Valider la sélection
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  console.log("Export sélection:", selectedEntries);
                }}
              >
                Exporter la sélection
              </Button>
            </>
          )}

          <Button onClick={onCreateNew}>
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle entrée
          </Button>
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {[
          {
            title: "Total entrées",
            value: data.length,
            description: "Entrées ce mois",
          },
          {
            title: "En attente",
            value: data.filter((e) => e.status === "pending").length,
            description: "À valider",
            className: "text-yellow-600",
          },
          {
            title: "Solde total",
            value:
              data
                .reduce((sum, entry) => {
                  const income =
                    (parseFloat(entry.virement) || 0) +
                    (parseFloat(entry.especes) || 0) +
                    (parseFloat(entry.cbClassique) || 0) +
                    (parseFloat(entry.cbSansContact) || 0);
                  const expenses = entry.depenses.reduce(
                    (s, d) => s + (parseFloat(d.value) || 0),
                    0,
                  );
                  return sum + (income - expenses);
                }, 0)
                .toFixed(2) + " €",
            description: "Balance globale",
            className:
              data.reduce((sum, entry) => {
                const income =
                  (parseFloat(entry.virement) || 0) +
                  (parseFloat(entry.especes) || 0) +
                  (parseFloat(entry.cbClassique) || 0) +
                  (parseFloat(entry.cbSansContact) || 0);
                const expenses = entry.depenses.reduce(
                  (s, d) => s + (parseFloat(d.value) || 0),
                  0,
                );
                return sum + (income - expenses);
              }, 0) >= 0
                ? "text-green-600"
                : "text-red-600",
          },
          {
            title: "Validées",
            value: data.filter((e) => e.status === "validated").length,
            description: "Entrées validées",
            className: "text-green-600",
          },
        ].map((stat, index) => (
          <div key={index} className="rounded-lg border bg-white p-4">
            <div className="text-muted-foreground text-sm">{stat.title}</div>
            <div className={`text-2xl font-bold ${stat.className || ""}`}>
              {stat.value}
            </div>
            <div className="text-muted-foreground text-xs">
              {stat.description}
            </div>
          </div>
        ))}
      </div>

      {/* Table principale */}
      <GenericTable data={data} config={tableConfig} />
    </div>
  );
}

export default CashControlTable;
