'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Calendar, Clock } from 'lucide-react'
import { useOnboardingContext } from '@/contexts/OnboardingContext'
import { DEFAULT_AVAILABILITY } from '@/types/onboarding'
import { useAvailabilityForm } from './step3-availability/useAvailabilityForm'
import { AvailabilityTab } from './step3-availability/AvailabilityTab'
import { DistributionTab } from './step3-availability/DistributionTab'
import { StyledAlert } from '@/components/ui/styled-alert'

/**
 * Step 3: Employee Availability and Weekly Distribution
 *
 * Allows setting:
 * - Available days and time slots
 * - Weekly hours distribution across 4 weeks
 */
export function Step3Availability() {
  const { data, saveStep3 } = useOnboardingContext()
  const [activeTab, setActiveTab] = useState('availability')

  const contractualHours = data.step2?.contractualHours || 35
  const expectedTotal = contractualHours * 4

  const {
    availability,
    weeklyDistribution,
    toggleDay,
    addSlot,
    removeSlot,
    updateSlot,
    updateWeeklyHours,
    calculateWeekTotal,
    calculateGrandTotal,
    isDistributionValid,
    hasAvailability,
    canSubmit,
    getCleanedAvailability,
  } = useAvailabilityForm({
    initialAvailability: data.step3 || DEFAULT_AVAILABILITY,
    initialWeeklyDistribution: data.weeklyDistribution || {},
    contractualHours,
  })

  const grandTotal = calculateGrandTotal()

  const handleSubmit = () => {
    const cleanedAvailability = getCleanedAvailability()
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

            <AvailabilityTab
              availability={availability}
              onToggleDay={toggleDay}
              onAddSlot={addSlot}
              onUpdateSlot={updateSlot}
              onRemoveSlot={removeSlot}
            />

            <DistributionTab
              availability={availability}
              weeklyDistribution={weeklyDistribution}
              contractualHours={contractualHours}
              expectedTotal={expectedTotal}
              grandTotal={grandTotal}
              isDistributionValid={isDistributionValid}
              onUpdateWeeklyHours={updateWeeklyHours}
              calculateWeekTotal={calculateWeekTotal}
            />
          </Tabs>
        </CardContent>
      </Card>

      {!canSubmit && (
        <StyledAlert variant="warning">
          {!hasAvailability && (
            <div>
              ⚠️ Veuillez renseigner au moins un jour de disponibilité avec des créneaux
              horaires.
            </div>
          )}
          {hasAvailability && !isDistributionValid && (
            <div>
              ⚠️ Veuillez remplir la répartition hebdomadaire pour que le total corresponde aux
              heures contractuelles ({expectedTotal.toFixed(1)}h).
            </div>
          )}
        </StyledAlert>
      )}

      <div className="flex justify-end">
        <Button onClick={handleSubmit} size="lg" disabled={!canSubmit}>
          Suivant
        </Button>
      </div>
    </div>
  )
}
