"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { SpaceConfiguration } from "@/types/booking"
import { useSpaceForm } from "./space-dialog/useSpaceForm"
import { SpaceDialogContent } from "./space-dialog/SpaceDialogContent"

interface SpaceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  space?: SpaceConfiguration | null
  onSuccess: () => void
}

/**
 * Space configuration dialog
 * Wrapper component that handles dialog state and orchestrates form sections
 */
export function SpaceDialog({ open, onOpenChange, space, onSuccess }: SpaceDialogProps) {
  const {
    formData,
    setFormData,
    featuresInput,
    setFeaturesInput,
    loading,
    handleNameChange,
    handleSubmit,
  } = useSpaceForm({ space, open, onSuccess, onOpenChange })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {space ? "Modifier l'espace" : "Nouvel espace"}
          </DialogTitle>
          <DialogDescription>
            Configuration des espaces réservables
          </DialogDescription>
        </DialogHeader>

        <SpaceDialogContent
          formData={formData}
          setFormData={setFormData}
          featuresInput={featuresInput}
          setFeaturesInput={setFeaturesInput}
          loading={loading}
          isEditing={!!space}
          handleNameChange={handleNameChange}
          handleSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  )
}
