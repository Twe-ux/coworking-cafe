"use client"

import type { CashEntryRow } from "@/types/accounting"
import { ColumnDef, CellContext } from "@tanstack/react-table"
import { formatDate } from "./formatters"
import { AmountCell, DataListCell, DifferenceCell } from "./cells"
import { ActionsCell } from "./actions-cell"

export const columns: ColumnDef<CashEntryRow>[] = [
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => {
      const formatted = formatDate(row.original.date)
      return formatted ? <div className="text-center">{formatted}</div> : null
    },
  },
  {
    accessorKey: "TTC",
    header: "Total TTC",
    cell: ({ row }) => <AmountCell amount={row.original.TTC} />,
  },
  {
    accessorKey: "prestaB2B",
    header: "Presta B2B",
    cell: ({ row }) => <DataListCell data={row.original.prestaB2B} />,
  },
  {
    accessorKey: "depenses",
    header: "Dépenses",
    cell: ({ row }) => <DataListCell data={row.original.depenses} />,
  },
  {
    accessorKey: "virement",
    header: "Virement",
    cell: ({ row }) => <AmountCell amount={row.original.virement} />,
  },
  {
    accessorKey: "cbClassique",
    header: "CB classique",
    cell: ({ row }) => <AmountCell amount={row.original.cbClassique} />,
  },
  {
    accessorKey: "cbSansContact",
    header: "CB sans contact",
    cell: ({ row }) => <AmountCell amount={row.original.cbSansContact} />,
  },
  {
    accessorKey: "especes",
    header: "Espèces",
    cell: ({ row }) => <AmountCell amount={row.original.especes} />,
  },
  {
    accessorKey: "totalEncaissements",
    header: "Total Encaissements",
    cell: ({ row }) => <AmountCell amount={row.original.totalEncaissements} />,
  },
  {
    id: "difference",
    header: "Différence",
    cell: ({ row }) => (
      <DifferenceCell
        ca={row.original.totalCA || 0}
        encaissements={row.original.totalEncaissements || 0}
      />
    ),
  },
  {
    id: "actions",
    header: "",
    cell: (
      cell: CellContext<CashEntryRow, unknown> & {
        openForm?: (row: CashEntryRow) => void
        onDelete?: (row: CashEntryRow) => void
      }
    ) => {
      const { row, openForm, onDelete } = cell
      return <ActionsCell row={row.original} openForm={openForm} onDelete={onDelete} />
    },
  },
]
