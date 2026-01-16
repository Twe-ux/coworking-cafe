'use client'

import { useState } from 'react'
import { useAvailabilities } from '@/hooks/useAvailabilities'
import { useEmployees } from '@/hooks/useEmployees'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Trash2, Edit2 } from 'lucide-react'
import { AvailabilityModal } from './AvailabilityModal'
import { toast } from 'sonner'
import { DAYS_OF_WEEK } from '@/types/availability'
import type { Availability } from '@/types/availability'

export function AvailabilityTab() {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingAvailability, setEditingAvailability] = useState<Availability | null>(null)

  const { employees } = useEmployees({ status: 'active' })
  const { availabilities, isLoading, deleteAvailability, refreshAvailabilities } =
    useAvailabilities({
      employeeId: selectedEmployeeId === 'all' ? undefined : selectedEmployeeId,
      active: true,
    })

  // Group availabilities by employee
  const availabilitiesByEmployee = availabilities.reduce((acc, av) => {
    if (!acc[av.employeeId]) {
      acc[av.employeeId] = []
    }
    acc[av.employeeId].push(av)
    return acc
  }, {} as Record<string, Availability[]>)

  const handleAdd = () => {
    setEditingAvailability(null)
    setModalOpen(true)
  }

  const handleEdit = (availability: Availability) => {
    setEditingAvailability(availability)
    setModalOpen(true)
  }

  const handleDelete = async (availability: Availability) => {
    if (
      !confirm(
        `Supprimer la disponibilité ${availability.employee?.fullName} le ${availability.dayOfWeekLabel} ?`
      )
    )
      return

    const result = await deleteAvailability(availability.id)
    if (result.success) {
      toast.success('Disponibilité supprimée')
    } else {
      toast.error(result.error || 'Erreur lors de la suppression')
    }
  }

  const handleModalClose = (success?: boolean) => {
    setModalOpen(false)
    setEditingAvailability(null)
    if (success) {
      refreshAvailabilities()
      toast.success(
        editingAvailability
          ? 'Disponibilité modifiée'
          : 'Disponibilité ajoutée'
      )
    }
  }

  // Filter employees to show
  const employeesToShow =
    selectedEmployeeId === 'all'
      ? employees.filter((emp) => availabilitiesByEmployee[emp.id]?.length > 0)
      : employees.filter((emp) => emp.id === selectedEmployeeId)

  return (
    <div className="space-y-6">
      {/* Header with controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Disponibilités hebdomadaires</h2>
          <p className="text-sm text-muted-foreground">
            Gérez les créneaux horaires disponibles pour chaque employé
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filtrer par employé" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les employés</SelectItem>
              {employees.map((emp) => (
                <SelectItem key={emp.id} value={emp.id}>
                  {emp.fullName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button onClick={handleAdd}>
            <Plus className="h-4 w-4 mr-2" />
            Ajouter
          </Button>
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
            <p className="mt-2 text-sm text-muted-foreground">Chargement...</p>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && employeesToShow.length === 0 && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <p className="text-muted-foreground">
                {selectedEmployeeId === 'all'
                  ? 'Aucune disponibilité configurée'
                  : 'Aucune disponibilité pour cet employé'}
              </p>
              <Button variant="outline" className="mt-4" onClick={handleAdd}>
                <Plus className="h-4 w-4 mr-2" />
                Ajouter une disponibilité
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Availabilities by employee */}
      {!isLoading &&
        employeesToShow.map((employee) => {
          const employeeAvailabilities = availabilitiesByEmployee[employee.id] || []

          // Group by day of week
          const availabilitiesByDay = employeeAvailabilities.reduce((acc, av) => {
            if (!acc[av.dayOfWeek]) {
              acc[av.dayOfWeek] = []
            }
            acc[av.dayOfWeek].push(av)
            return acc
          }, {} as Record<number, Availability[]>)

          return (
            <Card key={employee.id}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Avatar style={{ backgroundColor: employee.color }}>
                    <AvatarFallback className="text-white font-semibold">
                      {employee.firstName[0]}
                      {employee.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{employee.fullName}</CardTitle>
                    <CardDescription className="capitalize">
                      {employee.employeeRole}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-2">
                  {DAYS_OF_WEEK.map((day) => {
                    const dayAvailabilities = availabilitiesByDay[day.value] || []

                    return (
                      <div
                        key={day.value}
                        className="border rounded-lg p-3 min-h-[120px]"
                      >
                        <div className="text-xs font-semibold text-center mb-2 text-muted-foreground">
                          {day.short}
                        </div>

                        <div className="space-y-1">
                          {dayAvailabilities.length === 0 ? (
                            <div className="text-center text-xs text-muted-foreground py-4">
                              -
                            </div>
                          ) : (
                            dayAvailabilities.map((av) => (
                              <div
                                key={av.id}
                                className="group relative bg-primary/10 hover:bg-primary/20 rounded p-1.5 transition-colors"
                              >
                                <div className="text-xs font-medium text-center">
                                  {av.startTime}
                                </div>
                                <div className="text-xs text-center text-muted-foreground">
                                  {av.endTime}
                                </div>

                                {/* Hover actions */}
                                <div className="absolute inset-0 bg-black/60 rounded opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-6 w-6 text-white hover:bg-white/20"
                                    onClick={() => handleEdit(av)}
                                  >
                                    <Edit2 className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-6 w-6 text-white hover:bg-white/20"
                                    onClick={() => handleDelete(av)}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )
        })}

      {/* Modal */}
      <AvailabilityModal
        open={modalOpen}
        onClose={handleModalClose}
        availability={editingAvailability}
        employees={employees}
      />
    </div>
  )
}
