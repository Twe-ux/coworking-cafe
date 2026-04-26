export type DashboardSection =
  | 'home'
  | 'reservations'
  | 'history'
  | 'wallet'
  | 'loyalty'
  | 'profile'
  | 'events'
  | 'directory'

export type SpaceKey = 'open' | 'verriere' | 'etage' | 'event'

export type BookingStatus = 'confirmed' | 'pending' | 'cancelled' | 'completed'

export interface DashboardBooking {
  id: string
  space: string
  spaceKey: SpaceKey
  date: string       // "YYYY-MM-DD"
  dateLabel: string  // "Mardi 22 avril"
  day: string        // "22" (numéro du jour, pour le date badge)
  month: string      // "AVR" (3 lettres uppercase, pour le date badge)
  time: string       // "09:00 – 12:00"
  duration: string   // "3h"
  people: number
  price: number
  status: BookingStatus
}

export interface DashboardUser {
  name: string
  email: string
  plan: string
  memberSince: string
}

export interface DashboardStats {
  active: number
  hoursBooked: number
  savings: number
  memberPoints: number
  nextReward: number
}

export const SPACE_COLORS: Record<SpaceKey, { label: string; color: string; bg: string }> = {
  open:     { label: 'Open-space',     color: 'var(--main)',    bg: 'rgba(65,121,114,0.12)' },
  verriere: { label: 'Salle Verrière', color: 'var(--main)',    bg: 'rgba(65,121,114,0.14)' },
  etage:    { label: 'Salle Étage',    color: 'var(--btn-dark)', bg: 'rgba(242,211,129,0.22)' },
  event:    { label: 'Événementiel',   color: 'var(--danger)',  bg: 'rgba(192,83,76,0.1)' },
}

export const MOCK_USER: DashboardUser = {
  name: 'Claire Dubois',
  email: 'claire.dubois@exemple.fr',
  plan: 'Membre +',
  memberSince: 'Janvier 2025',
}

export const MOCK_STATS: DashboardStats = {
  active: 2,
  hoursBooked: 48,
  savings: 124,
  memberPoints: 340,
  nextReward: 500,
}

export const MOCK_UPCOMING: DashboardBooking[] = [
  { id: 'b1', space: 'Salle Verrière', spaceKey: 'verriere', date: '2026-04-22', dateLabel: 'Mardi 22 avril',  day: '22', month: 'AVR', time: '09:00 – 12:00', duration: '3h', people: 4,  price: 72,  status: 'confirmed' },
  { id: 'b2', space: 'Open-space',     spaceKey: 'open',     date: '2026-04-24', dateLabel: 'Jeudi 24 avril',  day: '24', month: 'AVR', time: '14:00 – 18:00', duration: '4h', people: 1,  price: 36,  status: 'pending'   },
  { id: 'b3', space: 'Salle Étage',    spaceKey: 'etage',    date: '2026-04-28', dateLabel: 'Lundi 28 avril',  day: '28', month: 'AVR', time: '10:00 – 12:00', duration: '2h', people: 6,  price: 60,  status: 'confirmed' },
]

export const MOCK_PAST: DashboardBooking[] = [
  { id: 'p1', space: 'Open-space',     spaceKey: 'open',     date: '2026-04-18', dateLabel: 'Ven 18 avril',  day: '18', month: 'AVR', time: '09:00 – 17:00', duration: '8h', people: 1,  price: 45,  status: 'completed' },
  { id: 'p2', space: 'Salle Verrière', spaceKey: 'verriere', date: '2026-04-15', dateLabel: 'Mar 15 avril',  day: '15', month: 'AVR', time: '14:00 – 16:00', duration: '2h', people: 3,  price: 48,  status: 'completed' },
  { id: 'p3', space: 'Événementiel',   spaceKey: 'event',    date: '2026-04-12', dateLabel: 'Sam 12 avril',  day: '12', month: 'AVR', time: '18:00 – 23:00', duration: '5h', people: 12, price: 240, status: 'completed' },
]
