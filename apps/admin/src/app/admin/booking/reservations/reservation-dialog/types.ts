// Types pour le nouveau ReservationDialog

import type { Booking, BookingStatus } from "@/types/booking"

export interface ClientData {
  id?: string
  name: string
  email: string
  phone?: string
  company?: string
}

export interface ReservationFormData {
  // Client
  client: ClientData | null

  // Espace
  spaceId: string
  spaceName: string

  // Dates
  startDate: string
  endDate: string

  // Heures
  startTime: string
  endTime: string

  // Personnes
  numberOfPeople: number

  // Prix (calculé automatiquement)
  totalPrice: number

  // Paiement sur facture
  invoiceOption: boolean

  // Acompte (conditionnel)
  depositRequired: boolean
  depositAmount: number
  depositFileAttached: boolean
  depositFileUrl: string

  // Notes
  notes: string

  // Statut (en bas)
  status: BookingStatus
}

export interface ReservationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  booking?: Booking | null
  onSuccess: () => void
}

export interface ClientSectionProps {
  selectedClient: ClientData | null
  onChange: (client: ClientData | null) => void
  error?: string
}

export interface SpaceSectionProps {
  selectedSpace: string
  onChange: (spaceId: string, spaceName: string) => void
  error?: string
}

export interface DateSectionProps {
  startDate: string
  endDate: string
  onStartDateChange: (date: string) => void
  onEndDateChange: (date: string) => void
  error?: string
}

export interface TimeSectionProps {
  startTime: string
  endTime: string
  onStartTimeChange: (time: string) => void
  onEndTimeChange: (time: string) => void
  error?: string
}

export interface PeopleSectionProps {
  numberOfPeople: number
  onChange: (count: number) => void
  min?: number
  max?: number
  error?: string
}

export interface PriceSectionProps {
  totalPrice: number
  loading: boolean
  invoiceOption: boolean
  onInvoicePaymentChange: (invoiceOption: boolean) => void
}

export interface DepositSectionProps {
  required: boolean
  amount: number
  fileAttached: boolean
  fileUrl: string
  onRequiredChange: (required: boolean) => void
  onAmountChange: (amount: number) => void
  onFileAttachedChange: (attached: boolean) => void
  onFileUploaded: (url: string) => void
  spaceType: string
}

export interface NotesSectionProps {
  notes: string
  onChange: (notes: string) => void
}

export interface StatusSectionProps {
  status: BookingStatus
  onChange: (status: BookingStatus) => void
  depositRequired?: boolean
}
