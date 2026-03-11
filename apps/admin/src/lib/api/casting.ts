/**
 * Safely cast unknown value to a Record object.
 * Returns an empty object if the value is not a valid object.
 */
export function toRecord<T extends Record<string, unknown>>(
  value: unknown
): T {
  if (typeof value !== 'object' || value === null) {
    return {} as T
  }
  return value as T
}

/**
 * Safely cast an unknown array to a typed Record array.
 * Returns an empty array if the value is not an array.
 */
export function toRecordArray<T extends Record<string, unknown>>(
  value: unknown
): T[] {
  if (!Array.isArray(value)) {
    return []
  }
  return value as T[]
}
