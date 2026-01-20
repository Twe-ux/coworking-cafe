import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Calendar } from 'lucide-react'
import { EmployeeFormData, EmployeeFormErrors } from './types'

interface StartDateSectionProps {
  formData: EmployeeFormData
  errors: EmployeeFormErrors
  onChange: (field: keyof EmployeeFormData, value: string) => void
}

export function StartDateSection({
  formData,
  errors,
  onChange,
}: StartDateSectionProps) {
  return (
    <Card>
      <CardContent className="pt-4">
        <div className="space-y-2">
          <Label htmlFor="startDate" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Date de début <span className="text-red-500">*</span>
          </Label>
          <Input
            id="startDate"
            type="date"
            value={formData.startDate}
            onChange={(e) => onChange('startDate', e.target.value)}
            className={errors.startDate ? 'border-red-500' : ''}
            max={new Date().toISOString().split('T')[0]}
          />
          {errors.startDate && (
            <p className="text-sm text-red-600">{errors.startDate}</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
