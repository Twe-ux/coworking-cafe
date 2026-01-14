"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useShiftDataFixed } from "@/hooks/use-shift-data-fixed";
import { useStaffDataFixed } from "@/hooks/use-staff-data-fixed";
import { convertTimeToISO } from "@/lib/shift-utils";
import { useCreateShiftMutation } from "@/store/shift/api";
import { Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "react-hot-toast";

interface AddShiftModalProps {
  onShiftAdded?: () => void; // Rendre optionnel car nous gérons le cache automatiquement
}

export function AddShiftModal({ onShiftAdded }: AddShiftModalProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    staffId: "",
    date: "",
    firstShiftStart: "",
    firstShiftEnd: "",
    secondShiftStart: "",
    secondShiftEnd: "",
  });

  // Récupérer la liste des employés depuis le hook moderne
  const { data: staffData } = useStaffDataFixed();

  // Utiliser RTK Query pour créer un shift et le cache pour le rafraîchir
  const [createShift, { isLoading }] = useCreateShiftMutation();
  const { refetch } = useShiftDataFixed();

  // Filtrer pour ne garder que les employés actifs
  const activeStaff =
    staffData?.filter((staff) => staff.isActive !== false) || [];

  const resetForm = () => {
    setFormData({
      staffId: "",
      date: "",
      firstShiftStart: "",
      firstShiftEnd: "",
      secondShiftStart: "",
      secondShiftEnd: "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Trouver les informations de l'employé sélectionné
      const selectedStaff = activeStaff?.find(
        (staff) => staff.id === formData.staffId,
      );
      if (!selectedStaff) {
        toast.error("Employé non trouvé");
        return;
      }

      // Préparer les données pour l'API
      const shiftData = {
        staffId: formData.staffId,
        firstName: selectedStaff.firstName,
        lastName: selectedStaff.lastName,
        date: formData.date,
        firstShift: {
          start: formData.firstShiftStart
            ? convertTimeToISO(formData.firstShiftStart)
            : "00:00",
          end: formData.firstShiftEnd
            ? convertTimeToISO(formData.firstShiftEnd)
            : "00:00",
        },
        secondShift: {
          start: formData.secondShiftStart
            ? convertTimeToISO(formData.secondShiftStart)
            : "00:00",
          end: formData.secondShiftEnd
            ? convertTimeToISO(formData.secondShiftEnd)
            : "00:00",
        },
      };

      await createShift(shiftData).unwrap();
      toast.success("Pointage ajouté avec succès");
      resetForm();
      setOpen(false);

      // Rafraîchir le cache des shifts
      await refetch();

      // Appeler le callback optionnel si fourni
      if (onShiftAdded) {
        onShiftAdded();
      }
    } catch (error: any) {
      console.error("Erreur lors de la création du pointage:", error);
      toast.error(
        error.data?.error || "Erreur lors de la création du pointage",
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Ajouter un pointage
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Ajouter un pointage</DialogTitle>
          <DialogDescription>
            Créer un nouveau pointage pour un employé à une date donnée.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="staff">Employé</Label>
              <Select
                value={formData.staffId}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, staffId: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={`Sélectionner un employé (${activeStaff.length} actifs)`}
                  />
                </SelectTrigger>
                <SelectContent>
                  {activeStaff?.map((staff) => (
                    <SelectItem key={staff.id} value={staff.id}>
                      {staff.firstName} {staff.lastName}
                    </SelectItem>
                  )) || []}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, date: e.target.value }))
                }
                required
              />
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium">Premier Shift</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstShiftStart">Début</Label>
                <Input
                  id="firstShiftStart"
                  type="time"
                  value={formData.firstShiftStart}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      firstShiftStart: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="firstShiftEnd">Fin</Label>
                <Input
                  id="firstShiftEnd"
                  type="time"
                  value={formData.firstShiftEnd}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      firstShiftEnd: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium">Deuxième Shift</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="secondShiftStart">Début</Label>
                <Input
                  id="secondShiftStart"
                  type="time"
                  value={formData.secondShiftStart}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      secondShiftStart: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="secondShiftEnd">Fin</Label>
                <Input
                  id="secondShiftEnd"
                  type="time"
                  value={formData.secondShiftEnd}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      secondShiftEnd: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                resetForm();
                setOpen(false);
              }}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !formData.staffId || !formData.date}
            >
              {isLoading ? "Création..." : "Créer le pointage"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
