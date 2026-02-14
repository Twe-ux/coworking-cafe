/**
 * Types pour le composant MonthlyCalendar réutilisable
 */

export interface CalendarDay {
  date: Date
  isCurrentMonth: boolean
  isToday: boolean
}

export interface WeekData {
  weekStart: Date
  weekEnd: Date
  days: CalendarDay[]
}

export interface SidebarItem {
  id: string
  label: string
  color?: string
  metadata?: Record<string, any>
}

export interface MonthlyCalendarProps<T = any, S = any> {
  // Date actuelle affichée
  currentDate: Date
  onDateChange: (date: Date) => void

  // Données à afficher dans le calendrier
  data: T[]
  getDateForData: (item: T) => Date | string

  // Données secondaires (ex: timeEntries pour calculer heures projetées)
  secondaryData?: S[]
  getDateForSecondaryData?: (item: S) => Date | string

  // Rendu personnalisé
  renderCell: (date: Date, dayData: T[], cellInfo: CalendarDay) => React.ReactNode
  renderSidebarWeek?: (weekData: WeekData, weekItems: T[], weekSecondaryItems?: S[]) => React.ReactNode

  // Comportement
  onCellClick?: (date: Date, dayData: T[]) => void
  readOnly?: boolean

  // Sidebar latérale (optionnelle)
  showSidebar?: boolean
  sidebarTitle?: string
  sidebarItems?: SidebarItem[]

  // Style
  className?: string
  cellHeight?: number

  // Legend component (optionnel)
  legendComponent?: React.ReactNode

  // Action button (optionnel, affiché à droite)
  actionButton?: React.ReactNode
}
