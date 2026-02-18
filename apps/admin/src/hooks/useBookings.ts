import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import type { Booking, BookingStatus } from "@/types/booking"

interface BookingFilters {
  status?: BookingStatus | "all"
  spaceId?: string
  clientId?: string
  startDate?: string
  endDate?: string
}

interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

/**
 * Hook pour récupérer les réservations avec cache automatique
 *
 * @param filters - Filtres optionnels (status, spaceId, etc.)
 * @returns { data, isLoading, error, refetch }
 *
 * @example
 * ```tsx
 * const { data: bookings, isLoading, error } = useBookings({ status: "confirmed" })
 * ```
 */
export function useBookings(filters?: BookingFilters) {
  return useQuery({
    queryKey: ["bookings", filters],
    queryFn: async () => {
      const params = new URLSearchParams()

      if (filters?.status && filters.status !== "all") {
        params.set("status", filters.status)
      }
      if (filters?.spaceId) {
        params.set("spaceId", filters.spaceId)
      }
      if (filters?.clientId) {
        params.set("clientId", filters.clientId)
      }
      if (filters?.startDate) {
        params.set("startDate", filters.startDate)
      }
      if (filters?.endDate) {
        params.set("endDate", filters.endDate)
      }

      const response = await fetch(`/api/booking/reservations?${params}`)
      const data: ApiResponse<Booking[]> = await response.json()

      if (!data.success) {
        throw new Error(data.error || "Erreur lors du chargement")
      }

      return data.data || []
    },
    // Options spécifiques (override les options globales si besoin)
    staleTime: 2 * 60 * 1000, // 2 minutes pour les bookings (données qui changent souvent)
    gcTime: 10 * 60 * 1000, // 10 minutes en cache
  })
}

/**
 * Hook pour supprimer une réservation avec invalidation du cache
 *
 * @example
 * ```tsx
 * const deleteBooking = useDeleteBooking()
 *
 * const handleDelete = async (id: string) => {
 *   await deleteBooking.mutateAsync(id)
 *   toast.success("Réservation supprimée")
 * }
 * ```
 */
export function useDeleteBooking() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (bookingId: string) => {
      const response = await fetch(`/api/booking/reservations/${bookingId}`, {
        method: "DELETE",
      })

      const data: ApiResponse<unknown> = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Erreur lors de la suppression")
      }

      return data
    },
    onSuccess: () => {
      // Invalider le cache des bookings pour re-fetch
      queryClient.invalidateQueries({ queryKey: ["bookings"] })
    },
  })
}

/**
 * Hook pour créer/modifier une réservation avec invalidation du cache
 *
 * @example
 * ```tsx
 * const saveBooking = useSaveBooking()
 *
 * const handleSubmit = async (formData: BookingFormData) => {
 *   await saveBooking.mutateAsync({ id: booking?._id, data: formData })
 *   toast.success("Réservation enregistrée")
 * }
 * ```
 */
export function useSaveBooking() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id?: string; data: Partial<Booking> }) => {
      const url = id
        ? `/api/booking/reservations/${id}`
        : `/api/booking/reservations`

      const response = await fetch(url, {
        method: id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      const result: ApiResponse<Booking> = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Erreur lors de l'enregistrement")
      }

      return result.data
    },
    onSuccess: () => {
      // Invalider le cache des bookings pour re-fetch
      queryClient.invalidateQueries({ queryKey: ["bookings"] })
    },
  })
}

/**
 * Hook pour valider une réservation (changer status → confirmed)
 *
 * @example
 * ```tsx
 * const confirmBooking = useConfirmBooking()
 *
 * const handleConfirm = async (id: string) => {
 *   await confirmBooking.mutateAsync(id)
 *   toast.success("Réservation confirmée")
 * }
 * ```
 */
export function useConfirmBooking() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (bookingId: string) => {
      const response = await fetch(`/api/booking/reservations/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "confirmed" }),
      })

      const data: ApiResponse<Booking> = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Erreur lors de la confirmation")
      }

      return data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] })
    },
  })
}

/**
 * Hook pour annuler une réservation (changer status → cancelled)
 *
 * @example
 * ```tsx
 * const cancelBooking = useCancelBooking()
 *
 * const handleCancel = async (id: string, reason: string) => {
 *   await cancelBooking.mutateAsync({ bookingId: id, reason })
 *   toast.success("Réservation annulée")
 * }
 * ```
 */
export function useCancelBooking() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      bookingId,
      reason,
      skipCapture
    }: {
      bookingId: string;
      reason: string;
      skipCapture?: boolean;
    }) => {
      const response = await fetch(`/api/booking/reservations/${bookingId}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason, skipCapture }),
      })

      const data: ApiResponse<Booking> = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Erreur lors de l'annulation")
      }

      return data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] })
    },
  })
}

export function useMarkPresent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (bookingId: string) => {
      const response = await fetch(`/api/booking/reservations/${bookingId}/mark-present`, {
        method: "POST",
      })

      const data: ApiResponse<Booking> = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Erreur lors du marquage comme présent")
      }

      return data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] })
    },
  })
}

export function useMarkNoShow() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (bookingId: string) => {
      const response = await fetch(`/api/booking/reservations/${bookingId}/mark-noshow`, {
        method: "POST",
      })

      const data: ApiResponse<Booking> = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Erreur lors du marquage comme no-show")
      }

      return data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] })
    },
  })
}
