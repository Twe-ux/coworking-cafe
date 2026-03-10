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
import { useToast } from "@/hooks/use-toast";
import type {
  Product,
  APIResponse,
  CreateDirectPurchaseData,
  CreateDirectPurchaseItemData,
} from "@/types/inventory";

interface FormItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPriceHT: number;
  vatRate: number;
}

export function DirectPurchaseForm() {
  const router = useRouter();
  const { toast } = useToast();

  const [supplier, setSupplier] = useState("");
  const [date, setDate] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<FormItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Set default date to today
  useEffect(() => {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, "0");
    const d = String(today.getDate()).padStart(2, "0");
    setDate(`${y}-${m}-${d}`);
  }, []);

  // Fetch all active products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/inventory/products?active=true");
        const data = (await res.json()) as APIResponse<Product[]>;
        if (data.success && data.data) {
          setProducts(data.data);
        }
      } catch (err) {
        console.error("Error fetching products:", err);
      } finally {
        setLoadingProducts(false);
      }
    };
    fetchProducts();
  }, []);

  const addItem = (productId: string) => {
    if (!productId) return;
    if (items.some((i) => i.productId === productId)) {
      toast({
        title: "Produit deja ajoute",
        description: "Ce produit est deja dans la liste",
        variant: "destructive",
      });
      return;
    }

    const product = products.find((p) => p._id === productId);
    if (!product) return;

    setItems([
      ...items,
      {
        productId: product._id,
        productName: product.name,
        quantity: 1,
        unitPriceHT: product.unitPriceHT,
        vatRate: product.vatRate,
      },
    ]);
  };

  const removeItem = (productId: string) => {
    setItems(items.filter((i) => i.productId !== productId));
  };

  const updateItem = (
    productId: string,
    field: "quantity" | "unitPriceHT",
    value: number,
  ) => {
    setItems(
      items.map((i) => (i.productId === productId ? { ...i, [field]: value } : i)),
    );
  };

  const totalHT = items.reduce((sum, i) => sum + i.quantity * i.unitPriceHT, 0);
  const totalTTC = items.reduce(
    (sum, i) => sum + i.quantity * i.unitPriceHT * (1 + i.vatRate / 100),
    0,
  );

  const canSubmit =
    supplier.trim() !== "" && date !== "" && items.length > 0 && !submitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;

    setSubmitting(true);
    try {
      const apiItems: CreateDirectPurchaseItemData[] = items.map((i) => ({
        productId: i.productId,
        quantity: i.quantity,
        unitPriceHT: i.unitPriceHT,
      }));

      const body: CreateDirectPurchaseData = {
        supplier: supplier.trim(),
        items: apiItems,
        date,
        invoiceNumber: invoiceNumber.trim() || undefined,
        notes: notes.trim() || undefined,
      };

      const res = await fetch("/api/inventory/direct-purchases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = (await res.json()) as APIResponse<unknown>;

      if (data.success) {
        toast({
          title: "Achat enregistre",
          description: `${items.length} produit(s) - ${totalTTC.toFixed(2)} EUR TTC`,
        });
        router.push("/admin/inventory/direct-purchases");
      } else {
        toast({
          title: "Erreur",
          description: data.error || "Impossible d'enregistrer l'achat",
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
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>Informations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="supplier">Fournisseur *</Label>
              <Input
                id="supplier"
                placeholder="Nom du fournisseur"
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Date *</Label>
              <DatePicker date={date} onDateChange={setDate} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="invoiceNumber">N de facture (optionnel)</Label>
            <Input
              id="invoiceNumber"
              placeholder="Ex: FAC-2026-001"
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Products Card */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle>Produits</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Product selector */}
          <div className="flex gap-2 items-end">
            <div className="flex-1 space-y-2">
              <Label htmlFor="add-product">Ajouter un produit</Label>
              <select
                id="add-product"
                className="w-full h-10 px-3 border border-input bg-background rounded-md text-sm"
                onChange={(e) => {
                  if (e.target.value) {
                    addItem(e.target.value);
                    e.target.value = "";
                  }
                }}
                defaultValue=""
                disabled={loadingProducts}
              >
                <option value="">
                  {loadingProducts
                    ? "Chargement..."
                    : "-- Selectionner un produit --"}
                </option>
                {products
                  .filter((p) => !items.some((i) => i.productId === p._id))
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name} ({p.unitPriceHT.toFixed(2)} EUR HT)
                    </option>
                  ))}
              </select>
            </div>
          </div>

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
                      <Input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(e) =>
                          updateItem(
                            item.productId,
                            "quantity",
                            Number(e.target.value),
                          )
                        }
                        onFocus={(e) => e.target.select()}
                        className="w-[100px]"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min={0}
                        step={0.01}
                        value={item.unitPriceHT}
                        onChange={(e) =>
                          updateItem(
                            item.productId,
                            "unitPriceHT",
                            Number(e.target.value),
                          )
                        }
                        onFocus={(e) => e.target.select()}
                        className="w-[120px]"
                      />
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {(item.quantity * item.unitPriceHT).toFixed(2)} EUR
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
              Aucun produit ajoute. Selectionnez un produit ci-dessus.
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
          onClick={() => router.push("/admin/inventory/direct-purchases")}
          disabled={submitting}
        >
          Annuler
        </Button>
        <Button
          variant="outline"
          className="border-green-500 text-green-700 hover:bg-green-50 hover:text-green-700"
          onClick={handleSubmit}
          disabled={!canSubmit}
        >
          {submitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Enregistrement...
            </>
          ) : (
            "Enregistrer l'achat"
          )}
        </Button>
      </div>
    </div>
  );
}
