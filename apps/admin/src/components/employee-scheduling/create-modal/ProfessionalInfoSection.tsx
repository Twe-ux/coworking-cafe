import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Calendar } from 'lucide-react'
import { EMPLOYEE_ROLES } from './constants'
import type { EmployeeFormData, FormErrors } from './types'

interface ProfessionalInfoSectionProps {
  formData: EmployeeFormData
  errors: FormErrors
  onInputChange: (field: string, value: string) => void
}

export function ProfessionalInfoSection({
  formData,
  errors,
  onInputChange,
}: ProfessionalInfoSectionProps) {
  const selectedRole = EMPLOYEE_ROLES.find((role) => role.value === formData.role)

  return (
    <Card>
      <CardContent className="pt-6">
        <h3 className="mb-4 text-lg font-medium">
          Informations professionnelles
        </h3>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="role">Rôle *</Label>
            <Select
              value={formData.role}
              onValueChange={(value) => onInputChange('role', value)}
            >
              <SelectTrigger className={errors.role ? 'border-red-500' : ''}>
                <SelectValue placeholder="Sélectionnez un rôle" />
              </SelectTrigger>
              <SelectContent>
                {EMPLOYEE_ROLES.map((role) => (
                  <SelectItem key={role.value} value={role.value}>
                    <div className="flex flex-col">
                      <span className="font-medium">{role.label}</span>
                      <span className="text-xs text-gray-500">
                        {role.description}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.role && (
              <p className="text-sm text-red-600">{errors.role}</p>
            )}
            {selectedRole && (
              <p className="text-sm text-gray-600">
                {selectedRole.description}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="startDate">Date de début</Label>
            <div className="relative">
              <Calendar className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => onInputChange('startDate', e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
