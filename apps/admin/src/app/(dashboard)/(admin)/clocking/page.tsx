'use client'

import { useState, useEffect, useCallback } from 'react'
import TimeEntriesList from '@/components/clocking/TimeEntriesList'
import { Button } from '@/components/ui/button'
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react'

interface Employee {
  id: string
  firstName: string
  lastName: string
  fullName: string
  role: string
  color: string
  isActive: boolean
}

export default function ClockingAdminPage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [currentDate, setCurrentDate] = useState(new Date())
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch active employees
  const fetchEmployees = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/hr/employees?status=active')
      const result = await response.json()

      if (result.success) {
        setEmployees(result.data || [])
      } else {
        setError(result.error || 'Erreur lors de la récupération des employés')
      }
    } catch (error) {
      console.error('Error fetching employees:', error)
      setError('Erreur de connexion')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchEmployees()
  }, [fetchEmployees])

  const handlePreviousMonth = () => {
    setCurrentDate((prevDate) => {
      const newDate = new Date(prevDate)
      newDate.setMonth(newDate.getMonth() - 1)
      return newDate
    })
  }

  const handleNextMonth = () => {
    setCurrentDate((prevDate) => {
      const newDate = new Date(prevDate)
      newDate.setMonth(newDate.getMonth() + 1)
      return newDate
    })
  }

  const handleToday = () => {
    setCurrentDate(new Date())
  }

  if (isLoading) {
    return (
      <div className="flex h-[600px] items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Chargement...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-[600px] items-center justify-center">
        <div className="text-center">
          <p className="text-red-500">{error}</p>
          <button
            onClick={fetchEmployees}
            className="mt-4 rounded bg-primary px-4 py-2 text-white hover:bg-primary/90"
          >
            Réessayer
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Récapitulatif des pointages</h1>
          <p className="text-gray-600">
            Visualisez et gérez les pointages de tous les employés
          </p>
        </div>

        {/* Date Navigation */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handlePreviousMonth}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            onClick={handleToday}
            className="min-w-[200px]"
          >
            <Calendar className="mr-2 h-4 w-4" />
            {currentDate.toLocaleDateString('fr-FR', {
              month: 'long',
              year: 'numeric',
            })}
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={handleNextMonth}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Time Entries List */}
      {employees.length > 0 ? (
        <TimeEntriesList
          employees={employees}
          currentDate={currentDate}
        />
      ) : (
        <div className="flex h-[400px] items-center justify-center rounded-lg border">
          <div className="text-center text-muted-foreground">
            <Calendar className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-4">Aucun employé actif</p>
            <p className="mt-1 text-sm">
              Ajoutez des employés depuis la section RH
            </p>
          </div>
        </div>
      )}

      {/* Info message */}
      <div className="rounded-lg bg-blue-50 p-4">
        <p className="text-sm text-blue-900">
          <strong>Note :</strong> Vous pouvez modifier les heures de pointage en cliquant sur les cellules.
          Les modifications sont enregistrées automatiquement.
        </p>
      </div>
    </div>
  )
}
