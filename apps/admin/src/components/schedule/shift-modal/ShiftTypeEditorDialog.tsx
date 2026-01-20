'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { ShiftTypeConfig } from './types'
import { SHIFT_COLOR_OPTIONS } from './types'

interface ShiftTypeEditorDialogProps {
  open: boolean
  editingKey: string | null
  shiftTypes: Record<string, ShiftTypeConfig>
  onClose: () => void
  onSave: (key: string, config: ShiftTypeConfig) => void
  onUpdate: (key: string, updates: Partial<ShiftTypeConfig>) => void
}

const DEFAULT_NEW_TYPE: ShiftTypeConfig = {
  label: '',
  defaultStart: '09:00',
  defaultEnd: '17:00',
  color: 'bg-gray-100 text-gray-800 border-gray-200',
  icon: '',
}

/**
 * Dialog for creating/editing shift types
 */
export function ShiftTypeEditorDialog({
  open,
  editingKey,
  shiftTypes,
  onClose,
  onSave,
  onUpdate,
}: ShiftTypeEditorDialogProps) {
  const isNew = editingKey === 'new'
  const existingConfig = editingKey && editingKey !== 'new' ? shiftTypes[editingKey] : null

  const [localConfig, setLocalConfig] = useState<ShiftTypeConfig>(
    existingConfig || DEFAULT_NEW_TYPE
  )

  // Reset local state when dialog opens with new editing key
  useEffect(() => {
    if (open) {
      if (editingKey === 'new') {
        setLocalConfig(DEFAULT_NEW_TYPE)
      } else if (editingKey && shiftTypes[editingKey]) {
        setLocalConfig(shiftTypes[editingKey])
      }
    }
  }, [open, editingKey, shiftTypes])

  const handleSave = () => {
    if (isNew) {
      if (localConfig.label) {
        const key = localConfig.label.toLowerCase().replace(/\s+/g, '_')
        onSave(key, localConfig)
      }
    } else if (editingKey) {
      onUpdate(editingKey, localConfig)
    }
    onClose()
  }

  const updateField = <K extends keyof ShiftTypeConfig>(
    field: K,
    value: ShiftTypeConfig[K]
  ) => {
    setLocalConfig((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>
            {isNew ? 'Ajouter un type' : 'Modifier le type'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Label */}
          <div className="space-y-2">
            <Label>Libelle</Label>
            <Input
              value={localConfig.label}
              onChange={(e) => updateField('label', e.target.value)}
              placeholder="ex: Morning, Custom Shift"
            />
          </div>

          {/* Times */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Heure debut</Label>
              <Input
                type="time"
                value={localConfig.defaultStart}
                onChange={(e) => updateField('defaultStart', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Heure fin</Label>
              <Input
                type="time"
                value={localConfig.defaultEnd}
                onChange={(e) => updateField('defaultEnd', e.target.value)}
              />
            </div>
          </div>

          {/* Color */}
          <div className="space-y-2">
            <Label>Theme de couleur</Label>
            <Select
              value={localConfig.color}
              onValueChange={(value) => updateField('color', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SHIFT_COLOR_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button onClick={handleSave}>
            {isNew ? 'Ajouter' : 'Enregistrer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
