"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CashEntry } from "@/store/cashentry/state";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";

// Helper function pour formater les montants
const formatCurrency = (value: number | string | undefined): string => {
  const numValue = typeof value === "string" ? parseFloat(value) : value;
  if (!numValue || isNaN(numValue)) return "0,00 €";
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(numValue);
};

// Helper function pour formater les dates
const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR");
  } catch {
    return dateString;
  }
};

export type CashControlActionsProps = {
  onEdit?: (row: CashEntry) => void;
  onDelete?: (row: CashEntry) => void;
};

export const createCashControlColumns = (
  actions?: CashControlActionsProps,
): ColumnDef<CashEntry>[] => [
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => {
      return (
        <div className="font-medium">{formatDate(row.getValue("date"))}</div>
      );
    },
  },
  {
    accessorKey: "virement",
    header: "Virement",
    cell: ({ row }) => {
      const amount = row.getValue("virement") as number;
      return (
        <div className="text-right font-mono">{formatCurrency(amount)}</div>
      );
    },
  },
  {
    accessorKey: "cbClassique",
    header: "CB Classique",
    cell: ({ row }) => {
      const amount = row.getValue("cbClassique") as number;
      return (
        <div className="text-right font-mono">{formatCurrency(amount)}</div>
      );
    },
  },
  {
    accessorKey: "cbSansContact",
    header: "CB Sans Contact",
    cell: ({ row }) => {
      const amount = row.getValue("cbSansContact") as number;
      return (
        <div className="text-right font-mono">{formatCurrency(amount)}</div>
      );
    },
  },
  {
    accessorKey: "especes",
    header: "Espèces",
    cell: ({ row }) => {
      const amount = row.getValue("especes") as number;
      return (
        <div className="text-right font-mono">{formatCurrency(amount)}</div>
      );
    },
  },
  {
    id: "total",
    header: "Total",
    cell: ({ row }) => {
      const virement = parseFloat(String(row.getValue("virement") || 0));
      const cbClassique = parseFloat(String(row.getValue("cbClassique") || 0));
      const cbSansContact = parseFloat(
        String(row.getValue("cbSansContact") || 0),
      );
      const especes = parseFloat(String(row.getValue("especes") || 0));

      const total = virement + cbClassique + cbSansContact + especes;

      return (
        <div className="text-right font-mono font-semibold">
          {formatCurrency(total)}
        </div>
      );
    },
  },
  {
    id: "depenses",
    header: "Dépenses",
    cell: ({ row }) => {
      const depenses = row.original.depenses || [];
      const totalDepenses = depenses.reduce(
        (sum, d) => sum + (d.value || 0),
        0,
      );

      if (depenses.length === 0) {
        return <div className="text-muted-foreground">Aucune</div>;
      }

      return (
        <div className="space-y-1">
          <div className="text-right font-mono text-red-600">
            -{formatCurrency(totalDepenses)}
          </div>
          <div className="text-muted-foreground text-xs">
            {depenses.length} dépense(s)
          </div>
        </div>
      );
    },
  },
  {
    id: "status",
    header: "Statut",
    cell: ({ row }) => {
      const virement = parseFloat(String(row.getValue("virement") || 0));
      const cbClassique = parseFloat(String(row.getValue("cbClassique") || 0));
      const cbSansContact = parseFloat(
        String(row.getValue("cbSansContact") || 0),
      );
      const especes = parseFloat(String(row.getValue("especes") || 0));

      const total = virement + cbClassique + cbSansContact + especes;

      if (total === 0) {
        return <Badge variant="secondary">Vide</Badge>;
      } else if (total > 0) {
        return <Badge variant="default">Complété</Badge>;
      } else {
        return <Badge variant="destructive">Erreur</Badge>;
      }
    },
  },
  ...(actions
    ? [
        {
          id: "actions",
          header: "Actions",
          cell: ({ row }: { row: any }) => {
            const entry = row.original;

            return (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Ouvrir le menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuItem
                    onClick={() => navigator.clipboard.writeText(entry._id)}
                  >
                    Copier l&apos;ID
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {actions.onEdit && (
                    <DropdownMenuItem onClick={() => actions.onEdit!(entry)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Modifier
                    </DropdownMenuItem>
                  )}
                  {actions.onDelete && (
                    <DropdownMenuItem
                      onClick={() => actions.onDelete!(entry)}
                      className="text-red-600"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Supprimer
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            );
          },
        },
      ]
    : []),
];

// Export par défaut pour la rétrocompatibilité
export const columns = createCashControlColumns();
