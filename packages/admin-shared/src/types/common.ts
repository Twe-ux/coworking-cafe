export type DateString = string // YYYY-MM-DD
export type TimeString = string // HH:mm
export type ISOString = string  // ISO 8601

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
}
