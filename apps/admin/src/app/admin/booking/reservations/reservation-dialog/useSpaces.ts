// Hook pour charger la liste des espaces

import { useState, useEffect } from "react"
import type { SpaceConfiguration } from "@/types/booking"

interface UseSpacesReturn {
  spaces: SpaceConfiguration[]
  loading: boolean
  error: string | null
}

/**
 * Hook pour récupérer la liste des espaces disponibles
 */
export function useSpaces(): UseSpacesReturn {
  const [spaces, setSpaces] = useState<SpaceConfiguration[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchSpaces()
  }, [])

  const fetchSpaces = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch("/api/booking/spaces")
      const data = await response.json()

      if (data.success) {
        setSpaces(data.data || [])
      } else {
        setError(data.error || "Erreur lors du chargement des espaces")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue")
    } finally {
      setLoading(false)
    }
  }

  return { spaces, loading, error }
}
