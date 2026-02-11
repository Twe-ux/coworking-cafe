'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Trash2, MessageSquareMore, AlertTriangle } from 'lucide-react'
import { JustificationReadDialog } from '@/components/clocking/JustificationReadDialog'
import { toast } from 'sonner'
import { triggerSidebarRefresh } from '@/lib/events/sidebar-refresh'
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
  onJustificationRead?: () => void
  onEmptyClick?: () => void
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
  onJustificationRead,
  onEmptyClick,
}: TimeEntryShiftCellProps) {
  const [showJustificationDialog, setShowJustificationDialog] = useState(false)
  const [isMarkingRead, setIsMarkingRead] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  if (!shift) {
    return (
      <button
        className="w-full cursor-pointer rounded py-2 text-center text-gray-400 transition-colors hover:bg-blue-50 hover:text-blue-500"
        onClick={onEmptyClick}
        title="Cliquer pour ajouter un shift"
      >
        --
      </button>
    )
  }

  const hasError = shift.hasError === true
  const hasJustification = !!shift.justificationNote
  const isJustificationRead = shift.justificationRead === true

  const handleJustificationClick = () => {
    if (hasJustification) {
      setShowJustificationDialog(true)
    }
  }

  const handleMarkAsRead = async () => {
    setIsMarkingRead(true)
    toast.loading('Marquage comme lu...', { id: 'mark-read' })

    try {
      const response = await fetch(`/api/time-entries/${shift.id}/mark-justification-read`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
      })

      const result = await response.json()

      if (result.success) {
        toast.success('Justification marquée comme lue', { id: 'mark-read' })
        setShowJustificationDialog(false)

        // Refresh list
        if (onJustificationRead) {
          onJustificationRead()
        }

        // Trigger sidebar badge refresh
        triggerSidebarRefresh()
      } else {
        toast.error(result.error || 'Erreur lors du marquage', { id: 'mark-read' })
      }
    } catch (error) {
      toast.error('Erreur de connexion', { id: 'mark-read' })
    } finally {
      setIsMarkingRead(false)
    }
  }

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
        <button
          onClick={() => setShowDeleteDialog(true)}
          className="rounded p-1 text-red-600 transition-colors hover:bg-red-50 hover:text-red-700"
          title="Supprimer ce shift"
        >
          <Trash2 className="h-4 w-4" />
        </button>
        {/* Always render button to maintain alignment, but make invisible if no justification */}
        <button
          onClick={hasJustification ? handleJustificationClick : undefined}
          disabled={!hasJustification}
          className={`rounded p-1 transition-colors ${
            !hasJustification
              ? 'invisible cursor-default'
              : isJustificationRead
                ? 'text-green-600 hover:bg-green-50 hover:text-green-700'
                : 'text-orange-500 hover:bg-orange-50 hover:text-orange-600'
          }`}
          title={hasJustification ? (isJustificationRead ? 'Justification lue' : 'Cliquez pour lire la justification') : ''}
        >
          <MessageSquareMore className="h-4 w-4" />
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

      {/* Justification Read Dialog */}
      {hasJustification && (
        <JustificationReadDialog
          open={showJustificationDialog}
          onClose={() => setShowJustificationDialog(false)}
          onConfirmRead={handleMarkAsRead}
          isLoading={isMarkingRead}
          justificationNote={shift.justificationNote!}
          clockIn={shift.clockIn}
          clockOut={shift.clockOut}
          date={shift.date}
          employeeName={shift.employee?.fullName || 'Employé inconnu'}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Supprimer ce shift
            </AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer ce shift ({shift.clockIn} - {shift.clockOut || '--:--'}) ?
              Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => onDeleteShift(shift.id)}
              className="bg-red-600 hover:bg-red-700"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
