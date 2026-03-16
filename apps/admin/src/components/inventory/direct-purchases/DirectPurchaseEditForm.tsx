"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DatePicker } from "@/components/ui/date-picker";
import { NumberInput } from "@/components/inventory/NumberInput";
import { useToast } from "@/hooks/use-toast";
import type { DirectPurchase, APIResponse } from "@/types/inventory";

interface DirectPurchaseEditFormProps {
  purchase: DirectPurchase;
}

export function DirectPurchaseEditForm({ purchase }: DirectPurchaseEditFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [date, setDate] = useState(purchase.date);
  const [invoiceNumber, setInvoiceNumber] = useState(purchase.invoiceNumber || "");
  const [notes, setNotes] = useState(purchase.notes || "");
  const [items, setItems] = useState(purchase.items);
  const [submitting, setSubmitting] = useState(false);

  const updateItem = (productId: string, field: "quantity" | "unitPriceHT", value: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.productId === productId ? { ...item, [field]: value } : item
      )
    );
  };

  const removeItem = (productId: string) => {
    setItems((prev) => prev.filter((item) => item.productId !== productId));
  };

  const getItemTotalHT = (item: typeof items[0]) => {
    return item.quantity * item.unitPriceHT;
  };

  const totalHT = items.reduce((sum, item) => sum + getItemTotalHT(item), 0);
  const totalTTC = items.reduce(
    (sum, item) => sum + getItemTotalHT(item) * (1 + item.vatRate / 100),
    0
  );

  const canSubmit = items.length > 0 && date;

  const handleSubmit = async () => {
    if (!canSubmit) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/inventory/direct-purchases/${purchase._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date,
          invoiceNumber: invoiceNumber.trim() || undefined,
          notes: notes.trim() || undefined,
          items,
        }),
      });

      const data = (await res.json()) as APIResponse<unknown>;

      if (data.success) {
        toast({
          title: "Achat modifié",
          description: "L'achat direct a été mis à jour avec succès",
        });
        router.push("/admin/inventory/direct-purchases");
      } else {
        toast({
          title: "Erreur",
          description: data.error || "Impossible de modifier l'achat",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur de connexion au serveur",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const cancel = () => {
    router.push("/admin/inventory/direct-purchases");
  };

  return (
    <div className="space-y-6">
      {/* Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>Informations Achat - {purchase.supplier}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Date *</Label>
              <DatePicker date={date} onDateChange={setDate} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="invoiceNumber">N° de facture (optionnel)</Label>
              <Input
                id="invoiceNumber"
                placeholder="Ex: FAC-2026-001"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Card */}
      <Card>
        <CardHeader>
          <CardTitle>Produits</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Items Table */}
          {items.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produit</TableHead>
                  <TableHead className="w-[120px]">Quantite</TableHead>
                  <TableHead className="w-[140px]">Prix unitaire HT</TableHead>
                  <TableHead className="text-right w-[120px]">
                    Total HT
                  </TableHead>
                  <TableHead className="w-[60px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.productId}>
                    <TableCell className="font-medium">
                      {item.productName}
                    </TableCell>
                    <TableCell>
                      <NumberInput
                        value={item.quantity}
                        onChange={(value) =>
                          updateItem(item.productId, "quantity", value)
                        }
                        min={0.1}
                        placeholder="1"
                        className="w-[100px]"
                      />
                    </TableCell>
                    <TableCell>
                      <NumberInput
                        value={item.unitPriceHT}
                        onChange={(value) =>
                          updateItem(item.productId, "unitPriceHT", value)
                        }
                        min={0}
                        placeholder="0.00"
                        className="w-[120px]"
                      />
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {getItemTotalHT(item).toFixed(2)} EUR
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-red-500 text-red-700 hover:bg-red-50 hover:text-red-700"
                        onClick={() => removeItem(item.productId)}
                        title="Supprimer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {items.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Tous les produits ont été supprimés
            </div>
          )}

          {/* Totals */}
          {items.length > 0 && (
            <div className="flex justify-end">
              <div className="space-y-2 min-w-[250px]">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total HT</span>
                  <span className="font-medium">{totalHT.toFixed(2)} EUR</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Total TTC</span>
                  <span>{totalTTC.toFixed(2)} EUR</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Notes (optionnel)</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Notes internes sur cet achat..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
          />
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          className="border-red-300 text-red-700 hover:border-red-500 hover:bg-red-50 hover:text-red-700"
          onClick={cancel}
          disabled={submitting}
        >
          Annuler
        </Button>
        <Button
          variant="outline"
          className="border-green-500 text-green-700 hover:bg-green-50 hover:text-green-700"
          onClick={handleSubmit}
          disabled={!canSubmit || submitting}
        >
          {submitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Enregistrement...
            </>
          ) : (
            "Enregistrer les modifications"
          )}
        </Button>
      </div>
    </div>
  );
}
