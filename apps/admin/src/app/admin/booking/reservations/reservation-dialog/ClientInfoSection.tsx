"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { ClientInfoSectionProps } from "./types"

/**
 * Section des informations client (nom, email)
 */
export function ClientInfoSection({ formData, onChange }: ClientInfoSectionProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="clientName">Nom du client *</Label>
        <Input
          id="clientName"
          value={formData.clientName}
          onChange={(e) => onChange("clientName", e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="clientEmail">Email du client *</Label>
        <Input
          id="clientEmail"
          type="email"
          value={formData.clientEmail}
          onChange={(e) => onChange("clientEmail", e.target.value)}
          required
        />
      </div>
    </div>
  )
}
