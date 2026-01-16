'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, Edit2, Plus, Trash2 } from 'lucide-react'
import { SHIFT_TYPES } from './ShiftModal'
import type { Shift } from '@/types/shift'

interface DayShiftsModalProps {
  open: boolean
  onClose: () => void
  date: Date | string
  shifts: Shift[]
  onEditShift: (shift: Shift) => void
  onDeleteShift: (shiftId: string) => Promise<{ success: boolean; error?: string }>
  onAddShift: () => void
}

export function DayShiftsModal({
  open,
  onClose,
  date,
  shifts,
  onEditShift,
  onDeleteShift,
  onAddShift,
}: DayShiftsModalProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Handle both Date objects and string dates
  const dateObj = typeof date === 'string' ? new Date(date + 'T12:00:00') : date
  const formattedDate = dateObj.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  const handleDelete = async (shiftId: string) => {
    if (!confirm('Voulez-vous vraiment supprimer ce créneau ?')) return

    setDeletingId(shiftId)
    const result = await onDeleteShift(shiftId)
    setDeletingId(null)

    if (result.success) {
      // Close modal after successful deletion
      onClose()
    } else {
      alert(result.error || 'Erreur lors de la suppression')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Gérer les créneaux - {formattedDate}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {shifts.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <p>Aucun créneau pour ce jour</p>
            </div>
          ) : (
            shifts.map((shift) => {
              const shiftType = SHIFT_TYPES[shift.type as keyof typeof SHIFT_TYPES]
              const isDeleting = deletingId === shift.id

              return (
                <Card key={shift.id} className="border border-gray-200">
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <div
                            className="flex h-full w-full items-center justify-center text-sm font-semibold text-white"
                            style={{
                              backgroundColor: shift.employee?.color || '#9CA3AF',
                            }}
                          >
                            {shift.employee?.firstName?.charAt(0)}
                            {shift.employee?.lastName?.charAt(0)}
                          </div>
                        </Avatar>
                        <div>
                          <div className="font-medium">
                            {shift.employee?.firstName} {shift.employee?.lastName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {shift.employee?.employeeRole || 'Employé polyvalent'}
                          </div>
                        </div>
                        <Badge variant="secondary" className="capitalize">
                          {shiftType?.label || shift.type}
                        </Badge>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock className="h-4 w-4" />
                          {shift.startTime} - {shift.endTime}
                        </div>
                        {shift.location && (
                          <span className="text-xs text-gray-500">
                            📍 {shift.location}
                          </span>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onEditShift(shift)}
                          disabled={isDeleting}
                          className="h-8 w-8 p-0"
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(shift.id)}
                          disabled={isDeleting}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Fermer
          </Button>
          <Button onClick={onAddShift} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Ajouter un créneau
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
