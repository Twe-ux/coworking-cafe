"use client"

import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Checkbox } from "@/components/ui/checkbox"
import { Euro } from "lucide-react"
import type { PriceSectionProps } from "./types"

export function PriceSection({
  totalPrice,
  loading,
  invoiceOption,
  onInvoicePaymentChange
}: PriceSectionProps) {
  return (
    <div className="space-y-3">
      <Label>Prix total</Label>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Euro className="h-5 w-5" />
              <span className="text-sm font-medium">Montant calculé automatiquement</span>
            </div>

            <div className="flex items-baseline gap-1">
              {loading ? (
                <Skeleton className="h-9 w-24" />
              ) : (
                <>
                  <span className="text-3xl font-bold text-primary">
                    {totalPrice.toFixed(2)}
                  </span>
                  <span className="text-lg text-muted-foreground">€</span>
                </>
              )}
            </div>
          </div>

          {loading && (
            <p className="text-xs text-muted-foreground mt-2">
              Calcul en cours...
            </p>
          )}

          {!loading && totalPrice === 0 && (
            <p className="text-xs text-muted-foreground mt-2">
              Veuillez remplir l'espace, les dates, heures et nombre de personnes
            </p>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center space-x-2 mt-4">
        <Checkbox
          id="invoiceOption"
          checked={invoiceOption}
          onCheckedChange={(checked) => onInvoicePaymentChange(checked as boolean)}
        />
        <Label
          htmlFor="invoiceOption"
          className="text-sm font-normal cursor-pointer"
        >
          Paiement sur facture
        </Label>
      </div>
    </div>
  )
}
