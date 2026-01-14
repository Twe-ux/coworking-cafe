'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Plus, Trash2 } from 'lucide-react'
import { useOnboardingContext } from '@/contexts/OnboardingContext'
import type { Availability, AvailabilitySlot } from '@/types/onboarding'
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
    setAvailability((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        slots: [...prev[day].slots, { start: '09:00', end: '18:00' }],
      },
    }))
  }

  const removeSlot = (day: keyof Availability, index: number) => {
    setAvailability((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        slots: prev[day].slots.filter((_, i) => i !== index),
      },
    }))
  }

  const updateSlot = (
    day: keyof Availability,
    index: number,
    field: 'start' | 'end',
    value: string
  ) => {
    setAvailability((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        slots: prev[day].slots.map((slot, i) =>
          i === index ? { ...slot, [field]: value } : slot
        ),
      },
    }))
  }

  const handleSubmit = () => {
    saveStep3(availability)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Disponibilités horaires</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
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
                  {availability[key].slots.map((slot, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        type="time"
                        value={slot.start}
                        onChange={(e) =>
                          updateSlot(key, index, 'start', e.target.value)
                        }
                        className="w-32"
                      />
                      <span className="text-muted-foreground">à</span>
                      <Input
                        type="time"
                        value={slot.end}
                        onChange={(e) =>
                          updateSlot(key, index, 'end', e.target.value)
                        }
                        className="w-32"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeSlot(key, index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}

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
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSubmit} size="lg">
          Suivant
        </Button>
      </div>
    </div>
  )
}
