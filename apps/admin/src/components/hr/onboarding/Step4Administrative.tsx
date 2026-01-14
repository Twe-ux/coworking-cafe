'use client'

import { useForm } from 'react-hook-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Check } from 'lucide-react'
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
      color: EMPLOYEE_COLORS[0].value,
      dpaeCompleted: false,
      medicalVisitCompleted: false,
      mutuelleCompleted: false,
      bankDetailsProvided: false,
      registerCompleted: false,
      contractSent: false,
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
        <CardContent className="space-y-6">
          {/* Code de pointage */}
          <div className="space-y-2">
            <Label htmlFor="clockingCode">
              Code de pointage (PIN) <span className="text-destructive">*</span>
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

          {/* Sélecteur de couleur */}
          <div className="space-y-2">
            <Label>
              Couleur (calendrier) <span className="text-destructive">*</span>
            </Label>
            <div className="grid grid-cols-5 gap-2">
              {EMPLOYEE_COLORS.map((colorOption) => {
                const isSelected = selectedColor === colorOption.value

                return (
                  <button
                    key={colorOption.value}
                    type="button"
                    onClick={() => setValue('color', colorOption.value)}
                    className={`h-12 rounded-md border-2 transition-all relative group ${
                      isSelected
                        ? 'ring-2 ring-primary ring-offset-2 border-primary'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    style={{ backgroundColor: colorOption.value }}
                    title={colorOption.name}
                  >
                    {isSelected && (
                      <Check className="w-5 h-5 text-white absolute inset-0 m-auto drop-shadow-lg" />
                    )}
                    <span className="sr-only">{colorOption.name}</span>
                  </button>
                )
              })}
            </div>
            <p className="text-xs text-muted-foreground">
              Sélectionnez une couleur pour identifier l'employé dans le planning
            </p>
          </div>

          {/* Checkboxes de suivi administratif */}
          <div className="space-y-4 pt-4 border-t">
            <Label className="text-base font-semibold">
              Suivi administratif
            </Label>
            <p className="text-xs text-muted-foreground">
              Cochez les étapes administratives déjà complétées en dehors de ce wizard
            </p>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="dpaeCompleted"
                  checked={watch('dpaeCompleted')}
                  onCheckedChange={(checked) =>
                    setValue('dpaeCompleted', checked as boolean)
                  }
                />
                <Label htmlFor="dpaeCompleted" className="font-normal cursor-pointer">
                  DPAE effectuée
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="medicalVisitCompleted"
                  checked={watch('medicalVisitCompleted')}
                  onCheckedChange={(checked) =>
                    setValue('medicalVisitCompleted', checked as boolean)
                  }
                />
                <Label htmlFor="medicalVisitCompleted" className="font-normal cursor-pointer">
                  Visite médicale effectuée
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="mutuelleCompleted"
                  checked={watch('mutuelleCompleted')}
                  onCheckedChange={(checked) =>
                    setValue('mutuelleCompleted', checked as boolean)
                  }
                />
                <Label htmlFor="mutuelleCompleted" className="font-normal cursor-pointer">
                  Mutuelle souscrite
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="bankDetailsProvided"
                  checked={watch('bankDetailsProvided')}
                  onCheckedChange={(checked) =>
                    setValue('bankDetailsProvided', checked as boolean)
                  }
                />
                <Label htmlFor="bankDetailsProvided" className="font-normal cursor-pointer">
                  RIB fourni
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="registerCompleted"
                  checked={watch('registerCompleted')}
                  onCheckedChange={(checked) =>
                    setValue('registerCompleted', checked as boolean)
                  }
                />
                <Label htmlFor="registerCompleted" className="font-normal cursor-pointer">
                  Registre du personnel complété
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="contractSent"
                  checked={watch('contractSent')}
                  onCheckedChange={(checked) =>
                    setValue('contractSent', checked as boolean)
                  }
                />
                <Label htmlFor="contractSent" className="font-normal cursor-pointer">
                  Contrat envoyé
                </Label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" size="lg" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {loading ? 'Création en cours...' : "Créer l'employé"}
        </Button>
      </div>
    </form>
  )
}
