"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { PricingSectionProps } from "./types"

/**
 * Section de tarification (prix total, acompte)
 */
export function PricingSection({ formData, onChange }: PricingSectionProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="totalPrice">Prix total (€)</Label>
        <Input
          id="totalPrice"
          type="number"
          step="0.01"
          value={formData.totalPrice}
          onChange={(e) => onChange("totalPrice", parseFloat(e.target.value))}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="depositPaid">Acompte versé (€)</Label>
        <Input
          id="depositPaid"
          type="number"
          step="0.01"
          value={formData.depositPaid}
          onChange={(e) => onChange("depositPaid", parseFloat(e.target.value))}
        />
      </div>
    </div>
  )
}
