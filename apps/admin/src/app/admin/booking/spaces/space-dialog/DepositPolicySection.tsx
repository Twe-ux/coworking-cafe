import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import type { SpaceFormData } from "./types"

interface DepositPolicySectionProps {
  formData: SpaceFormData
  onDepositEnabledChange: (enabled: boolean) => void
  onDepositPercentageChange: (value: number) => void
  onDepositFixedAmountChange: (value: number) => void
  onDepositMinimumAmountChange: (value: number) => void
}

/**
 * Deposit policy configuration section
 * Configure bank deposit hold amount (empreinte bancaire)
 */
export function DepositPolicySection({
  formData,
  onDepositEnabledChange,
  onDepositPercentageChange,
  onDepositFixedAmountChange,
  onDepositMinimumAmountChange,
}: DepositPolicySectionProps) {
  return (
    <div className="space-y-4">
      {/* Enable Deposit Policy */}
      <div className="flex items-center space-x-2 p-3 rounded-md bg-muted/50">
        <Checkbox
          id="deposit-enabled"
          checked={formData.depositPolicy.enabled}
          onCheckedChange={(checked) => onDepositEnabledChange(checked === true)}
        />
        <div className="flex flex-col">
          <Label
            htmlFor="deposit-enabled"
            className="cursor-pointer font-medium"
          >
            Activer l&apos;empreinte bancaire
          </Label>
          <p className="text-sm text-muted-foreground">
            Prélèvement d&apos;une empreinte lors de la réservation (annulée si présent, encaissée si no-show)
          </p>
        </div>
      </div>

      {/* Deposit Configuration */}
      {formData.depositPolicy.enabled && (
        <div className="space-y-4 pl-4 border-l-2 border-muted">
          {/* Percentage or Fixed Amount */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="deposit-percentage">
                Pourcentage (%)
              </Label>
              <Input
                id="deposit-percentage"
                type="number"
                min={0}
                max={100}
                step={1}
                value={formData.depositPolicy.percentage || ""}
                onChange={(e) => {
                  const val = e.target.value === "" ? undefined : parseFloat(e.target.value)
                  if (val !== undefined) {
                    onDepositPercentageChange(val)
                  }
                }}
                placeholder="Ex: 50"
              />
              <p className="text-xs text-muted-foreground">
                Pourcentage du prix total
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="deposit-fixed">
                Montant fixe (€)
              </Label>
              <Input
                id="deposit-fixed"
                type="number"
                min={0}
                step={0.01}
                value={
                  formData.depositPolicy.fixedAmount
                    ? formData.depositPolicy.fixedAmount / 100
                    : ""
                }
                onChange={(e) => {
                  const val = e.target.value === "" ? undefined : parseFloat(e.target.value) * 100
                  if (val !== undefined) {
                    onDepositFixedAmountChange(val)
                  }
                }}
                placeholder="Ex: 50.00"
              />
              <p className="text-xs text-muted-foreground">
                Montant fixe (prioritaire sur %)
              </p>
            </div>
          </div>

          {/* Minimum Amount */}
          <div className="space-y-2">
            <Label htmlFor="deposit-minimum">
              Montant minimum (€)
            </Label>
            <Input
              id="deposit-minimum"
              type="number"
              min={0}
              step={0.01}
              value={
                formData.depositPolicy.minimumAmount
                  ? formData.depositPolicy.minimumAmount / 100
                  : ""
              }
              onChange={(e) => {
                const val = e.target.value === "" ? undefined : parseFloat(e.target.value) * 100
                if (val !== undefined) {
                  onDepositMinimumAmountChange(val)
                }
              }}
              placeholder="Ex: 20.00"
            />
            <p className="text-xs text-muted-foreground">
              Montant minimum d&apos;empreinte (optionnel)
            </p>
          </div>

          {/* Info */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-800">
              <strong>Priorité :</strong> Montant fixe &gt; Pourcentage
              <br />
              <strong>Exemple :</strong> Pour un prix de 100€ avec 50%, l&apos;empreinte sera de 50€
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
