'use client'

import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { LoadingSkeleton } from '@/components/ui/loading-skeleton'
import { Calendar } from 'lucide-react'
import type { GroupedTimeEntry, TimeEntry, EditingCell } from './types'
import { TimeEntryRow } from './TimeEntryRow'
import { TotalRow } from './TotalRow'

interface TimeEntriesTableProps {
  groupedEntries: GroupedTimeEntry[]
  isLoading: boolean
  editingCell: EditingCell | null
  editValue: string
  isSaving: boolean
  onCellClick: (entry: TimeEntry, field: EditingCell['field']) => void
  onEditValueChange: (value: string) => void
  onCellSave: () => void
  onKeyDown: (e: React.KeyboardEvent) => void
  onDeleteShift: (shiftId: string) => void
  onJustificationRead?: () => void
}

export function TimeEntriesTable({
  groupedEntries,
  isLoading,
  editingCell,
  editValue,
  isSaving,
  onCellClick,
  onEditValueChange,
  onCellSave,
  onKeyDown,
  onDeleteShift,
  onJustificationRead,
}: TimeEntriesTableProps) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-0">
          <LoadingSkeleton variant="list" count={5} />
        </CardContent>
      </Card>
    )
  }

  if (groupedEntries.length === 0) {
    return (
      <Card>
        <CardContent className="p-0">
          <div className="py-8 text-center">
            <Calendar className="mx-auto mb-4 h-12 w-12 text-gray-400" />
            <h3 className="mb-2 text-lg font-medium text-gray-900">
              Aucun pointage trouve
            </h3>
            <p className="text-gray-600">
              Aucun pointage ne correspond aux criteres selectionnes.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[120px] text-center">Date</TableHead>
              <TableHead className="w-[200px] text-center">Employe</TableHead>
              <TableHead className="w-[180px] text-center">Shift 1</TableHead>
              <TableHead className="w-[180px] text-center">Shift 2</TableHead>
              <TableHead className="w-[100px] text-center">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {groupedEntries.map((group) => (
              <TimeEntryRow
                key={`${group.employeeId}-${group.date}`}
                group={group}
                editingCell={editingCell}
                editValue={editValue}
                isSaving={isSaving}
                onCellClick={onCellClick}
                onEditValueChange={onEditValueChange}
                onCellSave={onCellSave}
                onKeyDown={onKeyDown}
                onDeleteShift={onDeleteShift}
                onJustificationRead={onJustificationRead}
              />
            ))}
            {groupedEntries.length > 0 && (
              <TotalRow groupedEntries={groupedEntries} />
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
