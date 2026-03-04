'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ChevronLeft, ChevronRight } from 'lucide-react'
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
      <CardContent className="flex items-center gap-4 p-5">
        {/* Month navigation */}
        {currentDate && (
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 border-gray-300 text-gray-700 hover:border-green-500 hover:bg-green-50 hover:text-green-700"
              onClick={onPreviousMonth}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onToday}
              className="min-w-[160px] capitalize border-gray-300 text-gray-700 hover:border-green-500 hover:bg-green-50 hover:text-green-700"
            >
              {monthLabel}
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 border-gray-300 text-gray-700 hover:border-green-500 hover:bg-green-50 hover:text-green-700"
              onClick={onNextMonth}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-1 items-center gap-4">
          {/* Employee filter */}
          <div className="flex-1">
            <Select
              value={filters.employeeId}
              onValueChange={(value) => onFilterChange('employeeId', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Tous les employés" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les employés</SelectItem>
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
          <div className="flex-1">
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
                <SelectValue placeholder="Toutes les dates" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les dates</SelectItem>
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
          <div className="flex-1">
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
                <SelectItem value="completed">Terminé</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Clear filters button */}
        <Button
          variant="outline"
          size="sm"
          onClick={onClearFilters}
          className="shrink-0 border-red-500 text-red-700 hover:bg-red-50 hover:text-red-700"
        >
          Effacer
        </Button>
      </CardContent>
    </Card>
  )
}
