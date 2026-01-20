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
import { Employee } from '@/hooks/useEmployees'
import { useEmployeeEdit } from './useEmployeeEdit'
import { PersonalInfoSection } from './PersonalInfoSection'
import { ContactSection } from './ContactSection'
import { RoleAndAppearanceSection } from './RoleAndAppearanceSection'
import { StartDateSection } from './StartDateSection'

interface EditEmployeeModalProps {
  employee: Employee | null
  isOpen: boolean
  onClose: () => void
  onSuccess: (employee: Employee) => void
}

export default function EditEmployeeModal({
  employee,
  isOpen,
  onClose,
  onSuccess,
}: EditEmployeeModalProps) {
  const {
    formData,
    setFormData,
    errors,
    isLoading,
    handleSubmit,
    handleClose,
  } = useEmployeeEdit({ employee, isOpen, onSuccess, onClose })

  const handleFieldChange = (
    field: keyof typeof formData,
    value: string
  ): void => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  if (!employee) return null

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Modifier l&apos;employé
          </DialogTitle>
          <DialogDescription>
            Modifiez les informations de {employee.fullName}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <PersonalInfoSection
            formData={formData}
            errors={errors}
            onChange={handleFieldChange}
          />

          <ContactSection
            formData={formData}
            errors={errors}
            onChange={handleFieldChange}
          />

          <RoleAndAppearanceSection
            formData={formData}
            errors={errors}
            onChange={handleFieldChange}
          />

          <StartDateSection
            formData={formData}
            errors={errors}
            onChange={handleFieldChange}
          />

          {errors.submit && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
              <p className="text-sm">{errors.submit}</p>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
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
                  Modification...
                </>
              ) : (
                "Modifier l'employé"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
