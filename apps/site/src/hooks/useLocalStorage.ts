'use client'
import { useState } from 'react'

export default function useLocalStorage<T>(key: string, initialValue: T, override: boolean = false) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (override) return initialValue
    try {
      let item = null
      if (key) {
        item = window.localStorage.getItem(key)
      }
      if (!item) localStorage.setItem(key, JSON.stringify(initialValue))
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      // Error reading from localStorage
      return initialValue
    }
  })

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      if (key) {
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      }
    } catch (error) {
      // Error setting localStorage value
    }
  }

  return [storedValue, setValue] as const
}
