"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Booking, ReservationType, BookingStatus, SpaceConfiguration } from "@/types/booking"

interface ReservationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  booking?: Booking | null
  onSuccess: () => void
}

export function ReservationDialog({ open, onOpenChange, booking, onSuccess }: ReservationDialogProps) {
  const [loading, setLoading] = useState(false)
  const [spaces, setSpaces] = useState<SpaceConfiguration[]>([])
  const [formData, setFormData] = useState({
    spaceId: "",
    clientName: "",
    clientEmail: "",
    reservationType: "daily" as ReservationType,
    startDate: "",
    endDate: "",
    startTime: "",
    endTime: "",
    numberOfPeople: 1,
    status: "pending" as BookingStatus,
    totalPrice: 0,
    depositPaid: 0,
    notes: "",
  })

  useEffect(() => {
    fetchSpaces()
  }, [])

  useEffect(() => {
    if (booking && open) {
      setFormData({
        spaceId: booking.spaceId,
        clientName: booking.clientName || "",
        clientEmail: booking.clientEmail || "",
        reservationType: booking.reservationType,
        startDate: booking.startDate,
        endDate: booking.endDate,
        startTime: booking.startTime || "",
        endTime: booking.endTime || "",
        numberOfPeople: booking.numberOfPeople,
        status: booking.status,
        totalPrice: booking.totalPrice,
        depositPaid: booking.depositPaid || 0,
        notes: booking.notes || "",
      })
    } else if (!booking && open) {
      // Reset pour création
      const today = new Date().toISOString().split("T")[0]
      setFormData({
        spaceId: "",
        clientName: "",
        clientEmail: "",
        reservationType: "daily",
        startDate: today,
        endDate: today,
        startTime: "09:00",
        endTime: "18:00",
        numberOfPeople: 1,
        status: "pending",
        totalPrice: 0,
        depositPaid: 0,
        notes: "",
      })
    }
  }, [booking, open])

  useEffect(() => {
    calculatePrice()
  }, [formData.spaceId, formData.reservationType, formData.startDate, formData.endDate, formData.numberOfPeople])

  const fetchSpaces = async () => {
    try {
      const response = await fetch("/api/booking/spaces")
      const data = await response.json()
      if (data.success) {
        setSpaces(data.data || [])
      }
    } catch (error) {
      console.error("Error fetching spaces:", error)
    }
  }

  const calculatePrice = () => {
    const selectedSpace = spaces.find((s) => s._id === formData.spaceId)
    if (!selectedSpace) {
      setFormData((prev) => ({ ...prev, totalPrice: 0 }))
      return
    }

    let price = 0
    switch (formData.reservationType) {
      case "hourly":
        price = selectedSpace.pricing.hourly * formData.numberOfPeople
        break
      case "daily":
        price = selectedSpace.pricing.daily * formData.numberOfPeople
        break
      case "weekly":
        price = selectedSpace.pricing.weekly * formData.numberOfPeople
        break
      case "monthly":
        price = selectedSpace.pricing.monthly * formData.numberOfPeople
        break
    }

    setFormData((prev) => ({ ...prev, totalPrice: price }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
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
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {booking ? "Modifier la réservation" : "Nouvelle réservation"}
          </DialogTitle>
          <DialogDescription>
            Gestion des réservations clients
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="clientName">Nom du client *</Label>
              <Input
                id="clientName"
                value={formData.clientName}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, clientName: e.target.value }))
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="clientEmail">Email du client *</Label>
              <Input
                id="clientEmail"
                type="email"
                value={formData.clientEmail}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, clientEmail: e.target.value }))
                }
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="spaceId">Espace *</Label>
            <Select
              value={formData.spaceId}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, spaceId: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un espace" />
              </SelectTrigger>
              <SelectContent>
                {spaces
                  .filter((space) => space.isActive)
                  .map((space) => (
                    <SelectItem key={space._id} value={space._id || ""}>
                      {space.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reservationType">Type de réservation *</Label>
            <Select
              value={formData.reservationType}
              onValueChange={(value: ReservationType) =>
                setFormData((prev) => ({ ...prev, reservationType: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hourly">Horaire</SelectItem>
                <SelectItem value="daily">Journée</SelectItem>
                <SelectItem value="weekly">Semaine</SelectItem>
                <SelectItem value="monthly">Mois</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Date de début *</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, startDate: e.target.value }))
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">Date de fin *</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, endDate: e.target.value }))
                }
                required
              />
            </div>
          </div>

          {formData.reservationType === "hourly" && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime">Heure de début</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, startTime: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endTime">Heure de fin</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={formData.endTime}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, endTime: e.target.value }))
                  }
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="numberOfPeople">Nombre de personnes *</Label>
            <Input
              id="numberOfPeople"
              type="number"
              min={1}
              value={formData.numberOfPeople}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  numberOfPeople: parseInt(e.target.value),
                }))
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Statut</Label>
            <Select
              value={formData.status}
              onValueChange={(value: BookingStatus) =>
                setFormData((prev) => ({ ...prev, status: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="confirmed">Confirmée</SelectItem>
                <SelectItem value="cancelled">Annulée</SelectItem>
                <SelectItem value="completed">Terminée</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="totalPrice">Prix total (€)</Label>
              <Input
                id="totalPrice"
                type="number"
                step="0.01"
                value={formData.totalPrice}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    totalPrice: parseFloat(e.target.value),
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="depositPaid">Acompte versé (€)</Label>
              <Input
                id="depositPaid"
                type="number"
                step="0.01"
                value={formData.depositPaid}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    depositPaid: parseFloat(e.target.value),
                  }))
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, notes: e.target.value }))
              }
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading
                ? "Enregistrement..."
                : booking
                ? "Mettre à jour"
                : "Créer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
