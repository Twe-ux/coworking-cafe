import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Palette } from 'lucide-react'
import { EmployeeFormData, EmployeeFormErrors } from './types'
import { EMPLOYEE_ROLES, EMPLOYEE_COLORS } from './constants'

interface RoleAndAppearanceSectionProps {
  formData: EmployeeFormData
  errors: EmployeeFormErrors
  onChange: (field: keyof EmployeeFormData, value: string) => void
}

export function RoleAndAppearanceSection({
  formData,
  errors,
  onChange,
}: RoleAndAppearanceSectionProps) {
  const selectedRole = EMPLOYEE_ROLES.find(
    (role) => role.value === formData.role
  )
  const selectedColor = EMPLOYEE_COLORS.find(
    (color) => color.value === formData.color
  )

  return (
    <Card>
      <CardContent className="pt-4">
        <h3 className="mb-4 font-medium text-gray-900">Rôle et apparence</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>
              Rôle <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.role}
              onValueChange={(value) => onChange('role', value)}
            >
              <SelectTrigger className={errors.role ? 'border-red-500' : ''}>
                <SelectValue placeholder="Sélectionnez un rôle" />
              </SelectTrigger>
              <SelectContent>
                {EMPLOYEE_ROLES.map((role) => (
                  <SelectItem key={role.value} value={role.value}>
                    <div>
                      <div className="font-medium">{role.label}</div>
                      <div className="text-sm text-gray-500">
                        {role.description}
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.role && (
              <p className="text-sm text-red-600">{errors.role}</p>
            )}
            {selectedRole && (
              <Badge variant="outline" className="w-fit">
                {selectedRole.label}
              </Badge>
            )}
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Couleur
            </Label>
            <Select
              value={formData.color}
              onValueChange={(value) => onChange('color', value)}
            >
              <SelectTrigger>
                <SelectValue>
                  {selectedColor && (
                    <div className="flex items-center gap-2">
                      <div
                        className="h-4 w-4 rounded-full"
                        style={{ backgroundColor: selectedColor.color }}
                      />
                      {selectedColor.label}
                    </div>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {EMPLOYEE_COLORS.map((color) => (
                  <SelectItem key={color.value} value={color.value}>
                    <div className="flex items-center gap-2">
                      <div
                        className="h-4 w-4 rounded-full"
                        style={{ backgroundColor: color.color }}
                      />
                      {color.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
