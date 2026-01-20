'use client'

import { TableCell, TableRow } from '@/components/ui/table'
import type { GroupedTimeEntry, TimeEntry, EditingCell } from './types'
import { TimeEntryShiftCell } from './TimeEntryShiftCell'
import { EditableDate } from './EditableDate'

interface TimeEntryRowProps {
  group: GroupedTimeEntry
  editingCell: EditingCell | null
  editValue: string
  isSaving: boolean
  onCellClick: (entry: TimeEntry, field: EditingCell['field']) => void
  onEditValueChange: (value: string) => void
  onCellSave: () => void
  onKeyDown: (e: React.KeyboardEvent) => void
  onDeleteShift: (shiftId: string) => void
}

function formatHours(hours?: number): string {
  if (!hours) return '--'
  const h = Math.floor(hours)
  const m = Math.round((hours - h) * 60)
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
}

export function TimeEntryRow({
  group,
  editingCell,
  editValue,
  isSaving,
  onCellClick,
  onEditValueChange,
  onCellSave,
  onKeyDown,
  onDeleteShift,
}: TimeEntryRowProps) {
  return (
    <TableRow
      className={
        group.hasError
          ? 'border-red-200 bg-red-50'
          : group.hasActiveShift
            ? 'bg-green-50'
            : ''
      }
    >
      <TableCell className="text-center">
        {group.morningShift ? (
          <div className="flex justify-center">
            <EditableDate
              entry={group.morningShift}
              editingCell={editingCell}
              editValue={editValue}
              onCellClick={onCellClick}
              onEditValueChange={onEditValueChange}
              onCellSave={onCellSave}
              onKeyDown={onKeyDown}
            />
          </div>
        ) : group.afternoonShift ? (
          <div className="flex justify-center">
            <EditableDate
              entry={group.afternoonShift}
              editingCell={editingCell}
              editValue={editValue}
              onCellClick={onCellClick}
              onEditValueChange={onEditValueChange}
              onCellSave={onCellSave}
              onKeyDown={onKeyDown}
            />
          </div>
        ) : (
          <div className="text-sm">{group.date}</div>
        )}
      </TableCell>
      <TableCell className="text-center">
        <div className="flex items-center justify-center gap-3">
          <div className={`h-3 w-3 rounded-full ${group.employee.color}`} />
          <div>
            <div className="font-medium">
              {group.employee.firstName} {group.employee.lastName}
            </div>
          </div>
        </div>
      </TableCell>
      <TableCell className="text-center">
        <TimeEntryShiftCell
          shift={group.morningShift}
          isActive={group.morningShift?.status === 'active'}
          editingCell={editingCell}
          editValue={editValue}
          isSaving={isSaving}
          onCellClick={onCellClick}
          onEditValueChange={onEditValueChange}
          onCellSave={onCellSave}
          onKeyDown={onKeyDown}
          onDeleteShift={onDeleteShift}
        />
      </TableCell>
      <TableCell className="text-center">
        <TimeEntryShiftCell
          shift={group.afternoonShift}
          isActive={group.afternoonShift?.status === 'active'}
          editingCell={editingCell}
          editValue={editValue}
          isSaving={isSaving}
          onCellClick={onCellClick}
          onEditValueChange={onEditValueChange}
          onCellSave={onCellSave}
          onKeyDown={onKeyDown}
          onDeleteShift={onDeleteShift}
        />
      </TableCell>
      <TableCell className="text-center">
        <div
          className={`font-mono font-medium ${
            group.hasError
              ? 'text-red-700'
              : group.hasActiveShift
                ? 'text-green-700'
                : ''
          }`}
        >
          {formatHours(group.totalHours)}
          {group.hasError && (
            <div className="mt-1 text-xs text-red-600">Erreur pointage</div>
          )}
        </div>
      </TableCell>
    </TableRow>
  )
}
