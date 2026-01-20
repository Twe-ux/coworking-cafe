import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Palette } from 'lucide-react'
import { EMPLOYEE_COLORS } from './constants'
import type { EmployeeFormData } from './types'

interface AppearanceSectionProps {
  formData: EmployeeFormData
  onInputChange: (field: string, value: string) => void
}

export function AppearanceSection({
  formData,
  onInputChange,
}: AppearanceSectionProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <h3 className="mb-4 flex items-center gap-2 text-lg font-medium">
          <Palette className="h-5 w-5" />
          Couleur d&apos;identification
        </h3>

        <div className="space-y-4">
          <Label>Couleur pour le planning</Label>
          <div className="grid grid-cols-5 gap-3">
            {EMPLOYEE_COLORS.map((color) => (
              <button
                key={color.value}
                type="button"
                onClick={() => onInputChange('color', color.value)}
                className={`relative rounded-lg border-2 p-3 transition-all ${
                  formData.color === color.value
                    ? 'border-coffee-primary ring-coffee-primary/20 ring-2'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div
                  className="mx-auto mb-1 h-8 w-8 rounded-full"
                  style={{ backgroundColor: color.color }}
                />
                <span className="text-xs text-gray-600">{color.label}</span>
                {formData.color === color.value && (
                  <div className="bg-coffee-primary absolute top-1 right-1 h-3 w-3 rounded-full" />
                )}
              </button>
            ))}
          </div>

          <div className="rounded-lg bg-gray-50 p-4">
            <p className="mb-2 text-sm text-gray-600">Aperçu :</p>
            <Badge className={`${formData.color} text-white`}>
              {formData.firstName || 'Prénom'} {formData.lastName || 'Nom'}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
