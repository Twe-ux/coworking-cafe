'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertCircle,
  Calendar,
  Clock,
  Edit2,
  Plus,
  Save,
  Settings,
  Trash2,
  X,
} from 'lucide-react'
import type { Shift, CreateShiftInput } from '@/types/shift'

interface Employee {
  id: string
  firstName: string
  lastName: string
  fullName: string
  role: string
  color: string
}

interface ShiftModalProps {
  open: boolean
  onClose: () => void
  onSave: (data: CreateShiftInput) => Promise<{ success: boolean; error?: string }>
  onUpdate?: (id: string, data: Partial<Shift>) => Promise<{ success: boolean; error?: string }>
  onDelete?: (id: string) => Promise<{ success: boolean; error?: string }>
  employees: Employee[]
  selectedDate: Date
  existingShift?: Shift | null
}

export interface ShiftTypeConfig {
  label: string
  defaultStart: string
  defaultEnd: string
  color: string
  icon: string
}

export const SHIFT_TYPES: Record<string, ShiftTypeConfig> = {
  morning: {
    label: 'Morning',
    defaultStart: '09:30',
    defaultEnd: '14:30',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    icon: '',
  },
  afternoon: {
    label: 'Afternoon',
    defaultStart: '12:00',
    defaultEnd: '18:00',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: '',
  },
  evening: {
    label: 'Evening',
    defaultStart: '18:00',
    defaultEnd: '22:00',
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    icon: '',
  },
  night: {
    label: 'Night',
    defaultStart: '22:00',
    defaultEnd: '06:00',
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    icon: '',
  },
}

export function ShiftModal({
  open,
  onClose,
  onSave,
  onUpdate,
  onDelete,
  employees,
  selectedDate,
  existingShift,
}: ShiftModalProps) {
  const isEditing = !!existingShift

  // Persistent employee selection from localStorage
  const [persistentEmployeeId, setPersistentEmployeeId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('lastSelectedEmployeeId') || ''
    }
    return ''
  })

  const [formData, setFormData] = useState({
    employeeId: existingShift?.employeeId || persistentEmployeeId || '',
    date: existingShift?.date || selectedDate,
    startTime: existingShift?.startTime || '09:00',
    endTime: existingShift?.endTime || '17:00',
    type: existingShift?.type || 'morning',
    location: existingShift?.location || '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  // Load shift types from localStorage
  const [shiftTypes, setShiftTypes] = useState<Record<string, ShiftTypeConfig>>(() => {
    if (typeof window !== 'undefined') {
      const savedShiftTypes = localStorage.getItem('allShiftTypes')
      if (savedShiftTypes) {
        try {
          return JSON.parse(savedShiftTypes)
        } catch (error) {
          console.warn('Error loading shift types:', error)
        }
      }
    }
    return SHIFT_TYPES
  })

  const [editingShiftType, setEditingShiftType] = useState<string | null>(null)
  const [newShiftType, setNewShiftType] = useState<ShiftTypeConfig>({
    label: '',
    defaultStart: '09:00',
    defaultEnd: '17:00',
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    icon: '',
  })

  // Save shift types to localStorage
  const saveAllShiftTypes = (types: Record<string, ShiftTypeConfig>) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('allShiftTypes', JSON.stringify(types))
    }
  }

  // Reset form when modal opens/closes or shift changes
  useEffect(() => {
    if (open) {
      const defaultEmployeeId = existingShift?.employeeId || persistentEmployeeId || ''

      setFormData({
        employeeId: defaultEmployeeId,
        date: existingShift?.date || selectedDate,
        startTime: existingShift?.startTime || '09:00',
        endTime: existingShift?.endTime || '17:00',
        type: existingShift?.type || 'morning',
        location: existingShift?.location || '',
      })
      setErrors({})
    }
  }, [open, existingShift, selectedDate, persistentEmployeeId])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.employeeId) {
      newErrors.employeeId = 'Veuillez sélectionner un employé'
    }

    if (!formData.startTime) {
      newErrors.startTime = "L'heure de début est requise"
    }

    if (!formData.endTime) {
      newErrors.endTime = "L'heure de fin est requise"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleShiftTypeChange = (type: string) => {
    const shiftType = shiftTypes[type]
    if (!shiftType) return

    const newFormData = {
      ...formData,
      type: type,
      startTime: shiftType.defaultStart,
      endTime: shiftType.defaultEnd,
    }

    setFormData(newFormData)

    // Auto-submit if employee selected
    if (newFormData.employeeId && newFormData.employeeId.trim() !== '') {
      setTimeout(() => {
        handleSubmitWithData(newFormData)
      }, 100)
    }
  }

  // Helper to format date to YYYY-MM-DD in local timezone
  const formatDateToLocalString = (date: Date | string): string => {
    if (typeof date === 'string') return date
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const handleSubmitWithData = async (dataToSubmit = formData) => {
    const newErrors: Record<string, string> = {}

    if (!dataToSubmit.employeeId) {
      newErrors.employeeId = 'Veuillez sélectionner un employé'
    }

    if (!dataToSubmit.startTime) {
      newErrors.startTime = "L'heure de début est requise"
    }

    if (!dataToSubmit.endTime) {
      newErrors.endTime = "L'heure de fin est requise"
    }

    setErrors(newErrors)

    if (Object.keys(newErrors).length > 0) return

    setIsSubmitting(true)
    try {
      const shiftData = {
        employeeId: dataToSubmit.employeeId,
        date: formatDateToLocalString(dataToSubmit.date),
        startTime: dataToSubmit.startTime,
        endTime: dataToSubmit.endTime,
        type: dataToSubmit.type,
        location: dataToSubmit.location?.trim() || undefined,
      }

      let result
      if (isEditing && existingShift && onUpdate) {
        result = await onUpdate(existingShift.id, shiftData)
      } else {
        result = await onSave(shiftData)
      }

      if (result.success) {
        onClose()
      } else {
        setErrors({ submit: result.error || 'Une erreur est survenue' })
      }
    } catch (error) {
      console.error('Error saving shift:', error)
      setErrors({ submit: 'Erreur de connexion au serveur' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmit = async () => {
    await handleSubmitWithData(formData)
  }

  const handleDelete = async () => {
    if (!existingShift || !onDelete) return

    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce créneau ?')) return

    setIsSubmitting(true)
    try {
      const result = await onDelete(existingShift.id)
      if (result.success) {
        onClose()
      } else {
        setErrors({ submit: result.error || 'Erreur lors de la suppression' })
      }
    } catch (error) {
      console.error('Error deleting shift:', error)
      setErrors({ submit: 'Erreur de connexion au serveur' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectedEmployee = employees.find((e) => e.id === formData.employeeId)

  const calculateDuration = () => {
    if (!formData.startTime || !formData.endTime) return ''

    const start = new Date(`2000-01-01 ${formData.startTime}`)
    let end = new Date(`2000-01-01 ${formData.endTime}`)

    if (end <= start) {
      end.setDate(end.getDate() + 1)
    }

    const diffMs = end.getTime() - start.getTime()
    const diffHours = diffMs / (1000 * 60 * 60)

    return diffHours > 0 ? `${diffHours.toFixed(1)} hours` : ''
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {isEditing ? (
                <Edit2 className="h-5 w-5" />
              ) : (
                <Plus className="h-5 w-5" />
              )}
              {isEditing ? 'Modifier le créneau' : 'Ajouter un créneau'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Date Display */}
            <Card className="bg-gray-50">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-gray-600" />
                  <span className="font-medium">
                    {(typeof formData.date === 'string'
                      ? new Date(formData.date + 'T12:00:00')
                      : formData.date
                    ).toLocaleDateString('fr-FR', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Employee Selection */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Employé *</Label>
                {persistentEmployeeId && !existingShift && (
                  <span className="text-xs text-gray-500">
                    {employees.find((emp) => emp.id === persistentEmployeeId)?.firstName}{' '}
                    pré-sélectionné
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {employees.map((employee) => (
                  <button
                    key={employee.id}
                    type="button"
                    onClick={() => {
                      if (typeof window !== 'undefined') {
                        localStorage.setItem('lastSelectedEmployeeId', employee.id)
                      }
                      setPersistentEmployeeId(employee.id)
                      setFormData((prev) => ({ ...prev, employeeId: employee.id }))
                    }}
                    className={`rounded-lg border-2 px-3 py-2 text-sm font-medium transition-all ${
                      formData.employeeId === employee.id
                        ? 'border-blue-500 text-white shadow-lg ring-2 ring-blue-200'
                        : 'border-gray-300 text-white opacity-40 hover:border-gray-400 hover:opacity-70'
                    }`}
                    style={{ backgroundColor: employee.color || '#9CA3AF' }}
                  >
                    {employee.firstName}
                  </button>
                ))}
              </div>
              {errors.employeeId && (
                <p className="flex items-center gap-1 text-sm text-red-500">
                  <AlertCircle className="h-3 w-3" />
                  {errors.employeeId}
                </p>
              )}
            </div>

            {/* Shift Type Selection */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Type de créneau</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSettings(!showSettings)}
                  className="flex items-center gap-2"
                >
                  <Settings className="h-4 w-4" />
                  Réglages
                </Button>
              </div>

              {showSettings && (
                <Card className="border-dashed border-gray-300 bg-gray-50">
                  <CardContent className="pt-4">
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium">Gérer les types de créneaux</h4>
                      {Object.entries(shiftTypes).map(([key, shiftType]) => (
                        <div
                          key={key}
                          className="flex items-center justify-between rounded border bg-white p-2"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">
                              {shiftType.label}
                            </span>
                            <span className="text-xs text-gray-500">
                              {shiftType.defaultStart} - {shiftType.defaultEnd}
                            </span>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditingShiftType(key)}
                              className="h-8 w-8 p-0"
                            >
                              <Edit2 className="h-3 w-3" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const newTypes = { ...shiftTypes }
                                delete newTypes[key]
                                setShiftTypes(newTypes)
                                saveAllShiftTypes(newTypes)
                              }}
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
                        onClick={() => setEditingShiftType('new')}
                        className="flex w-full items-center gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Ajouter un type
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="grid grid-cols-2 gap-3">
                {Object.entries(shiftTypes).map(([key, shift]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleShiftTypeChange(key)}
                    className={`rounded-lg border-2 p-3 text-left transition-all ${
                      formData.type === key
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

            {/* Time Selection */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime">Heure de début *</Label>
                <div className="relative">
                  <Clock className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                  <Input
                    id="startTime"
                    type="time"
                    value={formData.startTime}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, startTime: e.target.value }))
                    }
                    className={`pl-9 ${errors.startTime ? 'border-red-500' : ''}`}
                  />
                </div>
                {errors.startTime && (
                  <p className="text-sm text-red-500">{errors.startTime}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="endTime">Heure de fin *</Label>
                <div className="relative">
                  <Clock className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                  <Input
                    id="endTime"
                    type="time"
                    value={formData.endTime}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, endTime: e.target.value }))
                    }
                    className={`pl-9 ${errors.endTime ? 'border-red-500' : ''}`}
                  />
                </div>
                {errors.endTime && (
                  <p className="text-sm text-red-500">{errors.endTime}</p>
                )}
              </div>
            </div>

            {/* Duration Display */}
            {calculateDuration() && (
              <div className="rounded-lg bg-blue-50 p-3">
                <div className="flex items-center gap-2 text-blue-800">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    Durée: {calculateDuration()}
                  </span>
                </div>
              </div>
            )}

            {/* Shift Preview */}
            {selectedEmployee && (
              <Card className="border-2 border-dashed border-gray-200 bg-gray-50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-gray-700">
                    Aperçu du créneau
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div
                    className={`rounded-lg p-3 ${shiftTypes[formData.type]?.color || 'border-gray-200 bg-gray-100 text-gray-800'}`}
                  >
                    <div className="mb-2 flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <div
                          className="flex h-full w-full items-center justify-center text-xs font-semibold text-white"
                          style={{ backgroundColor: selectedEmployee.color || '#9CA3AF' }}
                        >
                          {selectedEmployee.firstName.charAt(0)}
                          {selectedEmployee.lastName.charAt(0)}
                        </div>
                      </Avatar>
                      <div>
                        <div className="text-sm font-medium">
                          {selectedEmployee.firstName} {selectedEmployee.lastName}
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {selectedEmployee.role}
                        </Badge>
                      </div>
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {shiftTypes[formData.type]?.label || formData.type}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-3 w-3" />
                        <span>
                          {formData.startTime} - {formData.endTime}
                        </span>
                        {calculateDuration() && (
                          <span className="text-xs opacity-75">
                            ({calculateDuration()})
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Error Message */}
            {errors.submit && (
              <div className="rounded-lg bg-red-50 p-3">
                <p className="flex items-center gap-2 text-sm text-red-800">
                  <AlertCircle className="h-4 w-4" />
                  {errors.submit}
                </p>
              </div>
            )}
          </div>

          <DialogFooter className="flex flex-col gap-2 sm:flex-row">
            {isEditing && onDelete && (
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={isSubmitting}
                className="flex w-full items-center gap-2 sm:w-auto"
              >
                <Trash2 className="h-4 w-4" />
                Supprimer
              </Button>
            )}

            <div className="flex w-full gap-2 sm:ml-auto sm:w-auto">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 sm:flex-none"
              >
                <X className="mr-2 h-4 w-4" />
                Annuler
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex flex-1 items-center gap-2 sm:flex-none"
              >
                <Save className="h-4 w-4" />
                {isSubmitting
                  ? 'Enregistrement...'
                  : isEditing
                    ? 'Modifier'
                    : 'Ajouter'}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Shift Type Editor Dialog */}
      <Dialog
        open={!!editingShiftType}
        onOpenChange={() => setEditingShiftType(null)}
      >
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>
              {editingShiftType === 'new'
                ? 'Ajouter un type'
                : 'Modifier le type'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Libellé</Label>
              <Input
                value={
                  editingShiftType === 'new'
                    ? newShiftType.label
                    : shiftTypes[editingShiftType || '']?.label || ''
                }
                onChange={(e) => {
                  if (editingShiftType === 'new') {
                    setNewShiftType((prev) => ({
                      ...prev,
                      label: e.target.value,
                    }))
                  } else if (editingShiftType) {
                    const newTypes = {
                      ...shiftTypes,
                      [editingShiftType]: {
                        ...shiftTypes[editingShiftType],
                        label: e.target.value,
                      },
                    }
                    setShiftTypes(newTypes)
                    saveAllShiftTypes(newTypes)
                  }
                }}
                placeholder="ex: Morning, Custom Shift"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Heure début</Label>
                <Input
                  type="time"
                  value={
                    editingShiftType === 'new'
                      ? newShiftType.defaultStart
                      : shiftTypes[editingShiftType || '']?.defaultStart || ''
                  }
                  onChange={(e) => {
                    if (editingShiftType === 'new') {
                      setNewShiftType((prev) => ({
                        ...prev,
                        defaultStart: e.target.value,
                      }))
                    } else if (editingShiftType) {
                      const newTypes = {
                        ...shiftTypes,
                        [editingShiftType]: {
                          ...shiftTypes[editingShiftType],
                          defaultStart: e.target.value,
                        },
                      }
                      setShiftTypes(newTypes)
                      saveAllShiftTypes(newTypes)
                    }
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label>Heure fin</Label>
                <Input
                  type="time"
                  value={
                    editingShiftType === 'new'
                      ? newShiftType.defaultEnd
                      : shiftTypes[editingShiftType || '']?.defaultEnd || ''
                  }
                  onChange={(e) => {
                    if (editingShiftType === 'new') {
                      setNewShiftType((prev) => ({
                        ...prev,
                        defaultEnd: e.target.value,
                      }))
                    } else if (editingShiftType) {
                      const newTypes = {
                        ...shiftTypes,
                        [editingShiftType]: {
                          ...shiftTypes[editingShiftType],
                          defaultEnd: e.target.value,
                        },
                      }
                      setShiftTypes(newTypes)
                      saveAllShiftTypes(newTypes)
                    }
                  }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Thème de couleur</Label>
              <Select
                value={
                  editingShiftType === 'new'
                    ? newShiftType.color
                    : shiftTypes[editingShiftType || '']?.color || ''
                }
                onValueChange={(value) => {
                  if (editingShiftType === 'new') {
                    setNewShiftType((prev) => ({ ...prev, color: value }))
                  } else if (editingShiftType) {
                    const newTypes = {
                      ...shiftTypes,
                      [editingShiftType]: {
                        ...shiftTypes[editingShiftType],
                        color: value,
                      },
                    }
                    setShiftTypes(newTypes)
                    saveAllShiftTypes(newTypes)
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bg-yellow-100 text-yellow-800 border-yellow-200">
                    Yellow
                  </SelectItem>
                  <SelectItem value="bg-blue-100 text-blue-800 border-blue-200">
                    Blue
                  </SelectItem>
                  <SelectItem value="bg-green-100 text-green-800 border-green-200">
                    Green
                  </SelectItem>
                  <SelectItem value="bg-purple-100 text-purple-800 border-purple-200">
                    Purple
                  </SelectItem>
                  <SelectItem value="bg-pink-100 text-pink-800 border-pink-200">
                    Pink
                  </SelectItem>
                  <SelectItem value="bg-red-100 text-red-800 border-red-200">
                    Red
                  </SelectItem>
                  <SelectItem value="bg-gray-100 text-gray-800 border-gray-200">
                    Gray
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingShiftType(null)}>
              Annuler
            </Button>
            <Button
              onClick={() => {
                if (editingShiftType === 'new') {
                  if (newShiftType.label) {
                    const key = newShiftType.label
                      .toLowerCase()
                      .replace(/\s+/g, '_')
                    const newTypes = {
                      ...shiftTypes,
                      [key]: newShiftType,
                    }
                    setShiftTypes(newTypes)
                    saveAllShiftTypes(newTypes)
                    setNewShiftType({
                      label: '',
                      defaultStart: '09:00',
                      defaultEnd: '17:00',
                      color: 'bg-gray-100 text-gray-800 border-gray-200',
                      icon: '',
                    })
                  }
                }
                setEditingShiftType(null)
              }}
            >
              {editingShiftType === 'new' ? 'Ajouter' : 'Enregistrer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
