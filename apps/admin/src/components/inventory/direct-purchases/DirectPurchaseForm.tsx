"use client";

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
import { ProductDialog } from "@/components/inventory/products/ProductDialog";
import { useDirectPurchaseForm } from "@/hooks/inventory/useDirectPurchaseForm";

interface DirectPurchaseFormProps {
  supplierId: string;
  supplierName: string;
}

export function DirectPurchaseForm({
  supplierId,
  supplierName,
}: DirectPurchaseFormProps) {
  const {
    date, setDate,
    invoiceNumber, setInvoiceNumber,
    notes, setNotes,
    items,
    addItem, removeItem, updateItem,
    getItemTotalHT,
    totalHT, totalTTC,
    canSubmit,
    handleSubmit, submitting,
    cancel,
    products,
    loadingProducts,
    productDialogOpen, setProductDialogOpen,
    handleCreateProduct,
  } = useDirectPurchaseForm(supplierId, supplierName);

  return (
    <div className="space-y-6">
      {/* Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>Informations Achat - {supplierName}</CardTitle>
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
          <div className="flex justify-between items-start">
            <CardTitle>Produits</CardTitle>
            <Button
              variant="outline"
              size="sm"
              className="border-green-500 text-green-700 hover:bg-green-50 hover:text-green-700"
              onClick={() => setProductDialogOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Nouveau produit
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Product selector */}
          <div className="flex gap-2 items-end">
            <div className="flex-1 space-y-2">
              <Label htmlFor="add-product">Ajouter un produit</Label>
              <select
                id="add-product"
                className="w-full h-10 pl-3 pr-8 border border-input bg-background rounded-md text-sm appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2012%2012%22%3E%3Cpath%20fill%3D%22%23666%22%20d%3D%22M10.293%203.293L6%207.586%201.707%203.293A1%201%200%2000.293%204.707l5%205a1%201%200%20001.414%200l5-5a1%201%200%2010-1.414-1.414z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:12px_12px] bg-[position:right_0.5rem_center] bg-no-repeat"
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
                {products.map((p) => (
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
                        type="text"
                        inputMode="decimal"
                        value={item.quantity}
                        placeholder="1"
                        onChange={(e) => {
                          const value = e.target.value;
                          // Accept both comma and dot as decimal separator
                          const normalizedValue = value.replace(',', '.');

                          // Allow empty, partial decimals like "0.", ".5", "1."
                          if (normalizedValue === '' || normalizedValue === '.' || /^\d*\.?\d*$/.test(normalizedValue)) {
                            const numValue = parseFloat(normalizedValue);
                            if (normalizedValue === '' || normalizedValue === '.') {
                              // Temporarily allow empty for user to type
                              updateItem(item.productId, "quantity", 1);
                            } else if (!isNaN(numValue) && numValue > 0) {
                              updateItem(item.productId, "quantity", numValue);
                            }
                          }
                        }}
                        onBlur={(e) => {
                          // On blur, ensure minimum value of 1
                          const value = e.target.value.replace(',', '.');
                          const numValue = parseFloat(value);
                          if (isNaN(numValue) || numValue < 1) {
                            updateItem(item.productId, "quantity", 1);
                          }
                        }}
                        onFocus={(e) => {
                          // Safari fix: setTimeout to prevent auto-deselect
                          setTimeout(() => e.target.select(), 0);
                        }}
                        onMouseUp={(e) => {
                          // Prevent Safari from deselecting on mouse up
                          e.preventDefault();
                        }}
                        className="w-[100px]"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="text"
                        inputMode="decimal"
                        value={item.unitPriceHT}
                        placeholder="0.00"
                        onChange={(e) => {
                          const value = e.target.value;
                          // Accept both comma and dot as decimal separator
                          const normalizedValue = value.replace(',', '.');

                          // Allow empty, partial decimals like "0.", ".5", "1."
                          if (normalizedValue === '' || normalizedValue === '.' || /^\d*\.?\d*$/.test(normalizedValue)) {
                            const numValue = parseFloat(normalizedValue);
                            if (normalizedValue === '' || normalizedValue === '.') {
                              // Temporarily allow empty for user to type
                              updateItem(item.productId, "unitPriceHT", 0);
                            } else if (!isNaN(numValue) && numValue >= 0) {
                              updateItem(item.productId, "unitPriceHT", numValue);
                            }
                          }
                        }}
                        onBlur={(e) => {
                          // On blur, ensure valid value (minimum 0)
                          const value = e.target.value.replace(',', '.');
                          const numValue = parseFloat(value);
                          if (isNaN(numValue) || numValue < 0) {
                            updateItem(item.productId, "unitPriceHT", 0);
                          }
                        }}
                        onFocus={(e) => {
                          // Safari fix: setTimeout to prevent auto-deselect
                          setTimeout(() => e.target.select(), 0);
                        }}
                        onMouseUp={(e) => {
                          // Prevent Safari from deselecting on mouse up
                          e.preventDefault();
                        }}
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
          onClick={cancel}
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

      {/* Product Creation Dialog */}
      <ProductDialog
        open={productDialogOpen}
        onClose={() => setProductDialogOpen(false)}
        onSubmit={handleCreateProduct}
        mode="create"
      />
    </div>
  );
}
