import { useState, useCallback } from 'react'
import { ControllerRenderProps } from 'react-hook-form'

interface UseNumberInputOptions {
  field: ControllerRenderProps<any, any>
  min?: number
  allowDecimals?: boolean
}

export function useNumberInput({ field, min = 0, allowDecimals = true }: UseNumberInputOptions) {
  const [localValue, setLocalValue] = useState<string>('')
  const [isFocused, setIsFocused] = useState(false)

  const handleFocus = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true)
    // Initialize local value from field value
    setLocalValue(field.value?.toString() || '')
    // Safari fix: setTimeout to prevent auto-deselect
    setTimeout(() => e.target.select(), 0)
  }, [field.value])

  const handleMouseUp = useCallback((e: React.MouseEvent<HTMLInputElement>) => {
    // Prevent Safari from deselecting on mouse up
    e.preventDefault()
  }, [])

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    // Accept both comma and dot as decimal separator
    // Replace comma with dot for French users (1,5 → 1.5)
    const normalizedValue = e.target.value.replace(',', '.')
    setLocalValue(normalizedValue)
  }, [])

  const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false)

    // Normalize: replace comma with dot for French decimal separator
    const normalizedValue = localValue.replace(',', '.')

    // Convert to number on blur
    const numValue = normalizedValue === '' || normalizedValue === undefined ? 0 : parseFloat(normalizedValue)
    const finalValue = isNaN(numValue) ? 0 : Math.max(min, numValue)

    // Update field value
    field.onChange(finalValue)
    field.onBlur()

    // Clear local value
    setLocalValue('')
  }, [localValue, field, min])

  // Display value: local value if focused, field value otherwise
  // Safari fix: convert 0 to empty string to avoid displaying "0" in empty fields
  const displayValue = isFocused
    ? localValue
    : (field.value === 0 || field.value === undefined || field.value === null
        ? ''
        : field.value.toString())

  return {
    value: displayValue,
    onChange: handleChange,
    onFocus: handleFocus,
    onMouseUp: handleMouseUp,
    onBlur: handleBlur,
    name: field.name,
    ref: field.ref,
  }
}
