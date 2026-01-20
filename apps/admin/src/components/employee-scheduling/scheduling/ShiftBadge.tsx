'use client'

import type { Employee } from '@/hooks/useEmployees'
import type { Shift } from '@/hooks/useShifts'

interface ShiftBadgeProps {
  shift: Shift
  employee: Employee
}

/**
 * Badge displaying a shift time range
 */
export function ShiftBadge({ shift, employee }: ShiftBadgeProps) {
  return (
    <div
      className="rounded px-1 py-0.5 text-xs font-medium text-white"
      style={{ backgroundColor: employee.color || '#9CA3AF' }}
      title={`${employee.firstName} - ${shift.startTime} a ${shift.endTime}`}
    >
      {shift.startTime}-{shift.endTime}
    </div>
  )
}
