/**
 * Distribution table component
 * Displays weekly hours distribution across 4 weeks
 */

import type { DistributionTableProps } from './types'
import { DAYS, WEEKS, WEEK_KEYS, TABLE_STYLES } from './constants'

/**
 * Calculate total hours for a specific week
 */
function calculateWeekTotal(
  weekKey: string,
  weeklyDistributionData: Record<string, Record<string, string>>
): string {
  const total = DAYS.reduce((sum, { key }) => {
    const hours = parseFloat(weeklyDistributionData[key]?.[weekKey] || '0')
    return sum + hours
  }, 0)
  return `${total.toFixed(1)}h`
}

export function DistributionTable({ employee }: DistributionTableProps) {
  const weeklyDistributionData = employee.workSchedule?.weeklyDistributionData

  if (!weeklyDistributionData) {
    return <div>Tableau de repartition hebdomadaire a completer selon le planning</div>
  }

  return (
    <table style={TABLE_STYLES.table}>
      {/* Header */}
      <thead>
        <tr style={TABLE_STYLES.headerRow}>
          <th style={{ ...TABLE_STYLES.headerCell, textAlign: 'left' }}>Jour</th>
          {WEEKS.map((week) => (
            <th key={week} style={TABLE_STYLES.headerCell}>
              {week}
            </th>
          ))}
        </tr>
      </thead>

      {/* Body - Days */}
      <tbody>
        {DAYS.map(({ key, label }) => {
          const schedule = employee.availability?.[key]
          const isAvailable = schedule?.available ?? false

          return (
            <tr key={key} style={!isAvailable ? TABLE_STYLES.unavailableRow : undefined}>
              <td style={{ ...TABLE_STYLES.cell, fontWeight: 'bold', textAlign: 'left' }}>
                {label}
              </td>
              {WEEK_KEYS.map((weekKey) => (
                <td key={weekKey} style={TABLE_STYLES.cell}>
                  {isAvailable ? `${weeklyDistributionData[key]?.[weekKey] || '0'}h` : 'Repos'}
                </td>
              ))}
            </tr>
          )
        })}
      </tbody>

      {/* Footer - Totals */}
      <tfoot>
        <tr style={TABLE_STYLES.footerRow}>
          <td style={{ ...TABLE_STYLES.cell, textAlign: 'left' }}>Total</td>
          {WEEK_KEYS.map((weekKey) => (
            <td key={weekKey} style={TABLE_STYLES.cell}>
              {calculateWeekTotal(weekKey, weeklyDistributionData)}
            </td>
          ))}
        </tr>
      </tfoot>
    </table>
  )
}
