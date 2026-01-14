import { useState, useEffect } from 'react'
import type { Employee } from '@/types/hr'

export function useDrafts() {
  const [drafts, setDrafts] = useState<Employee[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchDrafts = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/hr/employees?includeDrafts=true')
      const data = await response.json()

      if (data.success) {
        // Filtrer uniquement les brouillons
        const draftsOnly = data.data.filter((emp: Employee) => emp.isDraft)
        setDrafts(draftsOnly)
      } else {
        setError(data.error || 'Erreur lors du chargement')
      }
    } catch (err: any) {
      setError(err.message || 'Erreur réseau')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDrafts()
  }, [])

  return {
    drafts,
    loading,
    error,
    refetch: fetchDrafts,
  }
}
