// Types pour ReservationDialog et ses composants

import type { Booking, BookingStatus, ReservationType, SpaceConfiguration } from "@/types/booking"

export interface ReservationFormData {
  spaceId: string
  clientName: string
  clientEmail: string
  reservationType: ReservationType
  startDate: string
  endDate: string
  startTime: string
  endTime: string
  numberOfPeople: number
  status: BookingStatus
  totalPrice: number
  depositPaid: number
  notes: string
}

export interface ReservationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  booking?: Booking | null
  onSuccess: () => void
}

export interface ClientInfoSectionProps {
  formData: ReservationFormData
  onChange: (field: keyof ReservationFormData, value: string | number) => void
}

export interface SpaceSelectionSectionProps {
  formData: ReservationFormData
  spaces: SpaceConfiguration[]
  onChange: (field: keyof ReservationFormData, value: string) => void
}

export interface DateTimeSectionProps {
  formData: ReservationFormData
  onChange: (field: keyof ReservationFormData, value: string) => void
}

export interface PricingSectionProps {
  formData: ReservationFormData
  onChange: (field: keyof ReservationFormData, value: number) => void
}

export interface ReservationStatusSectionProps {
  formData: ReservationFormData
  onChange: (field: keyof ReservationFormData, value: string | BookingStatus) => void
}
