"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { CashEntryRow } from "@/types/accounting"
import { MoreHorizontal } from "lucide-react"

interface ActionsCellProps {
  row: CashEntryRow
  openForm?: (row: CashEntryRow) => void
  onDelete?: (row: CashEntryRow) => void
}

export function ActionsCell({ row, openForm, onDelete }: ActionsCellProps) {
  const handleOpenFormWithDate = () => {
    if (typeof openForm === "function") {
      openForm(row)
    }
  }

  const isEmpty =
    (!row.especes || row.especes === 0) &&
    (!row.virement || row.virement === 0) &&
    (!row.totalB2B || row.totalB2B === 0) &&
    (!row.totalDepenses || row.totalDepenses === 0) &&
    (!row.cbClassique || row.cbClassique === 0) &&
    (!row.cbSansContact || row.cbSansContact === 0)

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
            onClick={() => onDelete && onDelete(row)}
          >
            Supprimer
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
