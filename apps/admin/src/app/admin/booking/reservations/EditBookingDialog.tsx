"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Booking } from "@/types/booking";

interface EditBookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  booking: Booking | null;
  onSuccess: () => void;
}

export function EditBookingDialog({
  open,
  onOpenChange,
  booking,
  onSuccess,
}: EditBookingDialogProps) {
  const [formData, setFormData] = useState({
    spaceName: "",
    startDate: "",
    startTime: "",
    endTime: "",
  });
  const [loading, setLoading] = useState(false);

  // Populate form when booking changes
  useEffect(() => {
    if (booking && open) {
      setFormData({
        spaceName: booking.spaceName || "",
        startDate: booking.startDate || "",
        startTime: booking.startTime || "",
        endTime: booking.endTime || "",
      });
    }
  }, [booking, open]);

  const handleClose = () => {
    setFormData({
      spaceName: "",
      startDate: "",
      startTime: "",
      endTime: "",
    });
    onOpenChange(false);
  };

  const handleSubmit = async () => {
    if (!booking?._id) return;

    setLoading(true);

    try {
      const response = await fetch(`/api/booking/reservations/${booking._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          spaceType: formData.spaceName,
          date: formData.startDate,
          startTime: formData.startTime,
          endTime: formData.endTime,
        }),
      });

      const result = await response.json();

      if (result.success) {
        onSuccess();
        handleClose();
      } else {
        console.error("Error updating booking:", result.error);
      }
    } catch (error) {
      console.error("Error updating booking:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Modifier la réservation</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="editSpace">Espace</Label>
            <Select
              value={formData.spaceName}
              onValueChange={(value) =>
                setFormData({ ...formData, spaceName: value })
              }
            >
              <SelectTrigger id="editSpace">
                <SelectValue placeholder="Sélectionner un espace" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="open-space">Open Space</SelectItem>
                <SelectItem value="salle-verriere">Salle Verrière</SelectItem>
                <SelectItem value="salle-etage">Salle Étage</SelectItem>
                <SelectItem value="evenementiel">Événementiel</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="editDate">Date</Label>
            <Input
              id="editDate"
              type="date"
              value={formData.startDate}
              onChange={(e) =>
                setFormData({ ...formData, startDate: e.target.value })
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="editStartTime">Heure de début</Label>
              <Input
                id="editStartTime"
                type="time"
                value={formData.startTime}
                onChange={(e) =>
                  setFormData({ ...formData, startTime: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="editEndTime">Heure de fin</Label>
              <Input
                id="editEndTime"
                type="time"
                value={formData.endTime}
                onChange={(e) =>
                  setFormData({ ...formData, endTime: e.target.value })
                }
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
