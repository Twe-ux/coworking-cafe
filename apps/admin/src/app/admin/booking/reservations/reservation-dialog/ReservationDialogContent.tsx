"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ClientInfoSection } from "./ClientInfoSection"
import { SpaceSelectionSection } from "./SpaceSelectionSection"
import { DateTimeSection } from "./DateTimeSection"
import { PricingSection } from "./PricingSection"
import { ReservationStatusSection } from "./ReservationStatusSection"
import { useReservationForm } from "./useReservationForm"
import { useSpaces } from "./useSpaces"
import type { ReservationDialogProps } from "./types"

/**
 * Contenu principal du dialog de réservation
 */
export function ReservationDialogContent({
  open,
  onOpenChange,
  booking,
  onSuccess,
}: ReservationDialogProps) {
  const { spaces } = useSpaces()
  const { formData, loading, updateField, handleSubmit } = useReservationForm({
    open,
    booking,
    spaces,
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {booking ? "Modifier la réservation" : "Nouvelle réservation"}
          </DialogTitle>
          <DialogDescription>Gestion des réservations clients</DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => handleSubmit(e, onSuccess, onOpenChange)}
          className="space-y-4"
        >
          <ClientInfoSection formData={formData} onChange={updateField} />

          <SpaceSelectionSection
            formData={formData}
            spaces={spaces}
            onChange={updateField}
          />

          <DateTimeSection formData={formData} onChange={updateField} />

          <ReservationStatusSection formData={formData} onChange={updateField} />

          <PricingSection formData={formData} onChange={updateField} />

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
