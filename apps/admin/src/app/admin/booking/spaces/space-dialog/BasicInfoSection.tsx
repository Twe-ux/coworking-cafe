import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { SpaceType } from "@/types/booking"
import type { SpaceFormData } from "./types"

interface BasicInfoSectionProps {
  formData: SpaceFormData
  onNameChange: (value: string) => void
  onTypeChange: (value: SpaceType) => void
  onDescriptionChange: (value: string) => void
}

/**
 * Basic information section for space form
 * Includes name, slug, type and description
 */
export function BasicInfoSection({
  formData,
  onNameChange,
  onTypeChange,
  onDescriptionChange,
}: BasicInfoSectionProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nom de l'espace *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => onNameChange(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="slug">Slug (généré automatiquement)</Label>
        <Input id="slug" value={formData.slug} disabled />
      </div>

      <div className="space-y-2">
        <Label htmlFor="spaceType">Type d'espace *</Label>
        <Select value={formData.spaceType} onValueChange={onTypeChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="open-space">Open Space</SelectItem>
            <SelectItem value="salle-verriere">Salle Verrière</SelectItem>
            <SelectItem value="salle-etage">Salle Étage</SelectItem>
            <SelectItem value="evenementiel">Événementiel</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          rows={3}
        />
      </div>
    </div>
  )
}
