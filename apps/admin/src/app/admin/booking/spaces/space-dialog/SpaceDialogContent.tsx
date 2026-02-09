"use client"

import { DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import type { SpaceType } from "@/types/booking"
import type { SpaceFormData } from "./types"
import { BasicInfoSection } from "./BasicInfoSection"
import { CapacitySection } from "./CapacitySection"
import { ReservationTypesSection } from "./ReservationTypesSection"
import { PricingSection } from "./PricingSection"
import { DepositPolicySection } from "./DepositPolicySection"
import { FeaturesSection } from "./FeaturesSection"
import { SettingsSection } from "./SettingsSection"

interface SpaceDialogContentProps {
  formData: SpaceFormData
  setFormData: React.Dispatch<React.SetStateAction<SpaceFormData>>
  featuresInput: string
  setFeaturesInput: React.Dispatch<React.SetStateAction<string>>
  loading: boolean
  isEditing: boolean
  handleNameChange: (value: string) => void
  handleSubmit: (e: React.FormEvent) => Promise<void>
  onCancel: () => void
}

/**
 * Main content component for space dialog
 * Orchestrates all form sections
 */
export function SpaceDialogContent({
  formData,
  setFormData,
  featuresInput,
  setFeaturesInput,
  loading,
  isEditing,
  handleNameChange,
  handleSubmit,
  onCancel,
}: SpaceDialogContentProps) {
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <BasicInfoSection
          formData={formData}
          onNameChange={handleNameChange}
          onTypeChange={(value: SpaceType) =>
            setFormData((prev) => ({ ...prev, spaceType: value }))
          }
          onDescriptionChange={(value: string) =>
            setFormData((prev) => ({ ...prev, description: value }))
          }
        />

        <CapacitySection
          formData={formData}
          onMinCapacityChange={(value: number) =>
            setFormData((prev) => ({ ...prev, minCapacity: value }))
          }
          onMaxCapacityChange={(value: number) =>
            setFormData((prev) => ({ ...prev, maxCapacity: value }))
          }
        />

        <ReservationTypesSection
          formData={formData}
          onReservationTypeChange={(type, checked) =>
            setFormData((prev) => ({
              ...prev,
              availableReservationTypes: {
                ...prev.availableReservationTypes,
                [type]: checked,
              },
            }))
          }
        />

        <PricingSection
          formData={formData}
          onPricingChange={(type, value) =>
            setFormData((prev) => ({
              ...prev,
              pricing: {
                ...prev.pricing,
                [type]: value,
              },
            }))
          }
          onPerPersonChange={(value) =>
            setFormData((prev) => ({
              ...prev,
              pricing: {
                ...prev.pricing,
                perPerson: value,
              },
            }))
          }
        />

        <DepositPolicySection
          formData={formData}
          onDepositEnabledChange={(enabled) =>
            setFormData((prev) => ({
              ...prev,
              depositPolicy: {
                ...prev.depositPolicy,
                enabled,
              },
            }))
          }
          onDepositPercentageChange={(value) =>
            setFormData((prev) => ({
              ...prev,
              depositPolicy: {
                ...prev.depositPolicy,
                percentage: value,
              },
            }))
          }
          onDepositFixedAmountChange={(value) =>
            setFormData((prev) => ({
              ...prev,
              depositPolicy: {
                ...prev.depositPolicy,
                fixedAmount: value,
              },
            }))
          }
          onDepositMinimumAmountChange={(value) =>
            setFormData((prev) => ({
              ...prev,
              depositPolicy: {
                ...prev.depositPolicy,
                minimumAmount: value,
              },
            }))
          }
        />

        <FeaturesSection
          featuresInput={featuresInput}
          onFeaturesChange={setFeaturesInput}
        />

        <SettingsSection
          formData={formData}
          onDisplayOrderChange={(value: number) =>
            setFormData((prev) => ({ ...prev, displayOrder: value }))
          }
          onIsActiveChange={(checked: boolean) =>
            setFormData((prev) => ({ ...prev, isActive: checked }))
          }
          onRequiresQuoteChange={(checked: boolean) =>
            setFormData((prev) => ({ ...prev, requiresQuote: checked }))
          }
        />
      </div>

      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          Annuler
        </Button>
        <Button type="submit" disabled={loading}>
          {loading
            ? "Enregistrement..."
            : isEditing
            ? "Mettre à jour"
            : "Créer"}
        </Button>
      </DialogFooter>
    </form>
  )
}
