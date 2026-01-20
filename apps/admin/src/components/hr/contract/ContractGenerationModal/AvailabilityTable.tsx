/**
 * Availability table component
 * Displays employee work schedule slots per day
 */

import type { TimeSlot } from '@/types/hr'
import type { AvailabilityTableProps } from './types'
import { DAYS, TABLE_STYLES } from './constants'
import { useContractCalculations } from './hooks/useContractCalculations'

interface ScheduleRowData {
  isAvailable: boolean
  firstSlot: string
  secondSlot: string
  totalHours: string
}

/**
 * Get schedule row data for a specific day
 */
function getScheduleRowData(
  slots: TimeSlot[] | undefined,
  available: boolean,
  calculateDayHours: (slots: TimeSlot[]) => string
): ScheduleRowData {
  if (!available || !slots || slots.length === 0) {
    return { isAvailable: false, firstSlot: '', secondSlot: '', totalHours: '' }
  }

  const sortedSlots = [...slots].sort((a, b) => a.start.localeCompare(b.start))
  const firstSlot = sortedSlots[0] ? `${sortedSlots[0].start} - ${sortedSlots[0].end}` : ''
  const secondSlot = sortedSlots[1] ? `${sortedSlots[1].start} - ${sortedSlots[1].end}` : ''
  const totalHours = calculateDayHours(sortedSlots)

  return { isAvailable: true, firstSlot, secondSlot, totalHours }
}

export function AvailabilityTable({ employee }: AvailabilityTableProps) {
  const { calculateDayHours } = useContractCalculations({ employee })

  if (!employee.availability) {
    return <div>Tableau des plages horaires a completer selon les besoins</div>
  }

  return (
    <table style={TABLE_STYLES.table}>
      <thead>
        <tr style={TABLE_STYLES.headerRow}>
          <th style={{ ...TABLE_STYLES.headerCell, width: '20%' }}>Jour</th>
          <th style={{ ...TABLE_STYLES.headerCell, width: '30%' }} />
          <th style={{ ...TABLE_STYLES.headerCell, width: '30%' }} />
          <th style={{ ...TABLE_STYLES.headerCell, width: '20%' }}>Total</th>
        </tr>
      </thead>
      <tbody>
        {DAYS.map(({ key, label }) => {
          const schedule = employee.availability?.[key]
          const rowData = getScheduleRowData(
            schedule?.slots,
            schedule?.available ?? false,
            calculateDayHours
          )

          return (
            <tr
              key={key}
              style={!rowData.isAvailable ? TABLE_STYLES.unavailableRow : undefined}
            >
              <td style={TABLE_STYLES.labelCell}>{label}</td>
              <td style={TABLE_STYLES.cell}>{rowData.firstSlot}</td>
              <td style={TABLE_STYLES.cell}>{rowData.secondSlot}</td>
              <td style={{ ...TABLE_STYLES.cell, fontWeight: 'bold' }}>
                {rowData.totalHours}
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
