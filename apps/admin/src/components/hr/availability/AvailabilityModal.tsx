'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useAvailabilities } from '@/hooks/useAvailabilities'
import { DAYS_OF_WEEK } from '@/types/availability'
import type { Availability, CreateAvailabilityInput } from '@/types/availability'
import type { Employee } from '@/types/hr'

interface AvailabilityModalProps {
  open: boolean
  onClose: (success?: boolean) => void
  availability?: Availability | null
  employees: Employee[]
}

export function AvailabilityModal({
  open,
  onClose,
  availability,
  employees,
}: AvailabilityModalProps) {
  const { createAvailability, updateAvailability } = useAvailabilities()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState<CreateAvailabilityInput>({
    employeeId: '',
    dayOfWeek: 1,
    startTime: '09:00',
    endTime: '18:00',
    isRecurring: true,
    notes: '',
  })

  // Reset form when modal opens/closes or availability changes
  useEffect(() => {
    if (open) {
      if (availability) {
        setFormData({
          employeeId: availability.employeeId,
          dayOfWeek: availability.dayOfWeek,
          startTime: availability.startTime,
          endTime: availability.endTime,
          isRecurring: availability.isRecurring,
          notes: availability.notes || '',
        })
      } else {
        setFormData({
          employeeId: employees[0]?.id || '',
          dayOfWeek: 1,
          startTime: '09:00',
          endTime: '18:00',
          isRecurring: true,
          notes: '',
        })
      }
      setError(null)
    }
  }, [open, availability, employees])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      let result

      if (availability) {
        // Update existing availability
        result = await updateAvailability(availability.id, {
          dayOfWeek: formData.dayOfWeek,
          startTime: formData.startTime,
          endTime: formData.endTime,
          isRecurring: formData.isRecurring,
          notes: formData.notes,
        })
      } else {
        // Create new availability
        result = await createAvailability(formData)
      }

      if (result.success) {
        onClose(true)
      } else {
        setError(result.error || 'Une erreur est survenue')
      }
    } catch (err) {
      setError('Erreur de connexion au serveur')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {availability ? 'Modifier la disponibilité' : 'Ajouter une disponibilité'}
            </DialogTitle>
            <DialogDescription>
              Définissez les créneaux horaires où l'employé est disponible
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {error && (
              <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
                {error}
              </div>
            )}

            {/* Employee selection - only when creating */}
            {!availability && (
              <div className="space-y-2">
                <Label htmlFor="employeeId">Employé *</Label>
                <Select
                  value={formData.employeeId}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, employeeId: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un employé" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((emp) => (
                      <SelectItem key={emp.id} value={emp.id}>
                        {emp.fullName} - {emp.role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Day of week */}
            <div className="space-y-2">
              <Label htmlFor="dayOfWeek">Jour de la semaine *</Label>
              <Select
                value={String(formData.dayOfWeek)}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, dayOfWeek: parseInt(value) as 0 | 1 | 2 | 3 | 4 | 5 | 6 }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un jour" />
                </SelectTrigger>
                <SelectContent>
                  {DAYS_OF_WEEK.map((day) => (
                    <SelectItem key={day.value} value={String(day.value)}>
                      {day.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Time range */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime">Heure de début *</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, startTime: e.target.value }))
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endTime">Heure de fin *</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={formData.endTime}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, endTime: e.target.value }))
                  }
                  required
                />
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optionnel)</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, notes: e.target.value }))
                }
                placeholder="Informations complémentaires..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onClose()}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading
                ? 'Enregistrement...'
                : availability
                  ? 'Modifier'
                  : 'Ajouter'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
