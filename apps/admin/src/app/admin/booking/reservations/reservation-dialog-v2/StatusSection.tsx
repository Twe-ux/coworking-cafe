"use client"

import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Clock, CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import type { StatusSectionProps } from "./types"

export function StatusSection({ status, onChange, depositRequired = false }: StatusSectionProps) {
  return (
    <div className="space-y-3">
      <Label>Statut de la réservation *</Label>

      <div className="grid grid-cols-2 gap-3">
        {/* Pending Button */}
        <Button
          type="button"
          variant={status === "pending" ? "default" : "outline"}
          onClick={() => onChange("pending")}
          className={cn(
            "flex items-center justify-center gap-2 h-auto py-4",
            status === "pending"
              ? "bg-orange-500 hover:bg-orange-600 text-white"
              : "border-orange-200 hover:bg-orange-50 hover:border-orange-500"
          )}
        >
          <Clock className="h-5 w-5" />
          <div className="flex flex-col items-start">
            <span className="font-semibold">En attente</span>
            <span className="text-xs opacity-80">Validation requise</span>
          </div>
        </Button>

        {/* Confirmed Button */}
        <Button
          type="button"
          variant={status === "confirmed" ? "default" : "outline"}
          onClick={() => !depositRequired && onChange("confirmed")}
          disabled={depositRequired}
          className={cn(
            "flex items-center justify-center gap-2 h-auto py-4",
            status === "confirmed"
              ? "bg-green-500 hover:bg-green-600 text-white"
              : depositRequired
              ? "border-gray-200 bg-gray-100 cursor-not-allowed opacity-50"
              : "border-green-200 hover:bg-green-50 hover:border-green-500"
          )}
        >
          <CheckCircle className="h-5 w-5" />
          <div className="flex flex-col items-start">
            <span className="font-semibold">Confirmé</span>
            <span className="text-xs opacity-80">
              {depositRequired ? "Acompte requis" : "Validée"}
            </span>
          </div>
        </Button>
      </div>

      {depositRequired && (
        <p className="text-xs text-amber-700 bg-amber-50 p-2 rounded">
          ⚠️ La réservation restera "En attente" jusqu'à réception de l'acompte
        </p>
      )}

      {status === "pending" && !depositRequired && (
        <p className="text-xs text-orange-700 bg-orange-50 p-2 rounded">
          Un email sera envoyé au client pour valider la réservation
        </p>
      )}

      {status === "confirmed" && !depositRequired && (
        <p className="text-xs text-green-700 bg-green-50 p-2 rounded">
          Un email de confirmation sera envoyé au client
        </p>
      )}
    </div>
  )
}
