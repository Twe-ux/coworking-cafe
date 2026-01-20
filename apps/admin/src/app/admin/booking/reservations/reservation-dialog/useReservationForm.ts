// Hook personnalisé pour la logique du formulaire de réservation

import { useState, useEffect, useCallback } from "react"
import type { Booking, BookingStatus, ReservationType, SpaceConfiguration } from "@/types/booking"
import type { ReservationFormData } from "./types"
import { calculateReservationPrice, getInitialFormData, bookingToFormData } from "./utils"

interface UseReservationFormOptions {
  open: boolean
  booking?: Booking | null
  spaces: SpaceConfiguration[]
}

interface UseReservationFormReturn {
  formData: ReservationFormData
  loading: boolean
  updateField: (field: keyof ReservationFormData, value: string | number | BookingStatus | ReservationType) => void
  handleSubmit: (e: React.FormEvent, onSuccess: () => void, onOpenChange: (open: boolean) => void) => Promise<void>
}

/**
 * Hook pour gérer la logique du formulaire de réservation
 */
export function useReservationForm({ open, booking, spaces }: UseReservationFormOptions): UseReservationFormReturn {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<ReservationFormData>(getInitialFormData())

  // Initialiser/réinitialiser le formulaire quand le dialog s'ouvre
  useEffect(() => {
    if (booking && open) {
      setFormData(bookingToFormData(booking))
    } else if (!booking && open) {
      setFormData(getInitialFormData())
    }
  }, [booking, open])

  // Recalculer le prix quand les données changent
  useEffect(() => {
    const selectedSpace = spaces.find((s) => s._id === formData.spaceId)
    const newPrice = calculateReservationPrice(
      selectedSpace,
      formData.reservationType,
      formData.numberOfPeople
    )
    setFormData((prev) => ({ ...prev, totalPrice: newPrice }))
  }, [formData.spaceId, formData.reservationType, formData.numberOfPeople, spaces])

  // Mettre à jour un champ du formulaire
  const updateField = useCallback((field: keyof ReservationFormData, value: string | number | BookingStatus | ReservationType) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }, [])

  // Soumettre le formulaire
  const handleSubmit = useCallback(async (
    e: React.FormEvent,
    onSuccess: () => void,
    onOpenChange: (open: boolean) => void
  ) => {
    e.preventDefault()
    setLoading(true)

    try {
      const selectedSpace = spaces.find((s) => s._id === formData.spaceId)
      const payload = {
        ...formData,
        spaceName: selectedSpace?.name,
        clientId: "000000000000000000000000", // TODO: Implémenter recherche utilisateur
      }

      const url = booking
        ? `/api/booking/reservations/${booking._id}`
        : "/api/booking/reservations"
      const method = booking ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (response.ok) {
        onSuccess()
        onOpenChange(false)
      } else {
        alert(data.error || "Erreur lors de l'enregistrement")
      }
    } catch (error) {
      alert("Erreur lors de l'enregistrement")
    } finally {
      setLoading(false)
    }
  }, [formData, booking, spaces])

  return {
    formData,
    loading,
    updateField,
    handleSubmit,
  }
}
