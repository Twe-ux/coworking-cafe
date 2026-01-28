"use client"

import { Building2, Users, Star, Sparkles } from "lucide-react"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import type { SpaceSectionProps } from "./types"

const spaces = [
  {
    id: "open-space",
    name: "Open Space",
    icon: Users,
    color: "bg-blue-500",
    hoverColor: "hover:bg-blue-500/10 hover:border-blue-500"
  },
  {
    id: "salle-verriere",
    name: "Salle Verrière",
    icon: Building2,
    color: "bg-green-500",
    hoverColor: "hover:bg-green-500/10 hover:border-green-500"
  },
  {
    id: "salle-etage",
    name: "Salle Étage",
    icon: Star,
    color: "bg-purple-500",
    hoverColor: "hover:bg-purple-500/10 hover:border-purple-500"
  },
  {
    id: "evenementiel",
    name: "Événementiel",
    icon: Sparkles,
    color: "bg-red-500",
    hoverColor: "hover:bg-red-500/10 hover:border-red-500"
  }
]

export function SpaceSection({ selectedSpace, onChange, error }: SpaceSectionProps) {
  return (
    <div className="space-y-3">
      <Label>Espace *</Label>

      <div className="grid grid-cols-4 gap-2">
        {spaces.map((space) => {
          const Icon = space.icon
          const isSelected = selectedSpace === space.id

          return (
            <button
              key={space.id}
              type="button"
              onClick={() => onChange(space.id, space.name)}
              className={cn(
                "relative rounded-lg border-2 p-3 text-center transition-all",
                "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary",
                isSelected
                  ? `border-${space.color.split('-')[1]}-500 bg-${space.color.split('-')[1]}-500/10`
                  : `border-gray-200 ${space.hoverColor}`
              )}
            >
              <div className="flex flex-col items-center gap-2">
                <div className={cn(
                  "rounded-full p-2",
                  isSelected ? space.color : "bg-gray-100"
                )}>
                  <Icon className={cn(
                    "w-4 h-4",
                    isSelected ? "text-white" : "text-gray-600"
                  )} />
                </div>
                <span className={cn(
                  "text-xs font-medium",
                  isSelected ? "text-primary" : "text-gray-700"
                )}>
                  {space.name}
                </span>
              </div>

              {isSelected && (
                <div className="absolute top-1 right-1">
                  <div className={cn("rounded-full p-0.5", space.color)}>
                    <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              )}
            </button>
          )
        })}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}
