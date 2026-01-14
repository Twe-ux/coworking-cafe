"use client";

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import type { CashEntryRow, CashEntryFormData } from "@/types/accounting";
import React from "react";
import { FormCashControl } from "./cash-entry-form";
import { useCashEntryTotals } from "./hooks/useCashEntryTotals";
import { DataTableRow } from "./DataTableRow";
import { DataTableFooter } from "./DataTableFooter";
import { formatDateDDMMYYYY } from "./utils/cashEntryFormatters";

interface DataTableProps<TData> {
  columns: ColumnDef<TData>[];
  data: TData[];
  form: CashEntryFormData;
  setForm: React.Dispatch<React.SetStateAction<CashEntryFormData>>;
  formStatus: string | null;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onDelete?: (row: TData) => void;
}

/**
 * Table de données pour le contrôle de caisse
 * Affiche les données de turnover et cash entries avec totaux
 */
export function DataTable<TData extends CashEntryRow>({
  columns,
  data,
  form,
  setForm,
  formStatus,
  onSubmit,
  onDelete,
}: DataTableProps<TData>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const [open, setOpen] = React.useState(false);
  const [selectedRow, setSelectedRow] = React.useState<TData | null>(null);

  // Calculer les totaux avec le hook
  const totals = useCashEntryTotals(data);

  // Ouvrir le formulaire de modification
  const handleOpenForm = (row: TData) => {
    setSelectedRow(row);
    const dateStr = row.date || new Date().toISOString().slice(0, 10);
    const formId = row._id || "";

    // Pré-remplir le formulaire avec les données existantes
    const prestaB2B =
      row.prestaB2B && Array.isArray(row.prestaB2B) && row.prestaB2B.length > 0
        ? row.prestaB2B.map((item) => ({
            label: item.label || "",
            value: item.value ? String(item.value) : "",
          }))
        : [{ label: "", value: "" }];

    const depenses =
      row.depenses && Array.isArray(row.depenses) && row.depenses.length > 0
        ? row.depenses.map((item) => ({
            label: item.label || "",
            value: item.value ? String(item.value) : "",
          }))
        : [{ label: "", value: "" }];

    setForm({
      _id: formId,
      date: dateStr,
      prestaB2B,
      depenses,
      especes: row.especes ? String(row.especes) : "",
      cbClassique: row.cbClassique ? String(row.cbClassique) : "",
      cbSansContact: row.cbSansContact ? String(row.cbSansContact) : "",
      virement: row.virement ? String(row.virement) : "",
    });
    setOpen(true);
  };

  // Supprimer une ligne
  const handleDeleteRow = (row: TData) => {
    const deleteId = row._id || row.date;
    if (!deleteId) {
      alert("Impossible de supprimer : identifiant manquant");
      return;
    }

    const confirmDelete = window.confirm(
      `Êtes-vous sûr de vouloir supprimer les données du ${row.date} ?`
    );
    if (!confirmDelete) return;

    if (onDelete) {
      onDelete(row);
    }
  };

  // Fermer le modal quand l'événement custom est dispatché
  React.useEffect(() => {
    const close = () => setOpen(false);
    window.addEventListener("cash-modal-close", close);
    return () => window.removeEventListener("cash-modal-close", close);
  }, []);

  return (
    <div className="rounded-md border-2">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogTitle>
            {selectedRow?._id ? "Modifier" : "Ajouter"} les données
            {selectedRow?.date
              ? ` du ${formatDateDDMMYYYY(selectedRow.date)}`
              : ""}
          </DialogTitle>
          <FormCashControl
            form={form}
            setForm={setForm}
            formStatus={formStatus}
            onSubmit={onSubmit}
            editingRow={selectedRow}
          />
        </DialogContent>
      </Dialog>

      <Table className="bg-white">
        <TableHeader className="bg-gray-200">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead className="text-center" key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>

        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <DataTableRow
                key={row.id}
                row={row}
                onOpenForm={handleOpenForm}
                onDelete={handleDeleteRow}
              />
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                Aucune donnée disponible.
              </TableCell>
            </TableRow>
          )}
        </TableBody>

        <DataTableFooter table={table} totals={totals} />
      </Table>
    </div>
  );
}
