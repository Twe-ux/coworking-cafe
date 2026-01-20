'use client'

import { Input } from '@/components/ui/input'
import type { TimeEntry, EditingCell } from './types'

interface EditableDateProps {
  entry: TimeEntry
  editingCell: EditingCell | null
  editValue: string
  onCellClick: (entry: TimeEntry, field: EditingCell['field']) => void
  onEditValueChange: (value: string) => void
  onCellSave: () => void
  onKeyDown: (e: React.KeyboardEvent) => void
}

export function EditableDate({
  entry,
  editingCell,
  editValue,
  onCellClick,
  onEditValueChange,
  onCellSave,
  onKeyDown,
}: EditableDateProps) {
  const isEditing =
    editingCell?.entryId === entry.id && editingCell?.field === 'date'

  if (isEditing) {
    return (
      <Input
        type="date"
        value={editValue}
        onChange={(e) => onEditValueChange(e.target.value)}
        onBlur={onCellSave}
        onKeyDown={onKeyDown}
        className="h-6 w-28 p-1 text-xs"
        autoFocus
      />
    )
  }

  return (
    <div
      className="cursor-pointer rounded p-1 text-sm transition-colors hover:bg-blue-50"
      onClick={() => onCellClick(entry, 'date')}
      title="Cliquez pour modifier la date"
    >
      {(() => {
        const [year, month, day] = entry.date.split('-').map(Number)
        const dateObj = new Date(year, month - 1, day)
        return dateObj.toLocaleDateString('fr-FR')
      })()}
    </div>
  )
}
