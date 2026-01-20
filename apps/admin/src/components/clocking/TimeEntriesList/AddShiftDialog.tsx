'use client'

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
import type { Employee } from '@/hooks/useEmployees'
import type { NewShiftData } from './types'

interface AddShiftDialogProps {
  isOpen: boolean
  employees: Employee[]
  newShift: NewShiftData
  isCreating: boolean
  onShiftChange: (data: Partial<NewShiftData>) => void
  onCreate: () => void
  onCancel: () => void
}

export function AddShiftDialog({
  isOpen,
  employees,
  newShift,
  isCreating,
  onShiftChange,
  onCreate,
  onCancel,
}: AddShiftDialogProps) {
  if (!isOpen) return null

  return (
    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
      <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
        <h3 className="mb-4 text-lg font-semibold">Ajouter un nouveau shift</h3>

        <div className="space-y-4">
          {/* Employee selection */}
          <div>
            <Label htmlFor="shift-employee">Employe *</Label>
            <Select
              value={newShift.employeeId}
              onValueChange={(value) => onShiftChange({ employeeId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selectionner un employe" />
              </SelectTrigger>
              <SelectContent>
                {employees.map((employee) => (
                  <SelectItem key={employee.id} value={employee.id}>
                    <div className="flex items-center gap-2">
                      <div
                        className={`h-2 w-2 rounded-full ${employee.color}`}
                      />
                      {employee.firstName} {employee.lastName}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date */}
          <div>
            <Label htmlFor="shift-date">Date *</Label>
            <Input
              id="shift-date"
              type="date"
              value={newShift.date}
              onChange={(e) => onShiftChange({ date: e.target.value })}
            />
          </div>

          {/* Start time */}
          <div>
            <Label htmlFor="shift-clockin">Heure de debut *</Label>
            <Input
              id="shift-clockin"
              type="time"
              value={newShift.clockIn}
              onChange={(e) => onShiftChange({ clockIn: e.target.value })}
            />
          </div>

          {/* End time */}
          <div>
            <Label htmlFor="shift-clockout">Heure de fin (optionnel)</Label>
            <Input
              id="shift-clockout"
              type="time"
              value={newShift.clockOut}
              onChange={(e) => onShiftChange({ clockOut: e.target.value })}
            />
            <p className="mt-1 text-xs text-gray-500">
              Laisser vide pour creer un shift actif
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel} disabled={isCreating}>
            Annuler
          </Button>
          <Button onClick={onCreate} disabled={isCreating}>
            {isCreating ? 'Creation...' : 'Creer le shift'}
          </Button>
        </div>
      </div>
    </div>
  )
}
