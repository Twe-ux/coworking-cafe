'use client'

import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Loader2, User } from 'lucide-react'
import type { Employee } from '@/types/hr'
import { useEmployeeCreate } from './useEmployeeCreate'
import { PersonalInfoSection } from './PersonalInfoSection'
import { ProfessionalInfoSection } from './ProfessionalInfoSection'
import { AppearanceSection } from './AppearanceSection'

interface CreateEmployeeModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (employee: Employee) => void
}

export default function CreateEmployeeModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateEmployeeModalProps) {
  const {
    formData,
    isLoading,
    errors,
    handleInputChange,
    handleSubmit,
    handleClose,
  } = useEmployeeCreate({ onSuccess, onClose })

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Ajouter un nouvel employé
          </DialogTitle>
          <DialogDescription>
            Créez un nouveau profil d&apos;employé pour la planification des
            équipes.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {errors.general && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
              {errors.general}
            </div>
          )}

          <PersonalInfoSection
            formData={formData}
            errors={errors}
            onInputChange={handleInputChange}
          />

          <ProfessionalInfoSection
            formData={formData}
            errors={errors}
            onInputChange={handleInputChange}
          />

          <AppearanceSection
            formData={formData}
            onInputChange={handleInputChange}
          />

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-coffee-primary hover:bg-coffee-primary/90"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Création...
                </>
              ) : (
                "Créer l'employé"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
