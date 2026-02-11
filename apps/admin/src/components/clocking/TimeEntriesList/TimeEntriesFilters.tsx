'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ChevronLeft, ChevronRight, Filter } from 'lucide-react'
import type { Employee } from '@/hooks/useEmployees'
import type { TimeEntriesFilters as FiltersType } from './types'

interface TimeEntriesFiltersProps {
  filters: FiltersType
  availableEmployees: Employee[]
  availableDates: string[]
  onFilterChange: (key: string, value: string) => void
  onClearFilters: () => void
  currentDate?: Date
  onPreviousMonth?: () => void
  onNextMonth?: () => void
  onToday?: () => void
}

export function TimeEntriesFilters({
  filters,
  availableEmployees,
  availableDates,
  onFilterChange,
  onClearFilters,
  currentDate,
  onPreviousMonth,
  onNextMonth,
  onToday,
}: TimeEntriesFiltersProps) {
  const monthLabel = currentDate
    ? currentDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
    : ''

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Filter className="h-4 w-4" />
            Filtres
          </CardTitle>
          {currentDate && (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={onPreviousMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={onToday} className="min-w-[160px] capitalize">
                {monthLabel}
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={onNextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex justify-between">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Employee filter */}
          <div>
            <Label htmlFor="employee-select">Employe (avec pointages)</Label>
            <Select
              value={filters.employeeId}
              onValueChange={(value) => onFilterChange('employeeId', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Tous les employes avec pointages" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  Tous les employes avec pointages
                </SelectItem>
                {availableEmployees.map((employee) => (
                  <SelectItem key={employee.id} value={employee.id}>
                    <div className="flex items-center gap-2">
                      <div
                        className={`h-2 w-2 rounded-full ${employee.color}`}
                      />
                      {employee.firstName} {employee.lastName}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date filter */}
          <div>
            <Label htmlFor="specific-date">
              Date specifique (avec pointages)
            </Label>
            <Select
              value={
                filters.startDate && filters.startDate === filters.endDate
                  ? filters.startDate
                  : ''
              }
              onValueChange={(value) => {
                if (value) {
                  onFilterChange('startDate', value)
                  onFilterChange('endDate', value)
                } else {
                  onFilterChange('startDate', '')
                  onFilterChange('endDate', '')
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Toutes les dates avec pointages" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  Toutes les dates avec pointages
                </SelectItem>
                {availableDates.map((date) => (
                  <SelectItem key={date} value={date}>
                    {(() => {
                      const [year, month, day] = date.split('-').map(Number)
                      const dateObj = new Date(year, month - 1, day)
                      return dateObj.toLocaleDateString('fr-FR', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })
                    })()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status filter */}
          <div>
            <Label htmlFor="status-select">Statut</Label>
            <Select
              value={filters.status}
              onValueChange={(value) => onFilterChange('status', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Tous les statuts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="active">En cours</SelectItem>
                <SelectItem value="completed">Termine</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <Button variant="destructive" size="sm" onClick={onClearFilters}>
            Effacer les filtres
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
