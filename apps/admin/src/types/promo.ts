/**
 * Types for Promo Code System
 * All dates are in string format (YYYY-MM-DD) for API consistency
 */

export interface PromoCode {
  code: string
  token: string
  description: string
  discountType: 'percentage' | 'fixed' | 'free_item'
  discountValue: number
  validFrom: string // Format "YYYY-MM-DD"
  validUntil: string // Format "YYYY-MM-DD"
  maxUses: number
  currentUses: number
  isActive: boolean
  createdAt: string // Format "YYYY-MM-DD HH:mm"
}

export interface PromoHistory {
  code: string
  token: string
  description: string
  discountType: 'percentage' | 'fixed' | 'free_item'
  discountValue: number
  validFrom: string // Format "YYYY-MM-DD"
  validUntil: string // Format "YYYY-MM-DD"
  totalUses: number
  deactivatedAt: string // Format "YYYY-MM-DD HH:mm"
}

export interface PromoStats {
  totalViews: number
  totalCopies: number
  viewsToday: number
  copiesToday: number
}

export interface ScanStats {
  totalScans: number
  totalReveals: number
  totalCopies: number
  conversionRateReveal: number // scans → reveals (%)
  conversionRateCopy: number // reveals → copies (%)
  scansByDay: Record<string, number> // { "2026-01-16": 12, ... }
  scansByHour: Record<string, number> // { "09": 5, "10": 8, ... }
  averageTimeToReveal: number // en secondes
}

export interface MarketingContent {
  title: string
  message: string
  imageUrl?: string
  ctaText: string
}

export interface ScanEvent {
  timestamp: string // Format "YYYY-MM-DD HH:mm"
  type: 'scan' | 'reveal' | 'copy'
  sessionId: string
}

export interface PromoConfig {
  id: string
  current: PromoCode
  history: PromoHistory[]
  stats: PromoStats
  scanStats: ScanStats
  marketing: MarketingContent
  events: ScanEvent[]
  createdAt: string
  updatedAt: string
}

// API Request types
export interface CreatePromoCodeRequest {
  code: string
  token: string
  description: string
  discountType: 'percentage' | 'fixed' | 'free_item'
  discountValue: number
  validFrom: string // Format "YYYY-MM-DD"
  validUntil: string // Format "YYYY-MM-DD"
  maxUses: number
}

export interface UpdatePromoConfigRequest {
  current?: Partial<PromoCode>
  marketing?: Partial<MarketingContent>
}

export interface RecordScanEventRequest {
  type: 'scan' | 'reveal' | 'copy'
  sessionId: string
}

// API Response types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  details?: string | string[] | Record<string, string> | Record<string, unknown>
  message?: string
}

// Type aliases for clarity
export type DiscountType = 'percentage' | 'fixed' | 'free_item'
export type ScanEventType = 'scan' | 'reveal' | 'copy'

// Constants for error codes
export const PROMO_ERRORS = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  PROMO_CONFIG_NOT_FOUND: 'PROMO_CONFIG_NOT_FOUND',
  INVALID_TOKEN: 'INVALID_TOKEN',
  PROMO_CODE_EXPIRED: 'PROMO_CODE_EXPIRED',
  PROMO_CODE_INACTIVE: 'PROMO_CODE_INACTIVE',
  MAX_USES_EXCEEDED: 'MAX_USES_EXCEEDED',
  INVALID_DATE_RANGE: 'INVALID_DATE_RANGE',
  DUPLICATE_CODE: 'DUPLICATE_CODE',
} as const

export type PromoErrorCode = typeof PROMO_ERRORS[keyof typeof PROMO_ERRORS]
