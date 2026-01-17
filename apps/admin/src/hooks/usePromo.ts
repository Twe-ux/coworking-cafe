'use client'

import { useState, useEffect, useCallback } from 'react'
import type {
  PromoConfig,
  CreatePromoCodeRequest,
  MarketingContent,
  ApiResponse,
} from '@/types/promo'

export type {
  PromoConfig,
  PromoCode,
  CreatePromoCodeRequest,
  MarketingContent,
} from '@/types/promo'

interface UsePromoReturn {
  promoData: PromoConfig | null
  loading: boolean
  error: string | null
  createPromoCode: (data: CreatePromoCodeRequest) => Promise<void>
  updateMarketing: (data: MarketingContent) => Promise<void>
  refetch: () => Promise<void>
}

export function usePromo(): UsePromoReturn {
  const [promoData, setPromoData] = useState<PromoConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPromoData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/promo')
      const result: ApiResponse<PromoConfig> = await response.json()

      if (result.success && result.data) {
        setPromoData(result.data)
        setError(null)
      } else {
        // Si 404 (pas de config), ne pas traiter comme une erreur
        if (response.status === 404) {
          setPromoData(null)
          setError(null)
        } else {
          setError(result.error || 'Erreur lors de la récupération des données promo')
          setPromoData(null)
        }
      }
    } catch (err) {
      console.error('Error usePromo fetchPromoData:', err)
      setError('Erreur de connexion au serveur')
      setPromoData(null)
    } finally {
      setLoading(false)
    }
  }, [])

  const createPromoCode = useCallback(
    async (data: CreatePromoCodeRequest): Promise<void> => {
      try {
        setError(null)

        const response = await fetch('/api/promo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })

        const result: ApiResponse<PromoConfig> = await response.json()

        if (result.success && result.data) {
          setPromoData(result.data)
          setError(null)
        } else {
          const errorMessage = result.error || 'Erreur lors de la création du code promo'
          setError(errorMessage)
          throw new Error(errorMessage)
        }
      } catch (err) {
        console.error('Error usePromo createPromoCode:', err)
        const errorMessage = err instanceof Error ? err.message : 'Erreur de connexion au serveur'
        setError(errorMessage)
        throw err
      }
    },
    []
  )

  const updateMarketing = useCallback(
    async (data: MarketingContent): Promise<void> => {
      try {
        setError(null)

        const response = await fetch('/api/promo/marketing', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })

        const result: ApiResponse<PromoConfig> = await response.json()

        if (result.success && result.data) {
          setPromoData(result.data)
          setError(null)
        } else {
          const errorMessage = result.error || 'Erreur lors de la mise à jour du marketing'
          setError(errorMessage)
          throw new Error(errorMessage)
        }
      } catch (err) {
        console.error('Error usePromo updateMarketing:', err)
        const errorMessage = err instanceof Error ? err.message : 'Erreur de connexion au serveur'
        setError(errorMessage)
        throw err
      }
    },
    []
  )

  useEffect(() => {
    fetchPromoData()
  }, [fetchPromoData])

  return {
    promoData,
    loading,
    error,
    createPromoCode,
    updateMarketing,
    refetch: fetchPromoData,
  }
}
