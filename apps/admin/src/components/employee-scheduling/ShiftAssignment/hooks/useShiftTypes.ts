/**
 * Hook for managing shift types configuration
 * Handles CRUD operations and localStorage persistence
 */

import { useState, useCallback } from 'react'
import type {
  ShiftTypeConfig,
  NewShiftTypeData,
  UseShiftTypesReturn,
} from '../types'
import { DEFAULT_SHIFT_TYPES, DEFAULT_NEW_SHIFT_TYPE, STORAGE_KEYS } from '../constants'

/**
 * Load shift types from localStorage
 */
function loadShiftTypes(): Record<string, ShiftTypeConfig> {
  if (typeof window === 'undefined') return DEFAULT_SHIFT_TYPES

  const saved = localStorage.getItem(STORAGE_KEYS.ALL_SHIFT_TYPES)
  if (saved) {
    try {
      return JSON.parse(saved) as Record<string, ShiftTypeConfig>
    } catch (error) {
      console.warn('Error loading shift types:', error)
    }
  }
  return DEFAULT_SHIFT_TYPES
}

/**
 * Save shift types to localStorage
 */
function saveShiftTypes(types: Record<string, ShiftTypeConfig>): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.ALL_SHIFT_TYPES, JSON.stringify(types))
  }
}

export function useShiftTypes(): UseShiftTypesReturn {
  const [shiftTypes, setShiftTypes] = useState<Record<string, ShiftTypeConfig>>(loadShiftTypes)
  const [showSettings, setShowSettings] = useState(false)
  const [editingShiftType, setEditingShiftType] = useState<string | null>(null)
  const [newShiftType, setNewShiftType] = useState<NewShiftTypeData>({
    ...DEFAULT_NEW_SHIFT_TYPE,
  })

  const handleDeleteShiftType = useCallback((key: string) => {
    setShiftTypes((prev) => {
      const updated = { ...prev }
      delete updated[key]
      saveShiftTypes(updated)
      return updated
    })
  }, [])

  const handleSaveShiftType = useCallback(() => {
    if (editingShiftType === 'new') {
      if (newShiftType.label) {
        const key = newShiftType.label.toLowerCase().replace(/\s+/g, '_')
        setShiftTypes((prev) => {
          const updated = {
            ...prev,
            [key]: { ...newShiftType },
          }
          saveShiftTypes(updated)
          return updated
        })
        setNewShiftType({ ...DEFAULT_NEW_SHIFT_TYPE })
      }
    }
    setEditingShiftType(null)
  }, [editingShiftType, newShiftType])

  const updateShiftType = useCallback(
    (key: string, field: keyof ShiftTypeConfig, value: string) => {
      setShiftTypes((prev) => {
        const updated = {
          ...prev,
          [key]: {
            ...prev[key],
            [field]: value,
          },
        }
        saveShiftTypes(updated)
        return updated
      })
    },
    []
  )

  const updateNewShiftType = useCallback(
    (field: keyof NewShiftTypeData, value: string) => {
      setNewShiftType((prev) => ({
        ...prev,
        [field]: value,
      }))
    },
    []
  )

  return {
    shiftTypes,
    showSettings,
    editingShiftType,
    newShiftType,
    setShowSettings,
    setEditingShiftType,
    handleDeleteShiftType,
    handleSaveShiftType,
    updateShiftType,
    updateNewShiftType,
  }
}
