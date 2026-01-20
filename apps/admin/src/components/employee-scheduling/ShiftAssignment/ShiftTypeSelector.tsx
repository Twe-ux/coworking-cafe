/**
 * Shift type selection component
 * Displays shift types as clickable cards with icons
 */

import { Settings, Sunrise, Sun, Sunset, Moon, Zap, Briefcase, Building2, Wrench } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import type { ShiftTypeSelectorProps } from './types'

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

export function ShiftTypeSelector({
  shiftTypes,
  selectedType,
  onTypeChange,
  onShowSettings,
  showSettingsButton = true,
}: ShiftTypeSelectorProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>Shift Type</Label>
        {showSettingsButton && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onShowSettings}
            className="flex items-center gap-2"
          >
            <Settings className="h-4 w-4" />
            Settings
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {Object.entries(shiftTypes).map(([key, shift]) => {
          const IconComponent = getIconComponent(shift.icon)
          return (
            <button
              key={key}
              type="button"
              onClick={() => onTypeChange(key)}
              className={`rounded-lg border-2 p-3 text-left transition-all ${
                selectedType === key
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="mb-1 flex items-center gap-2">
                <IconComponent className="h-5 w-5" />
                <span className="font-medium">{shift.label}</span>
              </div>
              <div className="text-sm text-gray-600">
                {shift.defaultStart} - {shift.defaultEnd}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
