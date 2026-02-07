import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Euro } from "lucide-react"
import { spaceTypeOptions } from "../types"

interface DepositPolicyCardProps {
  minAmountRequired: number
  defaultPercent: number
  applyToSpaces: string[]
  onUpdateMinAmount: (value: number) => void
  onUpdatePercent: (value: number) => void
  onToggleSpace: (spaceType: string, checked: boolean) => void
}

export function DepositPolicyCard({
  minAmountRequired,
  defaultPercent,
  applyToSpaces,
  onUpdateMinAmount,
  onUpdatePercent,
  onToggleSpace,
}: DepositPolicyCardProps) {
  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Euro className="w-5 h-5" />
          Politique d'acompte
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label htmlFor="minAmountRequired">Montant minimum requis (€)</Label>
            <Input
              id="minAmountRequired"
              type="number"
              min={0}
              value={minAmountRequired}
              onChange={(e) => onUpdateMinAmount(parseFloat(e.target.value) || 0)}
            />
            <p className="text-xs text-muted-foreground">
              Réservations au-delà nécessitent un acompte
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="defaultPercent">Pourcentage par défaut (%)</Label>
            <Input
              id="defaultPercent"
              type="number"
              min={0}
              max={100}
              value={defaultPercent}
              onChange={(e) => onUpdatePercent(parseInt(e.target.value) || 0)}
            />
            <p className="text-xs text-muted-foreground">
              Montant de l'acompte suggéré
            </p>
          </div>

          <div className="space-y-2">
            <Label>Espaces concernés</Label>
            <div className="space-y-2">
              {spaceTypeOptions.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`space-${option.value}`}
                    checked={applyToSpaces.includes(option.value)}
                    onCheckedChange={(checked) =>
                      onToggleSpace(option.value, checked as boolean)
                    }
                  />
                  <Label htmlFor={`space-${option.value}`} className="font-normal">
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Types d'espaces nécessitant un acompte
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
