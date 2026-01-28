import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { DatePicker } from '@/components/ui/date-picker'
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
          <DatePicker
            date={formData.startDate}
            onDateChange={(date) => onChange('startDate', date)}
            placeholder="Sélectionner la date de début"
            className={errors.startDate ? 'border-red-500' : ''}
          />
          {errors.startDate && (
            <p className="text-sm text-red-600">{errors.startDate}</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
