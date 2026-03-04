"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarIcon, Plus } from "lucide-react";
import { toast } from "sonner";

interface RequestAbsenceDialogProps {
  employeeId: string;
  onSuccess?: () => void;
}

export function RequestAbsenceDialog({
  employeeId,
  onSuccess,
}: RequestAbsenceDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    type: "unavailability" as "unavailability" | "paid_leave",
    startDate: "",
    endDate: "",
    reason: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.type || !formData.startDate || !formData.endDate) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);

    if (end < start) {
      toast.error("La date de fin doit être après la date de début");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/hr/absences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId,
          type: formData.type,
          startDate: formData.startDate,
          endDate: formData.endDate,
          reason: formData.reason || undefined,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Demande d'absence envoyée avec succès");
        setOpen(false);
        setFormData({
          type: "unavailability",
          startDate: "",
          endDate: "",
          reason: "",
        });
        onSuccess?.();
      } else {
        toast.error(data.error || "Erreur lors de l'envoi de la demande");
      }
    } catch (error) {
      console.error("Error submitting absence request:", error);
      toast.error("Erreur de connexion");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="border-green-500 text-green-700 hover:bg-green-50 hover:text-green-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          Demander une absence
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Demander une absence</DialogTitle>
          <DialogDescription>
            Demandez une indisponibilité ou des congés payés. Votre demande sera
            soumise à validation.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type */}
          <div className="space-y-2">
            <Label htmlFor="type">
              Type d'absence <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.type}
              onValueChange={(value: typeof formData.type) =>
                setFormData({ ...formData, type: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unavailability">
                  Indisponibilité (non payé)
                </SelectItem>
                <SelectItem value="paid_leave">
                  Congés payés (CP)
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">
              {formData.type === "unavailability"
                ? "Votre créneau pourra être échangé avec un collègue"
                : "Décompté de votre solde de congés payés"}
            </p>
          </div>

          {/* Start Date */}
          <div className="space-y-2">
            <Label htmlFor="startDate">
              Date de début <span className="text-red-500">*</span>
            </Label>
            <Input
              id="startDate"
              type="date"
              value={formData.startDate}
              onChange={(e) =>
                setFormData({ ...formData, startDate: e.target.value })
              }
              required
            />
          </div>

          {/* End Date */}
          <div className="space-y-2">
            <Label htmlFor="endDate">
              Date de fin <span className="text-red-500">*</span>
            </Label>
            <Input
              id="endDate"
              type="date"
              value={formData.endDate}
              onChange={(e) =>
                setFormData({ ...formData, endDate: e.target.value })
              }
              min={formData.startDate || undefined}
              required
            />
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason">Raison (optionnel)</Label>
            <Textarea
              id="reason"
              value={formData.reason}
              onChange={(e) =>
                setFormData({ ...formData, reason: e.target.value })
              }
              placeholder="Expliquez brièvement la raison de votre absence..."
              rows={3}
              maxLength={500}
            />
            <p className="text-xs text-gray-500">
              {formData.reason.length}/500 caractères
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
              className="border-red-500 text-red-700 hover:bg-red-50 hover:text-red-700"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              variant="outline"
              disabled={isSubmitting}
              className="border-green-500 text-green-700 hover:bg-green-50 hover:text-green-700"
            >
              {isSubmitting ? "Envoi..." : "Envoyer la demande"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
