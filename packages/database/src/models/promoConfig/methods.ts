import { PromoConfigDocument, PromoConfigSchema } from './document'

export interface PromoConfigMethods extends PromoConfigDocument {
  incrementScan(sessionId: string): Promise<void>
  incrementReveal(sessionId: string): Promise<void>
  incrementCopy(sessionId: string): Promise<void>
  resetDailyStats(): void
  archiveCurrentCode(): Promise<void>
  isPromoCodeValid(): boolean
  getPromoCodeStatus(): 'active' | 'expired' | 'inactive' | 'max_uses_reached'
}

/**
 * Increment scan count and record event
 */
PromoConfigSchema.methods.incrementScan = async function (
  this: PromoConfigDocument,
  sessionId: string
): Promise<void> {
  const now = new Date()
  const dateKey = now.toISOString().split('T')[0] // YYYY-MM-DD
  const hourKey = now.getHours().toString().padStart(2, '0') // HH

  // Add event
  this.events.push({
    timestamp: now,
    type: 'scan',
    sessionId,
  })

  // Update stats
  this.stats.totalViews++
  this.stats.viewsToday++

  // Update scan stats
  this.scanStats.totalScans++
  const scansByDay = this.scanStats.scansByDay.get(dateKey) || 0
  this.scanStats.scansByDay.set(dateKey, scansByDay + 1)
  const scansByHour = this.scanStats.scansByHour.get(hourKey) || 0
  this.scanStats.scansByHour.set(hourKey, scansByHour + 1)

  // Update conversion rates inline
  const { totalScans, totalReveals } = this.scanStats
  if (totalScans > 0) {
    this.scanStats.conversionRateReveal = (totalReveals / totalScans) * 100
  }

  await this.save()
}

/**
 * Increment reveal count and record event
 */
PromoConfigSchema.methods.incrementReveal = async function (
  this: PromoConfigDocument,
  sessionId: string
): Promise<void> {
  const now = new Date()

  // Add event
  this.events.push({
    timestamp: now,
    type: 'reveal',
    sessionId,
  })

  // Update scan stats
  this.scanStats.totalReveals++

  // Calculate average time to reveal
  const scanEvent = this.events.find((e) => e.sessionId === sessionId && e.type === 'scan')
  if (scanEvent) {
    const timeToReveal = (now.getTime() - scanEvent.timestamp.getTime()) / 1000
    const currentAvg = this.scanStats.averageTimeToReveal
    const totalReveals = this.scanStats.totalReveals

    this.scanStats.averageTimeToReveal =
      (currentAvg * (totalReveals - 1) + timeToReveal) / totalReveals
  }

  // Update conversion rates inline
  const { totalScans, totalReveals, totalCopies } = this.scanStats
  if (totalScans > 0) {
    this.scanStats.conversionRateReveal = (totalReveals / totalScans) * 100
  }
  if (totalReveals > 0) {
    this.scanStats.conversionRateCopy = (totalCopies / totalReveals) * 100
  }

  await this.save()
}

/**
 * Increment copy count and record event
 */
PromoConfigSchema.methods.incrementCopy = async function (
  this: PromoConfigDocument,
  sessionId: string
): Promise<void> {
  const now = new Date()

  // Add event
  this.events.push({
    timestamp: now,
    type: 'copy',
    sessionId,
  })

  // Update stats
  this.stats.totalCopies++
  this.stats.copiesToday++

  // Update scan stats
  this.scanStats.totalCopies++

  // Increment current uses
  this.current.currentUses++

  // Update conversion rates inline
  const { totalScans, totalReveals, totalCopies } = this.scanStats
  if (totalScans > 0) {
    this.scanStats.conversionRateReveal = (totalReveals / totalScans) * 100
  }
  if (totalReveals > 0) {
    this.scanStats.conversionRateCopy = (totalCopies / totalReveals) * 100
  }

  await this.save()
}

/**
 * Reset daily stats (to be called at midnight)
 */
PromoConfigSchema.methods.resetDailyStats = function (this: PromoConfigDocument): void {
  this.stats.viewsToday = 0
  this.stats.copiesToday = 0
}

/**
 * Archive current promo code and move to history
 */
PromoConfigSchema.methods.archiveCurrentCode = async function (
  this: PromoConfigDocument
): Promise<void> {
  // Add current to history
  this.history.push({
    code: this.current.code,
    token: this.current.token,
    description: this.current.description,
    discountType: this.current.discountType,
    discountValue: this.current.discountValue,
    validFrom: this.current.validFrom,
    validUntil: this.current.validUntil,
    totalUses: this.current.currentUses,
    deactivatedAt: new Date(),
  })

  // Mark current as inactive
  this.current.isActive = false

  await this.save()
}

/**
 * Check if current promo code is valid
 */
PromoConfigSchema.methods.isPromoCodeValid = function (this: PromoConfigDocument): boolean {
  const now = new Date()

  return (
    this.current.isActive &&
    now >= this.current.validFrom &&
    now <= this.current.validUntil &&
    (this.current.maxUses === 0 || this.current.currentUses < this.current.maxUses)
  )
}

/**
 * Get current promo code status
 */
PromoConfigSchema.methods.getPromoCodeStatus = function (
  this: PromoConfigDocument
): 'active' | 'expired' | 'inactive' | 'max_uses_reached' {
  if (!this.current.isActive) {
    return 'inactive'
  }

  const now = new Date()

  if (now < this.current.validFrom || now > this.current.validUntil) {
    return 'expired'
  }

  if (this.current.maxUses > 0 && this.current.currentUses >= this.current.maxUses) {
    return 'max_uses_reached'
  }

  return 'active'
}
