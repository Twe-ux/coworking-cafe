/**
 * Dialog for editing or creating shift types
 */

import { Sunrise, Sun, Sunset, Moon, Zap, Briefcase, Building2, Wrench } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { ShiftTypeEditorProps } from './types'
import { COLOR_THEMES } from './types'
import { QUICK_EMOJI_OPTIONS } from './constants'

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

export function ShiftTypeEditor({
  open,
  onClose,
  editingKey,
  shiftTypes,
  newShiftType,
  onSave,
  onUpdateShiftType,
  onUpdateNewShiftType,
}: ShiftTypeEditorProps) {
  const isNew = editingKey === 'new'
  const currentValues = isNew
    ? newShiftType
    : editingKey
      ? shiftTypes[editingKey]
      : null

  if (!currentValues) return null

  const handleFieldChange = (field: 'label' | 'defaultStart' | 'defaultEnd' | 'icon' | 'color', value: string) => {
    if (isNew) {
      onUpdateNewShiftType(field, value)
    } else if (editingKey) {
      onUpdateShiftType(editingKey, field, value)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>
            {isNew ? 'Add New Shift Type' : 'Edit Shift Type'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Label */}
          <div className="space-y-2">
            <Label>Label</Label>
            <Input
              value={currentValues.label}
              onChange={(e) => handleFieldChange('label', e.target.value)}
              placeholder="e.g., Morning, Custom Shift"
            />
          </div>

          {/* Time inputs */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Time</Label>
              <Input
                type="time"
                value={currentValues.defaultStart}
                onChange={(e) => handleFieldChange('defaultStart', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>End Time</Label>
              <Input
                type="time"
                value={currentValues.defaultEnd}
                onChange={(e) => handleFieldChange('defaultEnd', e.target.value)}
              />
            </div>
          </div>

          {/* Icon selection */}
          <div className="space-y-2">
            <Label>Icon</Label>
            <div className="flex gap-2">
              <div className="flex flex-wrap gap-1">
                {QUICK_EMOJI_OPTIONS.map((iconName) => {
                  const IconComponent = getIconComponent(iconName)
                  return (
                    <button
                      key={iconName}
                      type="button"
                      className={`rounded p-2 hover:bg-gray-100 ${
                        currentValues.icon === iconName ? 'bg-blue-100 ring-2 ring-blue-500' : ''
                      }`}
                      onClick={() => handleFieldChange('icon', iconName)}
                    >
                      <IconComponent className="h-5 w-5" />
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Color theme */}
          <div className="space-y-2">
            <Label>Color Theme</Label>
            <Select
              value={currentValues.color}
              onValueChange={(value) => handleFieldChange('color', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {COLOR_THEMES.map((theme) => (
                  <SelectItem key={theme.value} value={theme.value}>
                    {theme.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onSave}>
            {isNew ? 'Add' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
