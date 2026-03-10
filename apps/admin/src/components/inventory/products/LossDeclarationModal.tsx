"use client";

import { useState } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import type { Product, LossReason, APIResponse, CreateProductLossData } from "@/types/inventory";

const LOSS_REASONS: { value: LossReason; label: string }[] = [
  { value: "expiration", label: "Peremption / DLC depassee" },
  { value: "damage", label: "Casse" },
  { value: "theft", label: "Vol" },
  { value: "error", label: "Erreur de stock" },
  { value: "other", label: "Autre" },
];

interface LossDeclarationModalProps {
  product: Product;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function LossDeclarationModal({
  product,
  open,
  onClose,
  onSuccess,
}: LossDeclarationModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState<LossReason | "">("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const valorisation = quantity * product.unitPriceHT;
  const canSubmit = quantity > 0 && reason !== "";

  const handleClose = () => {
    setQuantity(1);
    setReason("");
    setNotes("");
    onClose();
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;

    setLoading(true);
    try {
      const today = new Date();
      const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

      const body: CreateProductLossData = {
        quantity,
        reason: reason as LossReason,
        notes: notes.trim() || undefined,
        date: dateStr,
      };

      const res = await fetch(`/api/inventory/products/${product._id}/loss`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = (await res.json()) as APIResponse<unknown>;

      if (data.success) {
        toast({
          title: "Perte enregistree",
          description: `${quantity} ${product.name} - ${valorisation.toFixed(2)} EUR HT`,
        });
        handleClose();
        onSuccess();
      } else {
        toast({
          title: "Erreur",
          description: data.error || "Impossible d'enregistrer la perte",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Erreur",
        description: "Erreur de connexion au serveur",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Declarer une perte
          </DialogTitle>
          <DialogDescription>{product.name}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Quantity */}
          <div className="space-y-2">
            <Label htmlFor="loss-quantity">Quantite</Label>
            <Input
              id="loss-quantity"
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              onFocus={(e) => e.target.select()}
            />
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <Label>Raison</Label>
            <Select
              value={reason}
              onValueChange={(val) => setReason(val as LossReason)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selectionnez une raison" />
              </SelectTrigger>
              <SelectContent>
                {LOSS_REASONS.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="loss-notes">Notes (optionnel)</Label>
            <Textarea
              id="loss-notes"
              placeholder="Details supplementaires..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          {/* Valorisation */}
          <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
            <span className="text-sm font-medium text-red-700">
              Valorisation de la perte
            </span>
            <Badge
              variant="outline"
              className="border-red-500 bg-red-100 text-red-700 text-sm px-3 py-1"
            >
              {valorisation.toFixed(2)} EUR HT
            </Badge>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Annuler
            </Button>
            <Button
              variant="outline"
              className="border-red-500 text-red-700 hover:bg-red-50 hover:text-red-700"
              onClick={handleSubmit}
              disabled={!canSubmit || loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  En cours...
                </>
              ) : (
                "Confirmer la perte"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
