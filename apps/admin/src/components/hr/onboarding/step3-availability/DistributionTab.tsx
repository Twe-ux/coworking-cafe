import { TabsContent } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { WeeklyDistributionTable } from './WeeklyDistributionTable'
import type { Availability, WeeklyDistributionData } from '@/types/onboarding'

/**
 * Props for DistributionTab component
 */
interface DistributionTabProps {
  availability: Availability
  weeklyDistribution: WeeklyDistributionData
  contractualHours: number
  expectedTotal: number
  grandTotal: number
  isDistributionValid: boolean
  onUpdateWeeklyHours: (
    day: keyof Availability,
    week: 'week1' | 'week2' | 'week3' | 'week4',
    value: string
  ) => void
  calculateWeekTotal: (week: string) => number
}

/**
 * Distribution tab content component
 */
export function DistributionTab({
  availability,
  weeklyDistribution,
  contractualHours,
  expectedTotal,
  grandTotal,
  isDistributionValid,
  onUpdateWeeklyHours,
  calculateWeekTotal,
}: DistributionTabProps) {
  return (
    <TabsContent value="distribution" className="space-y-6 mt-6">
      <div className="space-y-4">
        <div>
          <h4 className="font-semibold text-sm mb-2">
            Répartition de la durée du travail par semaine
          </h4>
          <p className="text-xs text-muted-foreground">
            Indiquez le nombre d&apos;heures de travail pour chaque jour et chaque semaine du
            mois. Les jours non disponibles sont marqués comme &quot;Repos&quot;.
          </p>
        </div>

        <WeeklyDistributionTable
          availability={availability}
          weeklyDistribution={weeklyDistribution}
          onUpdateWeeklyHours={onUpdateWeeklyHours}
          calculateWeekTotal={calculateWeekTotal}
        />

        <Alert variant={isDistributionValid ? 'default' : 'destructive'}>
          <AlertDescription>
            <div className="flex items-center gap-2">
              {isDistributionValid ? (
                <span className="text-green-600 font-semibold">
                  ✓ Total mensuel : {grandTotal.toFixed(1)}h
                </span>
              ) : (
                <span className="font-semibold">⚠️ Total mensuel : {grandTotal.toFixed(1)}h</span>
              )}
            </div>
            <div className="text-sm mt-1">
              Attendu : {expectedTotal.toFixed(1)}h ({contractualHours}h/semaine × 4 semaines)
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
  )
}
