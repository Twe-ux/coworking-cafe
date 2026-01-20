/**
 * Preview component showing the shift configuration
 * Displays employee info, shift type, and schedule
 */

import { Clock, MapPin, Sunrise, Sun, Sunset, Moon, Zap, Briefcase, Building2, Wrench } from 'lucide-react'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { ShiftPreviewProps } from './types'

/**
 * Map icon names to Lucide components
 */
function getIconComponent(iconName: string) {
  const iconMap: Record<string, React.ElementType> = {
    sunrise: Sunrise,
    sun: Sun,
    sunset: Sunset,
    moon: Moon,
    bolt: Zap,
    briefcase: Briefcase,
    'building-2': Building2,
    wrench: Wrench,
  }
  return iconMap[iconName] || Zap
}

export function ShiftPreview({
  employee,
  shiftType,
  formData,
  duration,
}: ShiftPreviewProps) {
  const IconComponent = shiftType ? getIconComponent(shiftType.icon) : Zap
  const colorClass = shiftType?.color || 'border-gray-200 bg-gray-100 text-gray-800'

  return (
    <Card className="border-2 border-dashed border-gray-200 bg-gray-50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm text-gray-700">Shift Preview</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className={`rounded-lg p-3 ${colorClass}`}>
          {/* Employee info */}
          <div className="mb-2 flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <div
                className={`h-full w-full ${employee.color} flex items-center justify-center text-xs font-semibold text-white`}
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

          {/* Shift details */}
          <div className="space-y-1 text-sm">
            <div className="flex items-center gap-2">
              <IconComponent className="h-4 w-4" />
              <span className="font-medium">
                {shiftType?.label || formData.type}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-3 w-3" />
              <span>
                {formData.startTime} - {formData.endTime}
              </span>
              {duration && (
                <span className="text-xs opacity-75">({duration})</span>
              )}
            </div>
            {formData.location && (
              <div className="flex items-center gap-2">
                <MapPin className="h-3 w-3" />
                <span>{formData.location}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
