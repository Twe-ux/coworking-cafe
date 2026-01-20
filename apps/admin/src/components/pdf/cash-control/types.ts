/**
 * Types for CashControlPDF components
 */

import type { TurnoverData as BaseTurnoverData } from '@/types/accounting'

export interface TurnoverData extends BaseTurnoverData {
  _id?: string
  prestaB2B?: { label: string; value: number }[]
  depenses?: { label: string; value: number }[]
  cbClassique?: number | string
  cbSansContact?: number | string
  virement?: number | string
  especes?: number | string
}

export interface CashControlPDFProps {
  data: TurnoverData[]
  selectedMonth: number | null
  selectedYear: number | null
}

export interface PageHeaderProps {
  title: string
  month: number | null
  year: number | null
}

export interface PageFooterProps {
  pageNumber: number
  totalPages: number
}

// VAT rates used in calculations
export const VAT_RATES = ['5.5', '10', '20'] as const
export const VAT_RATE_LABELS = ['5,5', '10', '20'] as const
