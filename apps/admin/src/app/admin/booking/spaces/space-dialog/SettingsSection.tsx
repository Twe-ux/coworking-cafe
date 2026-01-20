import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import type { SpaceFormData } from "./types"

interface SettingsSectionProps {
  formData: SpaceFormData
  onDisplayOrderChange: (value: number) => void
  onIsActiveChange: (checked: boolean) => void
  onRequiresQuoteChange: (checked: boolean) => void
}

/**
 * Space settings section
 * Includes display order, active status and quote requirement
 */
export function SettingsSection({
  formData,
  onDisplayOrderChange,
  onIsActiveChange,
  onRequiresQuoteChange,
}: SettingsSectionProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="displayOrder">Ordre d'affichage</Label>
        <Input
          id="displayOrder"
          type="number"
          min={0}
          value={formData.displayOrder}
          onChange={(e) => onDisplayOrderChange(parseInt(e.target.value))}
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="isActive"
          checked={formData.isActive}
          onCheckedChange={onIsActiveChange}
        />
        <Label htmlFor="isActive" className="font-normal">
          Espace actif
        </Label>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="requiresQuote"
          checked={formData.requiresQuote}
          onCheckedChange={onRequiresQuoteChange}
        />
        <Label htmlFor="requiresQuote" className="font-normal">
          Nécessite un devis
        </Label>
      </div>
    </div>
  )
}
