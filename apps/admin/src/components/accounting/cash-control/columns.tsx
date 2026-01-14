"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { CashEntryRow } from "@/types/accounting"
import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal } from "lucide-react"

const AmountFormatter = new Intl.NumberFormat("fr", {
  style: "currency",
  currency: "EUR",
})

export const columns: ColumnDef<CashEntryRow>[] = [
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => {
      const date = row.original.date
      if (!date) return ""
      const d = new Date(date)
      const day = String(d.getDate()).padStart(2, "0")
      const month = String(d.getMonth() + 1).padStart(2, "0")
      const year = d.getFullYear()
      return <div className="text-center">{`${day}-${month}-${year}`}</div>
    },
  },
  {
    accessorKey: "TTC",
    header: "Total TTC",
    cell: ({ row }) => {
      const ttc = row.original.TTC
      if (ttc === null || ttc === undefined || isNaN(ttc)) return ""
      return <div className="text-center">{AmountFormatter.format(ttc)}</div>
    },
  },
  {
    accessorKey: "prestaB2B",
    header: "Presta B2B",
    cell: ({ row }) => {
      const prestaB2B = row.original.prestaB2B
      if (Array.isArray(prestaB2B) && prestaB2B.length > 0) {
        return (
          <div className="flex flex-col items-end gap-0.5">
            {prestaB2B
              .filter((d) => d.label && d.value !== undefined && d.value !== null)
              .map((d, idx) => (
                <div className="flex min-w-24 gap-1" key={idx}>
                  <span className="min-w-[50px] text-right font-bold">
                    {d.label} :
                  </span>
                  <span className="min-w-[60px] text-right font-medium">
                    {AmountFormatter.format(d.value)}
                  </span>
                </div>
              ))}
          </div>
        )
      }
      return ""
    },
  },
  {
    accessorKey: "depenses",
    header: "Dépenses",
    cell: ({ row }) => {
      const depenses = row.original.depenses
      if (Array.isArray(depenses) && depenses.length > 0) {
        return (
          <div className="flex flex-col items-end gap-0.5">
            {depenses
              .filter((d) => d.label && d.value !== undefined && d.value !== null)
              .map((d, idx) => (
                <div className="flex min-w-24 gap-1" key={idx}>
                  <span className="min-w-[50px] text-right font-bold">
                    {d.label} :
                  </span>
                  <span className="min-w-[60px] text-right font-medium">
                    {AmountFormatter.format(d.value)}
                  </span>
                </div>
              ))}
          </div>
        )
      }
      return ""
    },
  },
  {
    accessorKey: "virement",
    header: "Virement",
    cell: ({ row }) => {
      const virement = row.original.virement
      return virement === null || virement === undefined || virement === 0 ? (
        ""
      ) : (
        <div className="text-center">{AmountFormatter.format(virement)}</div>
      )
    },
  },
  {
    accessorKey: "cbClassique",
    header: "CB classique",
    cell: ({ row }) => {
      const cbClassique = row.original.cbClassique
      return cbClassique === null ||
        cbClassique === undefined ||
        cbClassique === 0 ? (
        ""
      ) : (
        <div className="text-center">{AmountFormatter.format(cbClassique)}</div>
      )
    },
  },
  {
    accessorKey: "cbSansContact",
    header: "CB sans contact",
    cell: ({ row }) => {
      const cbSansContact = row.original.cbSansContact
      return cbSansContact === null ||
        cbSansContact === undefined ||
        cbSansContact === 0 ? (
        ""
      ) : (
        <div className="text-center">{AmountFormatter.format(cbSansContact)}</div>
      )
    },
  },
  {
    accessorKey: "especes",
    header: "Espèces",
    cell: ({ row }) => {
      const especes = row.original.especes
      return especes === null || especes === undefined || especes === 0 ? (
        ""
      ) : (
        <div className="text-center">{AmountFormatter.format(especes)}</div>
      )
    },
  },
  {
    accessorKey: "totalEncaissements",
    header: "Total Encaissements",
    cell: ({ row }) => {
      const total = row.original.totalEncaissements
      if (total === null || total === undefined || isNaN(total)) return ""
      return <div className="text-center">{AmountFormatter.format(total)}</div>
    },
  },
  {
    id: "difference",
    header: "Différence",
    cell: ({ row }) => {
      const ca = row.original.totalCA || 0
      const encaissements = row.original.totalEncaissements || 0
      const difference = encaissements - ca

      if (Math.abs(difference) < 0.01) return ""

      return (
        <div
          className={`text-center font-bold ${difference < 0 ? "text-red-600" : "text-green-600"}`}
        >
          {AmountFormatter.format(difference)}
        </div>
      )
    },
  },
  {
    id: "actions",
    header: "",
    cell: (cell: any) => {
      const { row, openForm, onDelete } = cell
      const handleOpenFormWithDate = () => {
        if (typeof openForm === "function") {
          openForm(row.original)
        }
      }

      const isEmpty =
        (!row.original.especes || row.original.especes === 0) &&
        (!row.original.virement || row.original.virement === 0) &&
        (!row.original.totalB2B || row.original.totalB2B === 0) &&
        (!row.original.totalDepenses || row.original.totalDepenses === 0) &&
        (!row.original.cbClassique || row.original.cbClassique === 0) &&
        (!row.original.cbSansContact || row.original.cbSansContact === 0)

      if (isEmpty) {
        return (
          <div className="text-center">
            <Button
              onClick={handleOpenFormWithDate}
              variant="outline"
              className="border-primary text-primary hover:bg-accent"
            >
              Saisir
            </Button>
          </div>
        )
      }

      return (
        <div className="text-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleOpenFormWithDate}>
                Modifier
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-red-600 focus:text-red-600"
                onClick={() => onDelete && onDelete(row.original)}
              >
                Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    },
  },
]
