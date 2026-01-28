'use client'

import { useForm, Controller } from 'react-hook-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { DatePicker } from '@/components/ui/date-picker'
import { useOnboardingContext } from '@/contexts/OnboardingContext'
import type { PersonalInfo } from '@/types/onboarding'

// Formater une date pour les inputs (YYYY-MM-DD)
// Si déjà au bon format, retourne tel quel, sinon nettoie
const formatDateForInput = (dateString?: string): string => {
  if (!dateString) return ''
  // Si déjà au format YYYY-MM-DD, retourne tel quel
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return dateString
  // Sinon, extrait la partie date (cas ISO timestamp)
  return dateString.split('T')[0]
}

export function Step1PersonalInfo() {
  const { data, saveStep1 } = useOnboardingContext()

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<PersonalInfo>({
    defaultValues: data.step1
      ? {
          ...data.step1,
          dateOfBirth: formatDateForInput(data.step1.dateOfBirth),
        }
      : {
          firstName: '',
          lastName: '',
          dateOfBirth: '',
          placeOfBirth: {
            city: '',
            department: '',
            country: 'France',
          },
          nationality: 'Française',
          address: {
            street: '',
            postalCode: '',
            city: '',
          },
          phone: '',
          email: '',
          socialSecurityNumber: '',
        },
  })

  const onSubmit = (formData: PersonalInfo) => {
    saveStep1(formData)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Informations personnelles</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Identité */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">
                Prénom <span className="text-destructive">*</span>
              </Label>
              <Input
                id="firstName"
                {...register('firstName', {
                  required: 'Le prénom est requis',
                  minLength: {
                    value: 2,
                    message: 'Le prénom doit contenir au moins 2 caractères',
                  },
                })}
              />
              {errors.firstName && (
                <p className="text-sm text-destructive">
                  {errors.firstName.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">
                Nom <span className="text-destructive">*</span>
              </Label>
              <Input
                id="lastName"
                {...register('lastName', {
                  required: 'Le nom est requis',
                  minLength: {
                    value: 2,
                    message: 'Le nom doit contenir au moins 2 caractères',
                  },
                })}
              />
              {errors.lastName && (
                <p className="text-sm text-destructive">
                  {errors.lastName.message}
                </p>
              )}
            </div>
          </div>

          {/* Naissance */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">
              Informations de naissance
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">
                  Date de naissance <span className="text-destructive">*</span>
                </Label>
                <Controller
                  name="dateOfBirth"
                  control={control}
                  rules={{ required: 'La date de naissance est requise' }}
                  render={({ field }) => (
                    <DatePicker
                      date={field.value}
                      onDateChange={field.onChange}
                      placeholder="Sélectionner la date de naissance"
                    />
                  )}
                />
                {errors.dateOfBirth && (
                  <p className="text-sm text-destructive">
                    {errors.dateOfBirth.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="placeOfBirth.city">Ville de naissance</Label>
                <Input
                  id="placeOfBirth.city"
                  placeholder="Paris"
                  {...register('placeOfBirth.city')}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="placeOfBirth.department">
                  Département de naissance
                </Label>
                <Input
                  id="placeOfBirth.department"
                  placeholder="75 - Paris"
                  {...register('placeOfBirth.department')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="placeOfBirth.country">Pays de naissance</Label>
                <Input
                  id="placeOfBirth.country"
                  placeholder="France"
                  {...register('placeOfBirth.country')}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="socialSecurityNumber">
                  Numéro de sécurité sociale{' '}
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="socialSecurityNumber"
                  placeholder="1 23 45 67 890 123 45"
                  {...register('socialSecurityNumber', {
                    required: 'Le numéro de sécurité sociale est requis',
                    validate: (value) => {
                      const digitsOnly = value.replace(/\s/g, '');
                      if (!/^\d{15}$/.test(digitsOnly)) {
                        return 'Le numéro doit contenir exactement 15 chiffres';
                      }
                      return true;
                    },
                    setValueAs: (value) => value.replace(/\s/g, ''), // Remove spaces before saving
                  })}
                />
                {errors.socialSecurityNumber && (
                  <p className="text-sm text-destructive">
                    {errors.socialSecurityNumber.message}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  15 chiffres (avec ou sans espaces)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="nationality">Nationalité</Label>
                <Input
                  id="nationality"
                  placeholder="Française"
                  {...register('nationality')}
                />
              </div>
            </div>
          </div>

          {/* Adresse */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="address.street">
                Adresse <span className="text-destructive">*</span>
              </Label>
              <Input
                id="address.street"
                placeholder="Numéro et nom de rue"
                {...register('address.street', {
                  required: "L'adresse est requise",
                })}
              />
              {errors.address?.street && (
                <p className="text-sm text-destructive">
                  {errors.address.street.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="address.postalCode">
                  Code postal <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="address.postalCode"
                  {...register('address.postalCode', {
                    required: 'Le code postal est requis',
                    pattern: {
                      value: /^\d{5}$/,
                      message: 'Le code postal doit contenir 5 chiffres',
                    },
                  })}
                />
                {errors.address?.postalCode && (
                  <p className="text-sm text-destructive">
                    {errors.address.postalCode.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="address.city">
                  Ville <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="address.city"
                  {...register('address.city', {
                    required: 'La ville est requise',
                  })}
                />
                {errors.address?.city && (
                  <p className="text-sm text-destructive">
                    {errors.address.city.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">
                Téléphone <span className="text-destructive">*</span>
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="06 12 34 56 78"
                {...register('phone', {
                  required: 'Le téléphone est requis',
                })}
              />
              {errors.phone && (
                <p className="text-sm text-destructive">{errors.phone.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">
                Email <span className="text-destructive">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="prenom.nom@example.com"
                {...register('email', {
                  required: "L'email est requis",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "L'email n'est pas valide",
                  },
                })}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" size="lg">
          Suivant
        </Button>
      </div>
    </form>
  )
}
