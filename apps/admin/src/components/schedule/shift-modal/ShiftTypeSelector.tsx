'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Edit2, Plus, Settings, Trash2 } from 'lucide-react'
import type { ShiftTypeConfig } from './types'

interface ShiftTypeSelectorProps {
  shiftTypes: Record<string, ShiftTypeConfig>
  selectedType: string
  showSettings: boolean
  onTypeChange: (type: string) => void
  onToggleSettings: () => void
  onEditType: (key: string) => void
  onDeleteType: (key: string) => void
  onAddNew: () => void
}

/**
 * Shift type selection with settings panel
 */
export function ShiftTypeSelector({
  shiftTypes,
  selectedType,
  showSettings,
  onTypeChange,
  onToggleSettings,
  onEditType,
  onDeleteType,
  onAddNew,
}: ShiftTypeSelectorProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>Type de creneau</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onToggleSettings}
          className="flex items-center gap-2"
        >
          <Settings className="h-4 w-4" />
          Reglages
        </Button>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <Card className="border-dashed border-gray-300 bg-gray-50">
          <CardContent className="pt-4">
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Gerer les types de creneaux</h4>
              {Object.entries(shiftTypes).map(([key, shiftType]) => (
                <div
                  key={key}
                  className="flex items-center justify-between rounded border bg-white p-2"
                >
                  <div className="flex items-center gap-2">
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
                      onClick={() => onEditType(key)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit2 className="h-3 w-3" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => onDeleteType(key)}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onAddNew}
                className="flex w-full items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Ajouter un type
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Type Selection Grid */}
      <div className="grid grid-cols-2 gap-3">
        {Object.entries(shiftTypes).map(([key, shift]) => (
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
              <span className="font-medium">{shift.label}</span>
            </div>
            <div className="text-sm text-gray-600">
              {shift.defaultStart} - {shift.defaultEnd}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
