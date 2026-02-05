'use client'

import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Trash2, MessageSquareMore } from 'lucide-react'
import type { TimeEntry, EditingCell } from './types'

interface TimeEntryShiftCellProps {
  shift: TimeEntry | undefined
  isActive: boolean
  editingCell: EditingCell | null
  editValue: string
  isSaving: boolean
  onCellClick: (entry: TimeEntry, field: EditingCell['field']) => void
  onEditValueChange: (value: string) => void
  onCellSave: () => void
  onKeyDown: (e: React.KeyboardEvent) => void
  onDeleteShift: (shiftId: string) => void
}

function formatTime(time: string | null | undefined): string {
  if (!time) return '--:--'
  return time
}

export function TimeEntryShiftCell({
  shift,
  isActive,
  editingCell,
  editValue,
  isSaving,
  onCellClick,
  onEditValueChange,
  onCellSave,
  onKeyDown,
  onDeleteShift,
}: TimeEntryShiftCellProps) {
  if (!shift) {
    return <div className="text-center text-gray-400">--</div>
  }

  const hasError = shift.hasError === true

  const renderEditableTime = (field: 'clockIn' | 'clockOut') => {
    const isEditing =
      editingCell?.entryId === shift.id && editingCell?.field === field
    const time = field === 'clockIn' ? shift.clockIn : shift.clockOut

    if (!time && field === 'clockOut') {
      return (
        <div
          className="cursor-pointer rounded p-1 text-center text-gray-400 hover:bg-gray-100"
          onClick={() => onCellClick(shift, field)}
          title="Cliquez pour ajouter l'heure de fin"
        >
          --:--
        </div>
      )
    }

    if (isEditing) {
      return (
        <Input
          type="time"
          value={editValue}
          onChange={(e) => onEditValueChange(e.target.value)}
          onBlur={onCellSave}
          onKeyDown={onKeyDown}
          className="h-8 w-12 p-1 text-sm [&::-webkit-calendar-picker-indicator]:hidden"
          autoFocus
        />
      )
    }

    return (
      <div
        className="cursor-pointer rounded p-1 transition-colors hover:bg-blue-50"
        onClick={() => onCellClick(shift, field)}
        title={`Cliquez pour modifier l'heure ${field === 'clockIn' ? "d'arrivee" : 'de depart'}`}
      >
        {formatTime(time)}
      </div>
    )
  }

  return (
    <div
      className={`text-sm ${
        hasError
          ? 'font-medium text-red-700'
          : isActive
            ? 'font-medium text-green-700'
            : ''
      }`}
    >
      <div className="flex items-center justify-center gap-2">
        <div className="flex items-center gap-1">
          {renderEditableTime('clockIn')}
          <span className="px-1">-</span>
          {renderEditableTime('clockOut')}
        </div>
        {shift.justificationNote && (
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="cursor-pointer text-orange-500 transition-colors hover:text-orange-600">
                  <MessageSquareMore className="h-4 w-4" />
                </div>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs border border-orange-500">
                <p className="whitespace-pre-wrap text-base">
                  {shift.justificationNote}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        <button
          onClick={() => onDeleteShift(shift.id)}
          className="rounded p-1 text-red-600 transition-colors hover:bg-red-50 hover:text-red-700"
          title="Supprimer ce shift"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
      {shift.status === 'active' && !hasError && (
        <div className="mt-1 flex justify-center">
          <Badge className="bg-green-100 text-xs text-green-800">
            <div className="mr-1 h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" />
            En cours
          </Badge>
        </div>
      )}
      {hasError && (
        <div className="mt-1 flex justify-center">
          <Badge
            className="bg-red-100 text-xs text-red-800"
            title={shift.errorMessage}
          >
            <div className="mr-1 h-1.5 w-1.5 rounded-full bg-red-500" />
            Erreur
          </Badge>
        </div>
      )}
    </div>
  )
}
