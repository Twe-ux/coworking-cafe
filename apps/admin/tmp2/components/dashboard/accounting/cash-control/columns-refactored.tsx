"use client";

import { columnUtils } from "@/components/ui/table-cells";
import { ColumnDef } from "@tanstack/react-table";

// Type pour les données de paiement
export type Payment = {
  _id: string;
  id: number;
  date: string;
  TTC: number;
  HT: number;
  TVA: number;
  "ca-ht": number | { 20: number; 10: number; "5,5": number; 0: number };
  "ca-tva": number | { 20: number; 10: number; "5,5": number; 0: number };
  prestaB2B: Array<{ label: string; value: number }>;
  depenses: Array<{ label: string; value: number }>;
  virement: number;
  cbClassique: number;
  cbSansContact: number;
  especes: number;
  total: number;
};

// Configuration des colonnes avec les nouveaux utilitaires
export const columns: ColumnDef<Payment>[] = [
  // Colonne de date
  columnUtils.dateColumn("date", "Date"),

  // Colonnes de montants
  columnUtils.amountColumn("TTC", "Total TTC"),

  // Colonnes commentées dans l'original - gardons-les pour référence
  // columnUtils.amountColumn("HT", "Total HT"),
  // columnUtils.amountColumn("TVA", "Total TVA"),
  // columnUtils.taxRatesColumn("ca-ht", "HT"),
  // columnUtils.taxRatesColumn("ca-tva", "TVA"),

  // Colonnes de listes d'items
  columnUtils.itemListColumn(
    "prestaB2B",
    "Prestations B2B",
    "Aucune prestation",
  ),
  columnUtils.itemListColumn("depenses", "Dépenses", "Aucune dépense"),

  // Colonnes de moyens de paiement
  columnUtils.amountColumn("virement", "Virement"),
  columnUtils.amountColumn("cbClassique", "CB Classique"),
  columnUtils.amountColumn("cbSansContact", "CB Sans Contact"),
  columnUtils.amountColumn("especes", "Espèces"),

  // Colonne d'actions
  columnUtils.actionsColumn({
    onEdit: (row) => {
      console.log("Modifier:", row);
      // Logique de modification
    },
    onDelete: (row) => {
      console.log("Supprimer:", row);
      // Logique de suppression
    },
    customActions: [
      {
        label: "Dupliquer",
        onClick: (row) => {
          console.log("Dupliquer:", row);
          // Logique de duplication
        },
      },
      {
        label: "Exporter PDF",
        onClick: (row) => {
          console.log("Exporter PDF:", row);
          // Logique d'export PDF
        },
      },
    ],
  }),
];

// Export des types pour réutilisation
export type { Payment as CashControlPayment };
