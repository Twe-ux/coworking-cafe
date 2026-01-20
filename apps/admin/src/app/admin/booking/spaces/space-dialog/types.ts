import type { SpaceConfiguration, SpaceType } from "@/types/booking"

export interface SpaceFormData {
  name: string
  spaceType: SpaceType
  slug: string
  description: string
  minCapacity: number
  maxCapacity: number
  pricing: {
    hourly: number
    daily: number
    weekly: number
    monthly: number
    perPerson: boolean
  }
  availableReservationTypes: {
    hourly: boolean
    daily: boolean
    weekly: boolean
    monthly: boolean
  }
  requiresQuote: boolean
  isActive: boolean
  displayOrder: number
  features: string[]
}

export interface SpaceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  space?: SpaceConfiguration | null
  onSuccess: () => void
}

export interface UseSpaceFormReturn {
  formData: SpaceFormData
  setFormData: React.Dispatch<React.SetStateAction<SpaceFormData>>
  featuresInput: string
  setFeaturesInput: React.Dispatch<React.SetStateAction<string>>
  loading: boolean
  handleNameChange: (value: string) => void
  handleSubmit: (e: React.FormEvent) => Promise<void>
}
