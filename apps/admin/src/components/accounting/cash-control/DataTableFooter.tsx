import { type Table as ReactTable } from "@tanstack/react-table";
import { TableCell, TableRow } from "@/components/ui/table";
import type { CashEntryRow } from "@/types/accounting";
import type { CashEntryTotals } from "./hooks/useCashEntryTotals";
import { formatCurrency } from "./utils/cashEntryFormatters";

interface DataTableFooterProps<TData> {
  table: ReactTable<TData>;
  totals: CashEntryTotals;
}

/**
 * Composant pour afficher le footer de la table avec les totaux
 * Affiche les sommes de chaque colonne et la différence
 */
export function DataTableFooter<TData extends CashEntryRow>({
  table,
  totals,
}: DataTableFooterProps<TData>) {
  return (
    <tfoot className="bg-gray-200">
      <TableRow className="font-semibold">
        {table.getAllLeafColumns().map((col) => {
          switch (col.id) {
            case "date":
              return (
                <TableCell key={col.id} className="text-center">
                  Total
                </TableCell>
              );

            case "TTC":
              return (
                <TableCell key={col.id} className="text-center">
                  {formatCurrency(totals.TTC)}
                </TableCell>
              );

            case "HT":
              return (
                <TableCell key={col.id} className="text-center">
                  {formatCurrency(totals.HT)}
                </TableCell>
              );

            case "TVA":
              return (
                <TableCell key={col.id} className="text-center">
                  {formatCurrency(totals.TVA)}
                </TableCell>
              );

            case "prestaB2B":
              return (
                <TableCell key={col.id} className="text-center">
                  {formatCurrency(totals.prestaB2B)}
                </TableCell>
              );

            case "depenses":
              return (
                <TableCell key={col.id} className="text-center">
                  {formatCurrency(totals.depenses)}
                </TableCell>
              );

            case "virement":
              return (
                <TableCell key={col.id} className="text-center">
                  {formatCurrency(totals.virement)}
                </TableCell>
              );

            case "cbClassique":
              return (
                <TableCell key={col.id} className="text-center">
                  {formatCurrency(totals.cbClassique)}
                </TableCell>
              );

            case "cbSansContact":
              return (
                <TableCell key={col.id} className="text-center">
                  {formatCurrency(totals.cbSansContact)}
                </TableCell>
              );

            case "especes":
              return (
                <TableCell key={col.id} className="text-center">
                  {formatCurrency(totals.especes)}
                </TableCell>
              );

            case "difference":
              // Afficher la différence avec couleur selon le signe
              const diffClassName =
                totals.difference === 0
                  ? "text-center font-bold text-gray-800"
                  : totals.difference < 0
                    ? "text-center font-bold text-red-600"
                    : "text-center font-bold text-green-600";

              return (
                <TableCell key={col.id} className={diffClassName}>
                  {formatCurrency(totals.difference)}
                </TableCell>
              );

            default:
              return (
                <TableCell key={col.id} className="text-center"></TableCell>
              );
          }
        })}
      </TableRow>
    </tfoot>
  );
}
