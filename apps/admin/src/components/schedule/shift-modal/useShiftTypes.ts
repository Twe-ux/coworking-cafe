'use client'

import { useState, useEffect, useCallback } from 'react'
import type { ShiftTypeConfig } from './types'
import { DEFAULT_SHIFT_TYPES } from './types'

const STORAGE_KEY = 'allShiftTypes'

interface UseShiftTypesReturn {
  shiftTypes: Record<string, ShiftTypeConfig>
  setShiftTypes: (types: Record<string, ShiftTypeConfig>) => void
  saveShiftType: (key: string, config: ShiftTypeConfig) => void
  deleteShiftType: (key: string) => void
  updateShiftType: (key: string, updates: Partial<ShiftTypeConfig>) => void
}

/**
 * Hook to manage shift types configuration
 * - Loads from localStorage initially
 * - Syncs with database
 * - Persists changes to both storage and DB
 */
export function useShiftTypes(): UseShiftTypesReturn {
  const [shiftTypes, setShiftTypesState] = useState<Record<string, ShiftTypeConfig>>(() => {
    if (typeof window !== 'undefined') {
      const savedShiftTypes = localStorage.getItem(STORAGE_KEY)
      if (savedShiftTypes) {
        try {
          return JSON.parse(savedShiftTypes)
        } catch (error) {
          console.warn('Error loading shift types from localStorage:', error)
        }
      }
    }
    return DEFAULT_SHIFT_TYPES
  })

  // Load shift types from database on mount
  useEffect(() => {
    const loadShiftTypes = async () => {
      try {
        const response = await fetch('/api/shift-types')

        if (!response.ok) return

        const result = await response.json()

        if (result.success && result.data) {
          setShiftTypesState(result.data)
          // Sync to localStorage
          if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(result.data))
          }
        }
      } catch (error) {
        // Silently fail, use localStorage or defaults
        console.warn('Failed to load shift types from database:', error)
      }
    }

    loadShiftTypes()
  }, [])

  // Save shift types to both localStorage and database
  const saveAllShiftTypes = useCallback((types: Record<string, ShiftTypeConfig>) => {
    // Update state
    setShiftTypesState(types)

    // Save to localStorage immediately
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(types))
    }

    // Save to database in background (don't await, don't block UI)
    fetch('/api/shift-types', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ shiftTypes: types }),
    }).catch((error) => {
      console.warn('Failed to save shift types to database:', error)
    })
  }, [])

  const setShiftTypes = useCallback((types: Record<string, ShiftTypeConfig>) => {
    saveAllShiftTypes(types)
  }, [saveAllShiftTypes])

  const saveShiftType = useCallback((key: string, config: ShiftTypeConfig) => {
    const newTypes = {
      ...shiftTypes,
      [key]: config,
    }
    saveAllShiftTypes(newTypes)
  }, [shiftTypes, saveAllShiftTypes])

  const deleteShiftType = useCallback((key: string) => {
    const newTypes = { ...shiftTypes }
    delete newTypes[key]
    saveAllShiftTypes(newTypes)
  }, [shiftTypes, saveAllShiftTypes])

  const updateShiftType = useCallback((key: string, updates: Partial<ShiftTypeConfig>) => {
    if (!shiftTypes[key]) return

    const newTypes = {
      ...shiftTypes,
      [key]: {
        ...shiftTypes[key],
        ...updates,
      },
    }
    saveAllShiftTypes(newTypes)
  }, [shiftTypes, saveAllShiftTypes])

  return {
    shiftTypes,
    setShiftTypes,
    saveShiftType,
    deleteShiftType,
    updateShiftType,
  }
}
