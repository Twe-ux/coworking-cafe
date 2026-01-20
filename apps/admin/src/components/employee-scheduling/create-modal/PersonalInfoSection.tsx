import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Mail, Phone, Lock } from 'lucide-react'
import type { EmployeeFormData, FormErrors } from './types'

interface PersonalInfoSectionProps {
  formData: EmployeeFormData
  errors: FormErrors
  onInputChange: (field: string, value: string) => void
}

export function PersonalInfoSection({
  formData,
  errors,
  onInputChange,
}: PersonalInfoSectionProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <h3 className="mb-4 text-lg font-medium">
          Informations personnelles
        </h3>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="firstName">Prénom *</Label>
            <Input
              id="firstName"
              value={formData.firstName}
              onChange={(e) => onInputChange('firstName', e.target.value)}
              placeholder="Jean"
              className={errors.firstName ? 'border-red-500' : ''}
            />
            {errors.firstName && (
              <p className="text-sm text-red-600">{errors.firstName}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName">Nom *</Label>
            <Input
              id="lastName"
              value={formData.lastName}
              onChange={(e) => onInputChange('lastName', e.target.value)}
              placeholder="Dupont"
              className={errors.lastName ? 'border-red-500' : ''}
            />
            {errors.lastName && (
              <p className="text-sm text-red-600">{errors.lastName}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => onInputChange('email', e.target.value)}
                placeholder="jean.dupont@example.com"
                className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
              />
            </div>
            {errors.email && (
              <p className="text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Téléphone</Label>
            <div className="relative">
              <Phone className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => onInputChange('phone', e.target.value)}
                placeholder="01 23 45 67 89"
                className={`pl-10 ${errors.phone ? 'border-red-500' : ''}`}
              />
            </div>
            {errors.phone && (
              <p className="text-sm text-red-600">{errors.phone}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="pin">Code PIN *</Label>
            <div className="relative">
              <Lock className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
              <Input
                id="pin"
                type="password"
                value={formData.pin}
                onChange={(e) => onInputChange('pin', e.target.value)}
                placeholder="1111"
                maxLength={4}
                className={`pl-10 ${errors.pin ? 'border-red-500' : ''}`}
              />
            </div>
            {errors.pin && (
              <p className="text-sm text-red-600">{errors.pin}</p>
            )}
            <p className="text-xs text-gray-600">
              Code à 4 chiffres pour le pointage (par défaut: 1111)
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
