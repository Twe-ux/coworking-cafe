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
          className="border-green-500 text-green-700 hover:bg-green-50 hover:text-green-700"
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
          <Button variant="outline" className="h-8 w-8 p-0 border-gray-300 text-gray-700 hover:border-green-500 hover:bg-green-50 hover:text-green-700">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <div
            onClick={handleOpenFormWithDate}
            className="relative flex cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors border border-transparent text-blue-700 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-500 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0"
            role="menuitem"
          >
            Modifier
          </div>
          <div
            onClick={() => onDelete && onDelete(row)}
            className="relative flex cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors border border-transparent text-red-700 hover:bg-red-50 hover:text-red-700 hover:border-red-500 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0"
            role="menuitem"
          >
            Supprimer
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
