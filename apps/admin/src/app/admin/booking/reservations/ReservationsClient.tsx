"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Calendar,
  Plus,
  Edit,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Filter,
} from "lucide-react"
import { ReservationsSkeleton } from "./ReservationsSkeleton"
import { ReservationDialog } from "./ReservationDialog"
import type { Booking, BookingStatus } from "@/types/booking"
import {
  getStatusLabel,
  getStatusVariant,
  getReservationTypeLabel,
  formatDate,
  formatPrice,
} from "./utils"

export function ReservationsClient() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [statusFilter, setStatusFilter] = useState<BookingStatus | "all">("all")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)

  useEffect(() => {
    fetchBookings()
  }, [statusFilter])

  const fetchBookings = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (statusFilter !== "all") {
        params.set("status", statusFilter)
      }

      const response = await fetch(`/api/booking/reservations?${params}`)
      const data = await response.json()

      if (data.success) {
        setBookings(data.data || [])
      } else {
        setMessage({ type: "error", text: data.error || "Erreur lors du chargement" })
      }
    } catch (error) {
      setMessage({ type: "error", text: "Erreur lors du chargement des réservations" })
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setSelectedBooking(null)
    setDialogOpen(true)
  }

  const handleEdit = (booking: Booking) => {
    setSelectedBooking(booking)
    setDialogOpen(true)
  }

  const handleDelete = async (bookingId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette réservation ?")) {
      return
    }

    try {
      const response = await fetch(`/api/booking/reservations/${bookingId}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (response.ok) {
        setMessage({ type: "success", text: "Réservation supprimée avec succès" })
        fetchBookings()
      } else {
        setMessage({ type: "error", text: data.error || "Erreur lors de la suppression" })
      }
    } catch (error) {
      setMessage({ type: "error", text: "Erreur lors de la suppression" })
    }
  }

  const handleDialogSuccess = () => {
    setMessage({
      type: "success",
      text: selectedBooking ? "Réservation mise à jour" : "Réservation créée",
    })
    fetchBookings()
  }

  if (loading) {
    return <ReservationsSkeleton />
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Calendar className="w-8 h-8" />
            Réservations
          </h1>
          <p className="text-muted-foreground mt-2">
            Gérer les réservations clients
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle réservation
        </Button>
      </div>

      <ReservationDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        booking={selectedBooking}
        onSuccess={handleDialogSuccess}
      />

      {message && (
        <Alert variant={message.type === "success" ? "default" : "destructive"}>
          {message.type === "success" ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      <div className="flex gap-2 items-center">
        <Filter className="w-4 h-4 text-muted-foreground" />
        <Button
          variant={statusFilter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("all")}
        >
          Toutes
        </Button>
        <Button
          variant={statusFilter === "pending" ? "default" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("pending")}
        >
          En attente
        </Button>
        <Button
          variant={statusFilter === "confirmed" ? "default" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("confirmed")}
        >
          Confirmées
        </Button>
        <Button
          variant={statusFilter === "cancelled" ? "default" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("cancelled")}
        >
          Annulées
        </Button>
      </div>

      {bookings.length === 0 ? (
        <Alert>
          <AlertDescription>
            Aucune réservation trouvée.
          </AlertDescription>
        </Alert>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Liste des réservations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {bookings.map((booking) => (
              <div
                key={booking._id}
                className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{booking.spaceName}</span>
                    <Badge variant={getStatusVariant(booking.status)}>
                      {getStatusLabel(booking.status)}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {booking.clientName} • {booking.clientEmail}
                  </div>
                  <div className="text-sm">
                    {formatDate(booking.startDate)} - {formatDate(booking.endDate)} •{" "}
                    {getReservationTypeLabel(booking.reservationType)} •{" "}
                    {booking.numberOfPeople} pers.
                    {booking.startTime && ` • ${booking.startTime}`}
                    {booking.endTime && ` - ${booking.endTime}`}
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-semibold">{formatPrice(booking.totalPrice)}</div>
                  {booking.depositPaid && (
                    <div className="text-sm text-muted-foreground">
                      Acompte : {formatPrice(booking.depositPaid)}
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(booking)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => booking._id && handleDelete(booking._id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
