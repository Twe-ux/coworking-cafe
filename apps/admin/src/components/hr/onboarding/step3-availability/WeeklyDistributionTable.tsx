import { Input } from '@/components/ui/input'
import type { Availability, WeeklyDistributionData } from '@/types/onboarding'
import { DAYS, WEEKS } from './types'

/**
 * Props for WeeklyDistributionTable component
 */
interface WeeklyDistributionTableProps {
  availability: Availability
  weeklyDistribution: WeeklyDistributionData
  onUpdateWeeklyHours: (
    day: keyof Availability,
    week: 'week1' | 'week2' | 'week3' | 'week4',
    value: string
  ) => void
  calculateWeekTotal: (week: string) => number
}

/**
 * Weekly distribution table component
 */
export function WeeklyDistributionTable({
  availability,
  weeklyDistribution,
  onUpdateWeeklyHours,
  calculateWeekTotal,
}: WeeklyDistributionTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse border border-border">
        <thead>
          <tr className="bg-muted/50">
            <th className="border border-border p-2 text-left font-semibold">Jour</th>
            <th className="border border-border p-2 text-center font-semibold">Semaine 1</th>
            <th className="border border-border p-2 text-center font-semibold">Semaine 2</th>
            <th className="border border-border p-2 text-center font-semibold">Semaine 3</th>
            <th className="border border-border p-2 text-center font-semibold">Semaine 4</th>
          </tr>
        </thead>
        <tbody>
          {DAYS.map(({ key, label }) => {
            const dayAvailable = availability[key].available

            return (
              <tr key={key} className={!dayAvailable ? 'bg-muted/30' : ''}>
                <td className="border border-border p-2 font-semibold">{label}</td>
                {WEEKS.map((week) => (
                  <td key={week} className="border border-border p-2">
                    {dayAvailable ? (
                      <Input
                        type="number"
                        min="0"
                        max="12"
                        step="0.5"
                        value={weeklyDistribution[key]?.[week] || ''}
                        onChange={(e) => onUpdateWeeklyHours(key, week, e.target.value)}
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
            {WEEKS.map((week) => (
              <td key={week} className="border border-border p-2 text-center">
                {calculateWeekTotal(week).toFixed(1)}h
              </td>
            ))}
          </tr>
        </tfoot>
      </table>
    </div>
  )
}
