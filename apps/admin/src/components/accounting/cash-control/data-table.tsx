"use client"

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import type { CashEntryRow, CashEntryFormData } from "@/types/accounting"
import React from "react"
import { FormCashControl } from "./cash-entry-form"

interface DataTableProps<TData> {
  columns: any
  data: TData[]
  form: CashEntryFormData
  setForm: React.Dispatch<React.SetStateAction<CashEntryFormData>>
  formStatus: string | null
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  onDelete?: (row: TData) => void
}

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
  })

  const [open, setOpen] = React.useState(false)
  const [selectedRow, setSelectedRow] = React.useState<TData | null>(null)

  const handleOpenForm = (row: TData) => {
    setSelectedRow(row)
    const dateStr = row.date || new Date().toISOString().slice(0, 10)
    const formId = row._id || ""

    // Pré-remplir le formulaire avec les données existantes
    const prestaB2B = row.prestaB2B && Array.isArray(row.prestaB2B) && row.prestaB2B.length > 0
      ? row.prestaB2B.map((item: any) => ({
          label: item.label || "",
          value: item.value ? String(item.value) : ""
        }))
      : [{ label: "", value: "" }]

    const depenses = row.depenses && Array.isArray(row.depenses) && row.depenses.length > 0
      ? row.depenses.map((item: any) => ({
          label: item.label || "",
          value: item.value ? String(item.value) : ""
        }))
      : [{ label: "", value: "" }]

    setForm({
      _id: formId,
      date: dateStr,
      prestaB2B,
      depenses,
      especes: row.especes ? String(row.especes) : "",
      cbClassique: row.cbClassique ? String(row.cbClassique) : "",
      cbSansContact: row.cbSansContact ? String(row.cbSansContact) : "",
      virement: row.virement ? String(row.virement) : "",
    })
    setOpen(true)
  }

  const handleDeleteRow = (row: TData) => {
    const deleteId = row._id || row.date
    if (!deleteId) {
      alert("Impossible de supprimer : identifiant manquant")
      return
    }

    const confirmDelete = window.confirm(
      `Êtes-vous sûr de vouloir supprimer les données du ${row.date} ?`
    )
    if (!confirmDelete) return

    if (onDelete) {
      onDelete(row)
    }
  }

  React.useEffect(() => {
    const close = () => setOpen(false)
    window.addEventListener("cash-modal-close", close)
    return () => window.removeEventListener("cash-modal-close", close)
  }, [])

  function formatDateDDMMYYYY(dateStr: string) {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return ""
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, "0")
    const day = String(d.getDate()).padStart(2, "0")
    return `${day}-${month}-${year}`
  }

  const totals = React.useMemo(() => {
    return data.reduce(
      (acc, row: any) => {
        acc.TTC += Number(row.TTC) || 0
        acc.HT += Number(row.HT) || 0
        acc.TVA += Number(row.TVA) || 0
        if (Array.isArray(row.prestaB2B)) {
          acc.prestaB2B += row.prestaB2B.reduce(
            (s: number, p: any) => s + (Number(p.value) || 0),
            0
          )
        } else {
          acc.prestaB2B += row.prestaB2B || 0
        }
        if (Array.isArray(row.depenses)) {
          acc.depenses += row.depenses.reduce(
            (s: number, d: any) => s + (Number(d.value) || 0),
            0
          )
        } else {
          acc.depenses += row.depenses || 0
        }
        acc.virement += Number(row.virement) || 0
        acc.cbClassique += Number(row.cbClassique) || 0
        acc.cbSansContact += Number(row.cbSansContact) || 0
        acc.especes += Number(row.especes) || 0
        const ttc = Number(acc.TTC) * 100 || 0
        const add =
          (Number(acc.depenses) * 100 || 0) +
          (Number(acc.virement) * 100 || 0) +
          (Number(acc.cbClassique) * 100 || 0) +
          (Number(acc.cbSansContact) * 100 || 0) +
          (Number(acc.especes) * 100 || 0) -
          (Number(acc.prestaB2B) * 100 || 0)
        const difference = Math.round(add) - Math.round(ttc)
        acc.difference = difference / 100 || 0

        return acc
      },
      {
        TTC: 0,
        HT: 0,
        TVA: 0,
        prestaB2B: 0,
        depenses: 0,
        cbClassique: 0,
        cbSansContact: 0,
        virement: 0,
        especes: 0,
        difference: 0,
      }
    )
  }, [data])

  return (
    <div className="rounded-md border-2">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogTitle>
            {selectedRow?._id ? "Modifier" : "Ajouter"} les données
            {selectedRow?.date ? ` du ${formatDateDDMMYYYY(selectedRow.date)}` : ""}
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
            table.getRowModel().rows.map((row) => {
              const r = row.original as any

              // Calculer tous les montants en centimes pour éviter les erreurs d'arrondi
              let totalDepenses = 0
              if (Array.isArray(r.depenses)) {
                totalDepenses = r.depenses.reduce(
                  (acc: number, d: any) => acc + (Number(d.value) * 100 || 0),
                  0
                )
              } else if (!isNaN(r.depenses)) {
                totalDepenses = Number(r.depenses) * 100 || 0
              }

              let totalPrestaB2B = 0
              if (Array.isArray(r.prestaB2B)) {
                totalPrestaB2B = r.prestaB2B.reduce(
                  (acc: number, d: any) => acc + (Number(d.value) * 100 || 0),
                  0
                )
              } else if (!isNaN(r.prestaB2B)) {
                totalPrestaB2B = Number(r.prestaB2B) * 100 || 0
              }

              const virement = Number(r.virement) * 100 || 0
              const especes = Number(r.especes) * 100 || 0
              const cbSansContact = Number(r.cbSansContact) * 100 || 0
              const cbClassique = Number(r.cbClassique) * 100 || 0

              const totalSaisie =
                Math.round(totalDepenses) +
                Math.round(virement) +
                Math.round(especes) +
                Math.round(cbSansContact) +
                Math.round(cbClassique) -
                Math.round(totalPrestaB2B)

              const ttc = Number(r.TTC) * 100 || 0
              const bgColor =
                Math.round(ttc) === Math.round(totalSaisie) &&
                Math.round(ttc) !== 0
                  ? '#d1fae5' // vert clair
                  : Math.round(ttc) !== 0 && Math.round(totalSaisie) !== 0
                    ? '#fee2e2' // rouge clair
                    : undefined

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
                            openForm: (rowData: TData) => handleOpenForm(rowData),
                            onDelete: (rowData: TData) => handleDeleteRow(rowData),
                          })
                        : flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                    </TableCell>
                  ))}
                </TableRow>
              )
            })
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                Aucune donnée disponible.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
        <tfoot className="bg-gray-200">
          <TableRow className="font-semibold">
            {table.getAllLeafColumns().map((col) => {
              switch (col.id) {
                case "date":
                  return (
                    <TableCell key={col.id} className="text-center">
                      Total
                    </TableCell>
                  )
                case "TTC":
                  return (
                    <TableCell key={col.id} className="text-center">
                      {totals.TTC.toLocaleString('fr-FR', {
                        style: 'currency',
                        currency: 'EUR',
                      })}
                    </TableCell>
                  )
                case "HT":
                  return (
                    <TableCell key={col.id} className="text-center">
                      {totals.HT.toLocaleString('fr-FR', {
                        style: 'currency',
                        currency: 'EUR',
                      })}
                    </TableCell>
                  )
                case "TVA":
                  return (
                    <TableCell key={col.id} className="text-center">
                      {totals.TVA.toLocaleString('fr-FR', {
                        style: 'currency',
                        currency: 'EUR',
                      })}
                    </TableCell>
                  )
                case "prestaB2B":
                  return (
                    <TableCell key={col.id} className="text-center">
                      {totals.prestaB2B.toLocaleString('fr-FR', {
                        style: 'currency',
                        currency: 'EUR',
                      })}
                    </TableCell>
                  )
                case "depenses":
                  return (
                    <TableCell key={col.id} className="text-center">
                      {totals.depenses.toLocaleString('fr-FR', {
                        style: 'currency',
                        currency: 'EUR',
                      })}
                    </TableCell>
                  )
                case "virement":
                  return (
                    <TableCell key={col.id} className="text-center">
                      {totals.virement.toLocaleString('fr-FR', {
                        style: 'currency',
                        currency: 'EUR',
                      })}
                    </TableCell>
                  )
                case "cbClassique":
                  return (
                    <TableCell key={col.id} className="text-center">
                      {totals.cbClassique.toLocaleString('fr-FR', {
                        style: 'currency',
                        currency: 'EUR',
                      })}
                    </TableCell>
                  )
                case "cbSansContact":
                  return (
                    <TableCell key={col.id} className="text-center">
                      {totals.cbSansContact.toLocaleString('fr-FR', {
                        style: 'currency',
                        currency: 'EUR',
                      })}
                    </TableCell>
                  )
                case "especes":
                  return (
                    <TableCell key={col.id} className="text-center">
                      {totals.especes.toLocaleString('fr-FR', {
                        style: 'currency',
                        currency: 'EUR',
                      })}
                    </TableCell>
                  )
                case "difference":
                  return totals.difference === 0 ? (
                    <TableCell
                      key={col.id}
                      className="text-center font-bold text-gray-800"
                    >
                      {totals.difference.toLocaleString('fr-FR', {
                        style: 'currency',
                        currency: 'EUR',
                      })}
                    </TableCell>
                  ) : totals.difference < 0 ? (
                    <TableCell
                      key={col.id}
                      className="text-center font-bold text-red-600"
                    >
                      {totals.difference.toLocaleString('fr-FR', {
                        style: 'currency',
                        currency: 'EUR',
                      })}
                    </TableCell>
                  ) : (
                    <TableCell
                      key={col.id}
                      className="text-center font-bold text-green-600"
                    >
                      {totals.difference.toLocaleString('fr-FR', {
                        style: 'currency',
                        currency: 'EUR',
                      })}
                    </TableCell>
                  )
                default:
                  return (
                    <TableCell
                      key={col.id}
                      className="text-center"
                    ></TableCell>
                  )
              }
            })}
          </TableRow>
        </tfoot>
      </Table>
    </div>
  )
}
