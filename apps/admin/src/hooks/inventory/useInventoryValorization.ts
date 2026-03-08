import { useState, useEffect } from 'react'

interface ValorizationData {
  stockFinalValue: number
  consumptionValue: number
  totalValue: number
  entryId: string
  entryDate: string
  entryTitle: string
}

export function useInventoryValorization(entryId: string | null) {
  const [valorization, setValorization] = useState<ValorizationData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!entryId) {
      setValorization(null)
      return
    }

    const fetchValorization = async () => {
      setLoading(true)
      setError(null)

      try {
        const res = await fetch(`/api/inventory/entries/${entryId}/valorization`)
        const data = await res.json()

        if (data.success && data.data) {
          setValorization(data.data)
        } else {
          setError(data.error || 'Erreur lors du chargement de la valorisation')
        }
      } catch (err) {
        console.error('Error fetching valorization:', err)
        setError('Erreur réseau')
      } finally {
        setLoading(false)
      }
    }

    fetchValorization()
  }, [entryId])

  return { valorization, loading, error }
}
