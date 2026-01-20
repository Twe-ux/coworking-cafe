import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Mail, Phone, Lock } from 'lucide-react'
import { EmployeeFormData, EmployeeFormErrors } from './types'

interface ContactSectionProps {
  formData: EmployeeFormData
  errors: EmployeeFormErrors
  onChange: (field: keyof EmployeeFormData, value: string) => void
}

export function ContactSection({
  formData,
  errors,
  onChange,
}: ContactSectionProps) {
  return (
    <Card>
      <CardContent className="pt-4">
        <h3 className="mb-4 font-medium text-gray-900">Contact</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => onChange('email', e.target.value)}
              placeholder="jean.dupont@example.com"
              className={errors.email ? 'border-red-500' : ''}
            />
            {errors.email && (
              <p className="text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Téléphone
            </Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => onChange('phone', e.target.value)}
              placeholder="01 23 45 67 89"
              className={errors.phone ? 'border-red-500' : ''}
            />
            {errors.phone && (
              <p className="text-sm text-red-600">{errors.phone}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="pin" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Code PIN <span className="text-red-500">*</span>
            </Label>
            <Input
              id="pin"
              type="password"
              value={formData.pin}
              onChange={(e) => onChange('pin', e.target.value)}
              placeholder="1111"
              maxLength={4}
              className={errors.pin ? 'border-red-500' : ''}
            />
            {errors.pin && <p className="text-sm text-red-600">{errors.pin}</p>}
            <p className="text-xs text-gray-600">
              Code à 4 chiffres pour le pointage
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
