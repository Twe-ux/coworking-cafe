import { flexRender, type Row } from "@tanstack/react-table";
import { TableCell, TableRow } from "@/components/ui/table";
import type { CashEntryRow } from "@/types/accounting";
import {
  calculateTotalDepenses,
  calculateTotalPrestaB2B,
  calculateRowBackground,
} from "./utils/cashEntryFormatters";

interface DataTableRowProps<TData extends CashEntryRow> {
  row: Row<TData>;
  onOpenForm: (row: TData) => void;
  onDelete: (row: TData) => void;
}

/**
 * Composant pour afficher une ligne de la table de contrôle de caisse
 * Gère le calcul de la différence et la couleur de fond
 */
export function DataTableRow<TData extends CashEntryRow>({
  row,
  onOpenForm,
  onDelete,
}: DataTableRowProps<TData>) {
  const rowData = row.original;

  // Calculer tous les montants en centimes pour éviter les erreurs d'arrondi
  const totalDepenses = calculateTotalDepenses(rowData.depenses);
  const totalPrestaB2B = calculateTotalPrestaB2B(rowData.prestaB2B);

  const virement = Number(rowData.virement) * 100 || 0;
  const especes = Number(rowData.especes) * 100 || 0;
  const cbSansContact = Number(rowData.cbSansContact) * 100 || 0;
  const cbClassique = Number(rowData.cbClassique) * 100 || 0;

  const totalSaisie =
    Math.round(totalDepenses) +
    Math.round(virement) +
    Math.round(especes) +
    Math.round(cbSansContact) +
    Math.round(cbClassique) -
    Math.round(totalPrestaB2B);

  const ttc = Number(rowData.TTC) * 100 || 0;

  // Déterminer la couleur de fond selon la différence
  const bgColor = calculateRowBackground(ttc, totalSaisie);

  return (
    <TableRow
      key={row.id}
      data-state={row.getIsSelected() && "selected"}
      style={{ background: bgColor }}
    >
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id}>
          {cell.column.id === "actions"
            ? flexRender(cell.column.columnDef.cell, {
                ...cell.getContext(),
                openForm: onOpenForm,
                onDelete: onDelete,
              })
            : flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  );
}
