import { PromoConfigSchema, PromoConfigDocument } from './document'

/**
 * Virtual properties for PromoConfig
 */

/**
 * Virtual: Full promo code info with status
 */
PromoConfigSchema.virtual('currentPromoInfo').get(function (this: PromoConfigDocument) {
  const now = new Date()
  const isValid =
    this.current.isActive &&
    now >= this.current.validFrom &&
    now <= this.current.validUntil &&
    (this.current.maxUses === 0 || this.current.currentUses < this.current.maxUses)

  let status: 'active' | 'expired' | 'inactive' | 'max_uses_reached'
  if (!this.current.isActive) {
    status = 'inactive'
  } else if (now < this.current.validFrom || now > this.current.validUntil) {
    status = 'expired'
  } else if (this.current.maxUses > 0 && this.current.currentUses >= this.current.maxUses) {
    status = 'max_uses_reached'
  } else {
    status = 'active'
  }

  return {
    ...this.current,
    status,
    isValid,
    usagePercentage:
      this.current.maxUses > 0 ? (this.current.currentUses / this.current.maxUses) * 100 : 0,
  }
})

/**
 * Virtual: Today's date key (YYYY-MM-DD)
 */
PromoConfigSchema.virtual('todayKey').get(function () {
  return new Date().toISOString().split('T')[0]
})

/**
 * Virtual: Today's scans
 */
PromoConfigSchema.virtual('scansToday').get(function (this: PromoConfigDocument) {
  const todayKey = new Date().toISOString().split('T')[0]
  return this.scanStats.scansByDay.get(todayKey) || 0
})

/**
 * Virtual: Overall conversion rate (scans → copies)
 */
PromoConfigSchema.virtual('overallConversionRate').get(function (this: PromoConfigDocument) {
  const { totalScans, totalCopies } = this.scanStats
  return totalScans > 0 ? (totalCopies / totalScans) * 100 : 0
})

export interface VirtualPromoConfig {
  currentPromoInfo: {
    code: string
    token: string
    description: string
    discountType: 'percentage' | 'fixed' | 'free_item'
    discountValue: number
    validFrom: Date
    validUntil: Date
    maxUses: number
    currentUses: number
    isActive: boolean
    createdAt: Date
    status: 'active' | 'expired' | 'inactive' | 'max_uses_reached'
    isValid: boolean
    usagePercentage: number
  }
  todayKey: string
  scansToday: number
  overallConversionRate: number
}
