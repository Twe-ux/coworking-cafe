import { PromoConfigSchema } from './document'

/**
 * Attach pre/post hooks to PromoConfig schema
 */
export function attachHooks(): void {
  /**
   * Pre-save hook: Validate date ranges
   */
  PromoConfigSchema.pre('save', function (next) {
    // Validate validFrom < validUntil
    if (this.current.validFrom >= this.current.validUntil) {
      return next(new Error('validFrom must be before validUntil'))
    }

    // Validate token is not empty
    if (!this.current.token || this.current.token.trim() === '') {
      return next(new Error('Token cannot be empty'))
    }

    // Validate discount value based on type
    if (this.current.discountType === 'percentage' && this.current.discountValue > 100) {
      return next(new Error('Percentage discount cannot exceed 100'))
    }

    if (this.current.discountValue < 0) {
      return next(new Error('Discount value cannot be negative'))
    }

    next()
  })

  /**
   * Pre-save hook: Update conversion rates
   */
  PromoConfigSchema.pre('save', function (next) {
    const { totalScans, totalReveals, totalCopies } = this.scanStats

    // Update conversion rates
    if (totalScans > 0) {
      this.scanStats.conversionRateReveal = (totalReveals / totalScans) * 100
    }

    if (totalReveals > 0) {
      this.scanStats.conversionRateCopy = (totalCopies / totalReveals) * 100
    }

    next()
  })

  /**
   * Pre-save hook: Limit events array size (keep last 10000 events)
   */
  PromoConfigSchema.pre('save', function (next) {
    const MAX_EVENTS = 10000

    if (this.events.length > MAX_EVENTS) {
      // Keep only the most recent events
      this.events = this.events.slice(-MAX_EVENTS)
    }

    next()
  })
}
