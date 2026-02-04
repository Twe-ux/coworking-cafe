"use client";

import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { Minus, Plus, Users, Euro } from "lucide-react";

interface PeopleAndPriceSectionProps {
  numberOfPeople: number;
  onPeopleChange: (count: number) => void;
  totalPrice: number;
  priceLoading: boolean;
  invoiceOption: boolean;
  onInvoicePaymentChange: (checked: boolean) => void;
  min?: number;
  max?: number;
  error?: string;
}

export function PeopleAndPriceSection({
  numberOfPeople,
  onPeopleChange,
  totalPrice,
  priceLoading,
  invoiceOption,
  onInvoicePaymentChange,
  min = 1,
  max = 50,
  error,
}: PeopleAndPriceSectionProps) {
  const handleIncrement = () => {
    if (numberOfPeople < max) {
      onPeopleChange(numberOfPeople + 1);
    }
  };

  const handleDecrement = () => {
    if (numberOfPeople > min) {
      onPeopleChange(numberOfPeople - 1);
    }
  };

  return (
    <div className="space-y-3 p-4">
      <div className="flex flex-col gap-4 ">
        {/* Nombre de personnes */}
        <div className="space-y-3">
          <Label>Nombre de personnes *</Label>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handleDecrement}
              disabled={numberOfPeople <= min}
              className="h-10 w-10"
            >
              <Minus className="h-4 w-4" />
            </Button>

            <div className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border rounded-md bg-muted/50">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-xl font-semibold">{numberOfPeople}</span>
            </div>

            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handleIncrement}
              disabled={numberOfPeople >= max}
              className="h-10 w-10"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Prix */}
        <div className="space-y-3">
          <Label>Prix total</Label>

          <Card className="h-[56px]">
            <CardContent className="p-3">
              <div className="flex items-center justify-center h-full">
                <div className="flex items-center gap-2">
                  <Euro className="h-4 w-4 text-muted-foreground" />
                  {priceLoading ? (
                    <Skeleton className="h-6 w-20" />
                  ) : (
                    <>
                      <span className="text-2xl font-bold text-primary ">
                        {totalPrice.toFixed(2)}
                      </span>
                      <span className="text-sm text-muted-foreground">€</span>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {priceLoading && (
            <p className="text-xs text-muted-foreground">Calcul en cours...</p>
          )}

          {!priceLoading && totalPrice === 0 && (
            <p className="text-xs text-muted-foreground">
              Le prix sera calculé automatiquement
            </p>
          )}
        </div>
      </div>

      {/* Checkbox Paiement sur facture */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="invoiceOption"
          checked={invoiceOption}
          onCheckedChange={(checked) =>
            onInvoicePaymentChange(checked as boolean)
          }
        />
        <Label
          htmlFor="invoiceOption"
          className="text-sm font-normal cursor-pointer"
        >
          Paiement sur facture
        </Label>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
