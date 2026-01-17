import type { PromoConfigDocument } from '@/models/promoConfig/document'
import type { PromoConfig } from '@/types/promo'

/**
 * Convert PromoConfig Mongoose Document to PromoConfig Type
 *
 * Transforms:
 * - Date objects → string format (YYYY-MM-DD for dates, YYYY-MM-DD HH:mm for timestamps)
 * - MongoDB ObjectId → string
 * - Map objects → plain objects
 *
 * @param doc - PromoConfig Mongoose document
 * @returns Formatted PromoConfig object with all dates as strings
 */
export function formatPromoConfigResponse(doc: PromoConfigDocument): PromoConfig {
  return {
    id: doc._id.toString(),
    current: {
      code: doc.current.code,
      token: doc.current.token,
      description: doc.current.description,
      discountType: doc.current.discountType,
      discountValue: doc.current.discountValue,
      validFrom: doc.current.validFrom.toISOString().split('T')[0], // YYYY-MM-DD
      validUntil: doc.current.validUntil.toISOString().split('T')[0], // YYYY-MM-DD
      maxUses: doc.current.maxUses,
      currentUses: doc.current.currentUses,
      isActive: doc.current.isActive,
      createdAt: doc.current.createdAt.toISOString().split('T')[0], // YYYY-MM-DD
    },
    history: doc.history.map((h) => ({
      code: h.code,
      token: h.token,
      description: h.description,
      discountType: h.discountType,
      discountValue: h.discountValue,
      validFrom: h.validFrom.toISOString().split('T')[0],
      validUntil: h.validUntil.toISOString().split('T')[0],
      totalUses: h.totalUses,
      deactivatedAt: h.deactivatedAt.toISOString().replace('T', ' ').split('.')[0], // YYYY-MM-DD HH:mm
    })),
    stats: {
      totalViews: doc.stats.totalViews,
      totalCopies: doc.stats.totalCopies,
      viewsToday: doc.stats.viewsToday,
      copiesToday: doc.stats.copiesToday,
    },
    scanStats: {
      totalScans: doc.scanStats.totalScans,
      totalReveals: doc.scanStats.totalReveals,
      totalCopies: doc.scanStats.totalCopies,
      conversionRateReveal: doc.scanStats.conversionRateReveal,
      conversionRateCopy: doc.scanStats.conversionRateCopy,
      scansByDay: doc.scanStats.scansByDay instanceof Map
        ? Object.fromEntries(doc.scanStats.scansByDay)
        : (doc.scanStats.scansByDay || {}),
      scansByHour: doc.scanStats.scansByHour instanceof Map
        ? Object.fromEntries(doc.scanStats.scansByHour)
        : (doc.scanStats.scansByHour || {}),
      averageTimeToReveal: doc.scanStats.averageTimeToReveal,
    },
    marketing: {
      title: doc.marketing.title,
      message: doc.marketing.message,
      imageUrl: doc.marketing.imageUrl,
      ctaText: doc.marketing.ctaText,
    },
    events: doc.events.map((e) => ({
      timestamp: e.timestamp.toISOString().replace('T', ' ').split('.')[0], // YYYY-MM-DD HH:mm
      type: e.type,
      sessionId: e.sessionId,
    })),
    createdAt: doc.createdAt.toISOString().split('T')[0],
    updatedAt: doc.updatedAt.toISOString().split('T')[0],
  }
}
