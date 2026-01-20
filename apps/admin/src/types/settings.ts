// Types pour le module Settings (paramètres globaux)
// Ces types sont utilisés pour les APIs et les composants

// ===== Global Hours =====

export interface DayHours {
  isOpen: boolean
  openTime?: string
  closeTime?: string
}

export interface WeeklyHours {
  monday: DayHours
  tuesday: DayHours
  wednesday: DayHours
  thursday: DayHours
  friday: DayHours
  saturday: DayHours
  sunday: DayHours
}

export interface ExceptionalClosure {
  date: string // YYYY-MM-DD format for API
  reason?: string
  startTime?: string
  endTime?: string
  isFullDay: boolean
}

export interface GlobalHoursConfiguration {
  _id?: string
  defaultHours: WeeklyHours
  exceptionalClosures: ExceptionalClosure[]
  createdAt?: string
  updatedAt?: string
}

export interface GlobalHoursFormData extends Omit<GlobalHoursConfiguration, '_id' | 'createdAt' | 'updatedAt'> {}
