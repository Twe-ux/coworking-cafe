/**
 * Settings panel for managing shift types
 * Allows editing, deleting and creating shift types
 */

import { Edit2, Plus, Trash2, Sunrise, Sun, Sunset, Moon, Zap, Briefcase, Building2, Wrench } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import type { ShiftTypeSettingsProps } from './types'

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

export function ShiftTypeSettings({
  shiftTypes,
  onEdit,
  onDelete,
  onAddNew,
}: ShiftTypeSettingsProps) {
  return (
    <Card className="border-dashed border-gray-300 bg-gray-50">
      <CardContent className="pt-4">
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Manage Shift Types</h4>

          {Object.entries(shiftTypes).map(([key, shiftType]) => {
            const IconComponent = getIconComponent(shiftType.icon)
            return (
              <div
                key={key}
                className="flex items-center justify-between rounded border bg-white p-2"
              >
                <div className="flex items-center gap-2">
                  <IconComponent className="h-4 w-4" />
                  <span className="text-sm font-medium">{shiftType.label}</span>
                  <span className="text-xs text-gray-500">
                    {shiftType.defaultStart} - {shiftType.defaultEnd}
                  </span>
                </div>
                <div className="flex gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(key)}
                    className="h-8 w-8 p-0"
                  >
                    <Edit2 className="h-3 w-3" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(key)}
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            )
          })}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onAddNew}
            className="flex w-full items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add New Shift Type
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
