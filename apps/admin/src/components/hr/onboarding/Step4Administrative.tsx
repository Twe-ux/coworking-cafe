'use client'

import { useForm } from 'react-hook-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2 } from 'lucide-react'
import { useOnboardingContext } from '@/contexts/OnboardingContext'
import type { AdministrativeInfo } from '@/types/onboarding'
import { EMPLOYEE_COLORS } from '@/types/onboarding'

export function Step4Administrative() {
  const { data, saveStep4, loading, error } = useOnboardingContext()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AdministrativeInfo>({
    defaultValues: data.step4 || {
      clockingCode: '',
      color: EMPLOYEE_COLORS[0],
      role: 'Staff',
      bankDetails: {
        iban: '',
        bic: '',
        bankName: '',
      },
    },
  })

  const selectedColor = watch('color')

  const onSubmit = (formData: AdministrativeInfo) => {
    saveStep4(formData)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Informations administratives</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Code pointage */}
          <div className="space-y-2">
            <Label htmlFor="clockingCode">
              Code de pointage (PIN){' '}
              <span className="text-destructive">*</span>
            </Label>
            <Input
              id="clockingCode"
              type="text"
              maxLength={4}
              placeholder="1234"
              {...register('clockingCode', {
                required: 'Le code de pointage est requis',
                pattern: {
                  value: /^\d{4}$/,
                  message: 'Le code doit contenir 4 chiffres',
                },
              })}
            />
            {errors.clockingCode && (
              <p className="text-sm text-destructive">
                {errors.clockingCode.message}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              4 chiffres pour le système de pointage
            </p>
          </div>

          {/* Rôle planning */}
          <div className="space-y-2">
            <Label htmlFor="role">
              Rôle (planning) <span className="text-destructive">*</span>
            </Label>
            <Select
              onValueChange={(value) =>
                setValue(
                  'role',
                  value as
                    | 'Manager'
                    | 'Reception'
                    | 'Security'
                    | 'Maintenance'
                    | 'Cleaning'
                    | 'Staff'
                )
              }
              defaultValue={data.step4?.role || 'Staff'}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un rôle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Manager">Manager</SelectItem>
                <SelectItem value="Reception">Réception</SelectItem>
                <SelectItem value="Security">Sécurité</SelectItem>
                <SelectItem value="Maintenance">Maintenance</SelectItem>
                <SelectItem value="Cleaning">Nettoyage</SelectItem>
                <SelectItem value="Staff">Personnel</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Couleur pour calendrier */}
          <div className="space-y-2">
            <Label>
              Couleur (calendrier) <span className="text-destructive">*</span>
            </Label>
            <div className="grid grid-cols-5 gap-2">
              {EMPLOYEE_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setValue('color', color)}
                  className={`
                    h-10 rounded-md border-2 transition-all
                    ${color}
                    ${selectedColor === color ? 'ring-2 ring-primary ring-offset-2' : 'border-transparent'}
                  `}
                />
              ))}
            </div>
          </div>

          {/* Coordonnées bancaires (optionnel) */}
          <div className="space-y-4 pt-4 border-t">
            <Label className="text-base font-semibold">
              Coordonnées bancaires (optionnel)
            </Label>

            <div className="space-y-2">
              <Label htmlFor="bankDetails.iban">IBAN</Label>
              <Input
                id="bankDetails.iban"
                placeholder="FR76 1234 5678 9012 3456 7890 123"
                {...register('bankDetails.iban')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bankDetails.bic">BIC</Label>
              <Input
                id="bankDetails.bic"
                placeholder="BNPAFRPPXXX"
                {...register('bankDetails.bic')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bankDetails.bankName">Nom de la banque</Label>
              <Input
                id="bankDetails.bankName"
                placeholder="BNP Paribas"
                {...register('bankDetails.bankName')}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" size="lg" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {loading ? 'Création en cours...' : 'Créer l'employé'}
        </Button>
      </div>
    </form>
  )
}
