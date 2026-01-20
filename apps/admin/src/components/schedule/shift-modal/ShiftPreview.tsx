'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Clock } from 'lucide-react'
import type { Employee } from '@/types/hr'
import type { ShiftTypeConfig } from './types'

interface ShiftPreviewProps {
  employee: Employee
  shiftType: ShiftTypeConfig | undefined
  typeName: string
  startTime: string
  endTime: string
  duration: string
}

/**
 * Preview card showing how the shift will appear
 */
export function ShiftPreview({
  employee,
  shiftType,
  typeName,
  startTime,
  endTime,
  duration,
}: ShiftPreviewProps) {
  const colorClass = shiftType?.color || 'border-gray-200 bg-gray-100 text-gray-800'

  return (
    <Card className="border-2 border-dashed border-gray-200 bg-gray-50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm text-gray-700">
          Apercu du creneau
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className={`rounded-lg p-3 ${colorClass}`}>
          {/* Employee Info */}
          <div className="mb-2 flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <div
                className="flex h-full w-full items-center justify-center text-xs font-semibold text-white"
                style={{ backgroundColor: employee.color || '#9CA3AF' }}
              >
                {employee.firstName.charAt(0)}
                {employee.lastName.charAt(0)}
              </div>
            </Avatar>
            <div>
              <div className="text-sm font-medium">
                {employee.firstName} {employee.lastName}
              </div>
              <Badge variant="secondary" className="text-xs">
                {employee.employeeRole}
              </Badge>
            </div>
          </div>

          {/* Shift Details */}
          <div className="space-y-1 text-sm">
            <div className="flex items-center gap-2">
              <span className="font-medium">
                {shiftType?.label || typeName}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-3 w-3" />
              <span>
                {startTime} - {endTime}
              </span>
              {duration && (
                <span className="text-xs opacity-75">({duration})</span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
