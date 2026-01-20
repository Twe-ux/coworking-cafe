'use client'

import { TableCell, TableRow } from '@/components/ui/table'
import type { GroupedTimeEntry } from './types'

interface TotalRowProps {
  groupedEntries: GroupedTimeEntry[]
}

function formatHours(hours?: number): string {
  if (!hours) return '--'
  const h = Math.floor(hours)
  const m = Math.round((hours - h) * 60)
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
}

export function TotalRow({ groupedEntries }: TotalRowProps) {
  const hasErrors = groupedEntries.some((group) => group.hasError)
  const hasActiveShifts = groupedEntries.some((group) => group.hasActiveShift)
  const morningShiftCount = groupedEntries.filter((g) => g.morningShift).length
  const afternoonShiftCount = groupedEntries.filter((g) => g.afternoonShift).length
  const totalHours = groupedEntries.reduce((total, g) => total + g.totalHours, 0)

  return (
    <TableRow
      className={`border-t-2 border-gray-300 font-semibold ${
        hasErrors
          ? 'bg-red-100 text-red-800'
          : hasActiveShifts
            ? 'bg-orange-100 text-orange-800'
            : 'bg-green-100 text-green-800'
      }`}
    >
      <TableCell className="text-center">
        <div className="font-bold">TOTAL</div>
      </TableCell>
      <TableCell className="text-center">
        <div className="font-bold">
          {groupedEntries.length} journee{groupedEntries.length > 1 ? 's' : ''}
        </div>
      </TableCell>
      <TableCell className="text-center">
        <div className="font-bold">
          {morningShiftCount} shift{morningShiftCount > 1 ? 's' : ''}
        </div>
      </TableCell>
      <TableCell className="text-center">
        <div className="font-bold">
          {afternoonShiftCount} shift{afternoonShiftCount > 1 ? 's' : ''}
        </div>
      </TableCell>
      <TableCell className="text-center">
        <div className="font-mono text-lg font-bold">
          {formatHours(totalHours)}
        </div>
      </TableCell>
    </TableRow>
  )
}
