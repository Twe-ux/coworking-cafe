import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { EmployeeFormData, EmployeeFormErrors } from './types'

interface PersonalInfoSectionProps {
  formData: EmployeeFormData
  errors: EmployeeFormErrors
  onChange: (field: keyof EmployeeFormData, value: string) => void
}

export function PersonalInfoSection({
  formData,
  errors,
  onChange,
}: PersonalInfoSectionProps) {
  return (
    <Card>
      <CardContent className="pt-4">
        <h3 className="mb-4 font-medium text-gray-900">
          Informations personnelles
        </h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="firstName">
              Prénom <span className="text-red-500">*</span>
            </Label>
            <Input
              id="firstName"
              value={formData.firstName}
              onChange={(e) => onChange('firstName', e.target.value)}
              placeholder="Jean"
              className={errors.firstName ? 'border-red-500' : ''}
            />
            {errors.firstName && (
              <p className="text-sm text-red-600">{errors.firstName}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName">
              Nom <span className="text-red-500">*</span>
            </Label>
            <Input
              id="lastName"
              value={formData.lastName}
              onChange={(e) => onChange('lastName', e.target.value)}
              placeholder="Dupont"
              className={errors.lastName ? 'border-red-500' : ''}
            />
            {errors.lastName && (
              <p className="text-sm text-red-600">{errors.lastName}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
