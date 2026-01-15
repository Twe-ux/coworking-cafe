'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Plus, Trash2, Calendar, Clock } from 'lucide-react'
import { useOnboardingContext } from '@/contexts/OnboardingContext'
import type { Availability, AvailabilitySlot, WeeklyDistributionData } from '@/types/onboarding'
import { DEFAULT_AVAILABILITY } from '@/types/onboarding'

const DAYS = [
  { key: 'monday', label: 'Lundi' },
  { key: 'tuesday', label: 'Mardi' },
  { key: 'wednesday', label: 'Mercredi' },
  { key: 'thursday', label: 'Jeudi' },
  { key: 'friday', label: 'Vendredi' },
  { key: 'saturday', label: 'Samedi' },
  { key: 'sunday', label: 'Dimanche' },
] as const

export function Step3Availability() {
  const { data, saveStep3 } = useOnboardingContext()
  const [availability, setAvailability] = useState<Availability>(
    data.step3 || DEFAULT_AVAILABILITY
  )
  const [weeklyDistribution, setWeeklyDistribution] = useState<WeeklyDistributionData>(
    data.weeklyDistribution || {}
  )
  const [activeTab, setActiveTab] = useState('availability')

  const toggleDay = (day: keyof Availability) => {
    setAvailability((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        available: !prev[day].available,
      },
    }))
  }

  const addSlot = (day: keyof Availability) => {
    setAvailability((prev) => {
      const newSlot = {
        start: '09:00',
        end: '18:00',
        id: `${day}-${Date.now()}-${Math.random()}`
      }
      return {
        ...prev,
        [day]: {
          ...prev[day],
          slots: [...prev[day].slots, newSlot],
        },
      }
    })
  }

  const removeSlot = (day: keyof Availability, slotId: string) => {
    setAvailability((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        slots: prev[day].slots.filter((slot: any) => slot.id !== slotId),
      },
    }))
  }

  const updateSlot = (
    day: keyof Availability,
    slotId: string,
    field: 'start' | 'end',
    value: string
  ) => {
    setAvailability((prev) => {
      // Créer une copie profonde des slots
      const updatedSlots = prev[day].slots.map((slot: any) => ({
        start: slot.start,
        end: slot.end,
        id: slot.id,
      }))

      // Trouver et mettre à jour le slot par son ID
      const slotIndex = updatedSlots.findIndex((s: any) => s.id === slotId)
      if (slotIndex !== -1) {
        updatedSlots[slotIndex] = {
          ...updatedSlots[slotIndex],
          [field]: value,
        }
      }

      // Ne PAS trier pendant la saisie pour éviter les bugs de focus
      // Le tri se fera automatiquement à la soumission du formulaire

      return {
        ...prev,
        [day]: {
          ...prev[day],
          slots: updatedSlots,
        },
      }
    })
  }

  const sortSlots = (day: keyof Availability) => {
    setAvailability((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        slots: [...prev[day].slots].sort((a, b) => a.start.localeCompare(b.start)),
      },
    }))
  }

  // Calculer le total d'heures par semaine
  const calculateWeekTotal = (week: string) => {
    return DAYS.reduce((total, { key }) => {
      const hours = parseFloat(weeklyDistribution[key]?.[week as 'week1' | 'week2' | 'week3' | 'week4'] || '0')
      return total + hours
    }, 0)
  }

  // Calculer le total général
  const calculateGrandTotal = () => {
    return ['week1', 'week2', 'week3', 'week4'].reduce((sum, week) => {
      return sum + calculateWeekTotal(week)
    }, 0)
  }

  // Récupérer les heures contractuelles depuis Step 2
  const contractualHours = data.step2?.contractualHours || 35
  const expectedTotal = contractualHours * 4
  const grandTotal = calculateGrandTotal()
  const isDistributionValid = Math.abs(grandTotal - expectedTotal) < 0.1

  // Vérifier qu'au moins un jour a des créneaux
  const hasAvailability = DAYS.some(({ key }) =>
    availability[key].available && availability[key].slots.length > 0
  )

  // Le bouton est activé si disponibilités ET répartition sont valides
  const canSubmit = hasAvailability && isDistributionValid

  const handleSubmit = () => {
    // Nettoyer les IDs et trier les créneaux avant de sauvegarder
    const cleanedAvailability = Object.keys(availability).reduce((acc, day) => {
      const dayKey = day as keyof Availability
      const sortedSlots = [...availability[dayKey].slots]
        .map((slot: any) => ({
          start: slot.start,
          end: slot.end,
        }))
        .sort((a, b) => a.start.localeCompare(b.start))

      return {
        ...acc,
        [day]: {
          available: availability[dayKey].available,
          slots: sortedSlots,
        },
      }
    }, {} as Availability)

    saveStep3(cleanedAvailability, weeklyDistribution)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Disponibilités et Planning</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="availability" className="gap-2">
                <Clock className="w-4 h-4" />
                Disponibilités
              </TabsTrigger>
              <TabsTrigger value="distribution" className="gap-2">
                <Calendar className="w-4 h-4" />
                Répartition hebdomadaire
              </TabsTrigger>
            </TabsList>

            {/* Onglet 1: Disponibilités */}
            <TabsContent value="availability" className="space-y-6 mt-6">
              {DAYS.map(({ key, label }) => (
            <div key={key} className="space-y-3 pb-4 border-b last:border-0">
              <div className="flex items-center gap-3">
                <Checkbox
                  id={key}
                  checked={availability[key].available}
                  onCheckedChange={() => toggleDay(key)}
                />
                <Label htmlFor={key} className="font-semibold text-base">
                  {label}
                </Label>
              </div>

              {availability[key].available && (
                <div className="ml-8 space-y-2">
                  <div className="flex flex-wrap gap-2">
                    {availability[key].slots.map((slot: any) => (
                      <div key={slot.id} className="flex items-center gap-2">
                        <Input
                          type="time"
                          value={slot.start}
                          onChange={(e) =>
                            updateSlot(key, slot.id, 'start', e.target.value)
                          }
                          className="w-28"
                        />
                        <span className="text-muted-foreground text-sm">à</span>
                        <Input
                          type="time"
                          value={slot.end}
                          onChange={(e) =>
                            updateSlot(key, slot.id, 'end', e.target.value)
                          }
                          className="w-28"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeSlot(key, slot.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addSlot(key)}
                    className="gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Ajouter un créneau
                  </Button>
                </div>
              )}
            </div>
          ))}
            </TabsContent>

            {/* Onglet 2: Répartition hebdomadaire */}
            <TabsContent value="distribution" className="space-y-6 mt-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-sm mb-2">
                    Répartition de la durée du travail par semaine
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Indiquez le nombre d'heures de travail pour chaque jour et chaque semaine du mois.
                    Les jours non disponibles sont marqués comme "Repos".
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-border">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="border border-border p-2 text-left font-semibold">
                          Jour
                        </th>
                        <th className="border border-border p-2 text-center font-semibold">
                          Semaine 1
                        </th>
                        <th className="border border-border p-2 text-center font-semibold">
                          Semaine 2
                        </th>
                        <th className="border border-border p-2 text-center font-semibold">
                          Semaine 3
                        </th>
                        <th className="border border-border p-2 text-center font-semibold">
                          Semaine 4
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {DAYS.map(({ key, label }) => {
                        const dayAvailable = availability[key].available

                        return (
                          <tr
                            key={key}
                            className={!dayAvailable ? 'bg-muted/30' : ''}
                          >
                            <td className="border border-border p-2 font-semibold">
                              {label}
                            </td>
                            {['week1', 'week2', 'week3', 'week4'].map((week) => (
                              <td key={week} className="border border-border p-2">
                                {dayAvailable ? (
                                  <Input
                                    type="number"
                                    min="0"
                                    max="12"
                                    step="0.5"
                                    value={
                                      weeklyDistribution[key]?.[week as 'week1' | 'week2' | 'week3' | 'week4'] || ''
                                    }
                                    onChange={(e) =>
                                      setWeeklyDistribution((prev) => ({
                                        ...prev,
                                        [key]: {
                                          ...prev[key],
                                          [week]: e.target.value,
                                        },
                                      }))
                                    }
                                    placeholder="0"
                                    className="text-center h-8"
                                  />
                                ) : (
                                  <span className="text-muted-foreground text-sm block text-center">
                                    Repos
                                  </span>
                                )}
                              </td>
                            ))}
                          </tr>
                        )
                      })}
                    </tbody>
                    <tfoot>
                      <tr className="bg-muted/50 font-semibold">
                        <td className="border border-border p-2">Total</td>
                        <td className="border border-border p-2 text-center">
                          {calculateWeekTotal('week1').toFixed(1)}h
                        </td>
                        <td className="border border-border p-2 text-center">
                          {calculateWeekTotal('week2').toFixed(1)}h
                        </td>
                        <td className="border border-border p-2 text-center">
                          {calculateWeekTotal('week3').toFixed(1)}h
                        </td>
                        <td className="border border-border p-2 text-center">
                          {calculateWeekTotal('week4').toFixed(1)}h
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                <Alert variant={isDistributionValid ? 'default' : 'destructive'}>
                  <AlertDescription>
                    <div className="flex items-center gap-2">
                      {isDistributionValid ? (
                        <span className="text-green-600 font-semibold">
                          ✓ Total mensuel : {grandTotal.toFixed(1)}h
                        </span>
                      ) : (
                        <span className="font-semibold">
                          ⚠️ Total mensuel : {grandTotal.toFixed(1)}h
                        </span>
                      )}
                    </div>
                    <div className="text-sm mt-1">
                      Attendu : {expectedTotal.toFixed(1)}h ({contractualHours}h/semaine × 4
                      semaines)
                    </div>
                    {!isDistributionValid && (
                      <div className="text-sm mt-2">
                        Le total ne correspond pas aux heures contractuelles
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {!canSubmit && (
        <Alert>
          <AlertDescription>
            {!hasAvailability && (
              <div>⚠️ Veuillez renseigner au moins un jour de disponibilité avec des créneaux horaires.</div>
            )}
            {hasAvailability && !isDistributionValid && (
              <div>⚠️ Veuillez remplir la répartition hebdomadaire pour que le total corresponde aux heures contractuelles ({expectedTotal.toFixed(1)}h).</div>
            )}
          </AlertDescription>
        </Alert>
      )}

      <div className="flex justify-end">
        <Button onClick={handleSubmit} size="lg" disabled={!canSubmit}>
          Suivant
        </Button>
      </div>
    </div>
  )
}
