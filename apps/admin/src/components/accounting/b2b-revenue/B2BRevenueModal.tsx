"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { B2BRevenueFormData, B2BRevenueRow } from "@/types/accounting";

interface B2BRevenueModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (formData: B2BRevenueFormData) => Promise<void>;
  editingEntry: B2BRevenueRow | null;
}

export function B2BRevenueModal({
  open,
  onClose,
  onSubmit,
  editingEntry,
}: B2BRevenueModalProps) {
  const [formData, setFormData] = useState<B2BRevenueFormData>({
    _id: "",
    date: new Date().toISOString().slice(0, 10),
    ht: "",
    ttc: "",
    tva: "",
    notes: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Remplir le formulaire en mode édition
  useEffect(() => {
    if (editingEntry) {
      setFormData({
        _id: editingEntry._id,
        date: editingEntry.date,
        ht: String(editingEntry.ht),
        ttc: String(editingEntry.ttc),
        tva: String(editingEntry.tva),
        notes: editingEntry.notes || "",
      });
    } else {
      setFormData({
        _id: "",
        date: new Date().toISOString().slice(0, 10),
        ht: "",
        ttc: "",
        tva: "",
        notes: "",
      });
    }
  }, [editingEntry, open]);

  // Auto-calculer TVA quand HT ou TTC change
  useEffect(() => {
    const ht = Number(formData.ht) || 0;
    const ttc = Number(formData.ttc) || 0;
    const calculatedTVA = ttc - ht;

    if (calculatedTVA >= 0) {
      setFormData((prev) => ({
        ...prev,
        tva: calculatedTVA.toFixed(2),
      }));
    }
  }, [formData.ht, formData.ttc]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.date || !formData.ht || !formData.ttc) {
      alert("Veuillez remplir tous les champs obligatoires");
      return;
    }

    const ht = Number(formData.ht);
    const ttc = Number(formData.ttc);

    if (ttc < ht) {
      alert("Le TTC doit être supérieur ou égal au HT");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {editingEntry ? "Modifier" : "Ajouter"} une entrée CA B2B
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="date">
              Date <span className="text-red-500">*</span>
            </Label>
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

          {/* HT */}
          <div className="space-y-2">
            <Label htmlFor="ht">
              Montant HT (€) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="ht"
              type="number"
              step="0.01"
              min="0"
              value={formData.ht}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, ht: e.target.value }))
              }
              placeholder="0.00"
              required
            />
          </div>

          {/* TTC */}
          <div className="space-y-2">
            <Label htmlFor="ttc">
              Montant TTC (€) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="ttc"
              type="number"
              step="0.01"
              min="0"
              value={formData.ttc}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, ttc: e.target.value }))
              }
              placeholder="0.00"
              required
            />
          </div>

          {/* TVA (calculé automatiquement) */}
          <div className="space-y-2">
            <Label htmlFor="tva">TVA (€) - Calculé automatiquement</Label>
            <Input
              id="tva"
              type="text"
              value={formData.tva}
              disabled
              className="bg-muted"
            />
            {formData.ht && formData.ttc && Number(formData.ht) > 0 && (
              <p className="text-xs text-muted-foreground">
                Taux TVA:{" "}
                {(
                  ((Number(formData.ttc) - Number(formData.ht)) /
                    Number(formData.ht)) *
                  100
                ).toFixed(1)}
                %
              </p>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optionnel)</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, notes: e.target.value }))
              }
              placeholder="Informations complémentaires..."
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Enregistrement..." : editingEntry ? "Modifier" : "Ajouter"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
