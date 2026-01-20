import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface FeaturesSectionProps {
  featuresInput: string
  onFeaturesChange: (value: string) => void
}

/**
 * Features configuration section
 * Allows entering comma-separated features
 */
export function FeaturesSection({
  featuresInput,
  onFeaturesChange,
}: FeaturesSectionProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="features">
        Caractéristiques (séparées par des virgules)
      </Label>
      <Input
        id="features"
        value={featuresInput}
        onChange={(e) => onFeaturesChange(e.target.value)}
        placeholder="WiFi, Écran, Tableau blanc"
      />
    </div>
  )
}
