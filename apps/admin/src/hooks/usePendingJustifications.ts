import { useEffect, useState } from 'react'

/**
 * Hook pour récupérer le nombre de pointages avec justification en attente
 * Utilisé pour afficher les badges d'alerte dans la sidebar et clocking-admin
 */
export function usePendingJustifications() {
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCount = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/time-entries/pending-justifications', {
        cache: 'no-store',
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération')
      }

      const data = await response.json()

      if (data.success && data.data) {
        setCount(data.data.count || 0)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
      setCount(0)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCount()

    // Rafraîchir toutes les 30 secondes
    const interval = setInterval(fetchCount, 30000)

    return () => clearInterval(interval)
  }, [])

  return {
    count,
    loading,
    error,
    refetch: fetchCount,
  }
}
