import crypto from 'crypto';
import { PromoConfig, connectToDatabase } from '@coworking-cafe/database';
import {
  PromoConfig as PromoConfigType,
  PromoCode,
  MarketingContent,
  ScanStats,
  DEFAULT_PROMO_CONFIG
} from '@/types/promo';

class PromoService {
  // Générer un token unique
  private generateToken(): string {
    return crypto.randomBytes(16).toString('hex');
  }

  // Convertir le document MongoDB en type PromoConfig
  private toPromoConfig(doc: any): PromoConfigType {
    const config: PromoConfigType = {
      current: {
        code: doc.current.code,
        token: doc.current.token,
        description: doc.current.description,
        discount_type: doc.current.discountType,
        discount_value: doc.current.discountValue,
        valid_from: doc.current.validFrom.toISOString(),
        valid_until: doc.current.validUntil.toISOString(),
        max_uses: doc.current.maxUses,
        current_uses: doc.current.currentUses,
        is_active: doc.current.isActive,
        created_at: doc.current.createdAt.toISOString()
      },
      history: doc.history.map((h: any) => ({
        code: h.code,
        token: h.token,
        description: h.description,
        discount_type: h.discountType,
        discount_value: h.discountValue,
        valid_from: h.validFrom.toISOString(),
        valid_until: h.validUntil.toISOString(),
        total_uses: h.totalUses,
        deactivated_at: h.deactivatedAt.toISOString()
      })),
      stats: {
        total_views: doc.stats.totalViews,
        total_copies: doc.stats.totalCopies,
        views_today: doc.stats.viewsToday,
        copies_today: doc.stats.copiesToday
      },
      scan_stats: {
        total_scans: doc.scanStats.totalScans,
        total_reveals: doc.scanStats.totalReveals,
        total_copies: doc.scanStats.totalCopies,
        conversion_rate_reveal: doc.scanStats.conversionRateReveal,
        conversion_rate_copy: doc.scanStats.conversionRateCopy,
        scans_by_day: doc.scanStats.scansByDay instanceof Map
          ? Object.fromEntries(doc.scanStats.scansByDay)
          : doc.scanStats.scansByDay || {},
        scans_by_hour: doc.scanStats.scansByHour instanceof Map
          ? Object.fromEntries(doc.scanStats.scansByHour)
          : doc.scanStats.scansByHour || {},
        average_time_to_reveal: doc.scanStats.averageTimeToReveal
      },
      marketing: {
        title: doc.marketing.title,
        message: doc.marketing.message,
        image_url: doc.marketing.imageUrl,
        cta_text: doc.marketing.ctaText
      },
      events: doc.events.map((e: any) => ({
        timestamp: e.timestamp.toISOString(),
        type: e.type,
        session_id: e.session_id
      }))
    };
    return config;
  }

  // Obtenir ou créer la configuration
  private async getOrCreateConfig() {
    await connectToDatabase();

    let doc = await PromoConfig.findOne();

    if (!doc) {
      // Créer la configuration par défaut (utiliser camelCase pour Mongoose)
      const defaultConfig = {
        current: {
          code: DEFAULT_PROMO_CONFIG.current.code,
          token: this.generateToken(),
          description: DEFAULT_PROMO_CONFIG.current.description,
          discountType: DEFAULT_PROMO_CONFIG.current.discount_type,
          discountValue: DEFAULT_PROMO_CONFIG.current.discount_value,
          validFrom: new Date(DEFAULT_PROMO_CONFIG.current.valid_from),
          validUntil: new Date(DEFAULT_PROMO_CONFIG.current.valid_until),
          maxUses: DEFAULT_PROMO_CONFIG.current.max_uses,
          currentUses: 0,
          isActive: DEFAULT_PROMO_CONFIG.current.is_active,
          createdAt: new Date(DEFAULT_PROMO_CONFIG.current.created_at)
        },
        history: [],
        stats: {
          totalViews: 0,
          totalCopies: 0,
          viewsToday: 0,
          copiesToday: 0
        },
        scanStats: {
          totalScans: 0,
          totalReveals: 0,
          totalCopies: 0,
          conversionRateReveal: 0,
          conversionRateCopy: 0,
          scansByDay: new Map(),
          scansByHour: new Map(),
          averageTimeToReveal: 0
        },
        marketing: {
          title: DEFAULT_PROMO_CONFIG.marketing.title,
          message: DEFAULT_PROMO_CONFIG.marketing.message,
          imageUrl: DEFAULT_PROMO_CONFIG.marketing.image_url,
          ctaText: DEFAULT_PROMO_CONFIG.marketing.cta_text
        },
        events: []
      };

      doc = await PromoConfig.create(defaultConfig);
    }

    return doc;
  }

  // Obtenir la configuration complète
  async getConfig(): Promise<PromoConfigType> {
    const doc = await this.getOrCreateConfig();
    return this.toPromoConfig(doc);
  }

  // Obtenir le code promo actuel
  async getCurrentPromo(): Promise<PromoCode> {
    const config = await this.getConfig();
    return config.current;
  }

  // Obtenir le token actuel
  async getCurrentToken(): Promise<string> {
    const config = await this.getConfig();
    return config.current.token;
  }

  // Obtenir un code promo par token
  async getPromoByToken(token: string): Promise<PromoCode | null> {
    const config = await this.getConfig();
    if (config.current.token === token && config.current.is_active) {
      return config.current;
    }
    return null;
  }

  // Créer un nouveau code promo
  async createPromo(promo: Omit<PromoCode, 'token' | 'current_uses' | 'created_at'>): Promise<PromoCode> {
    await connectToDatabase();
    const doc = await this.getOrCreateConfig();

    // Archiver l'ancien code si actif (utiliser camelCase)
    if (doc.current.isActive && doc.current.currentUses > 0) {
      doc.history.push({
        code: doc.current.code,
        token: doc.current.token,
        description: doc.current.description,
        discountType: doc.current.discountType,
        discountValue: doc.current.discountValue,
        validFrom: doc.current.validFrom,
        validUntil: doc.current.validUntil,
        totalUses: doc.current.currentUses,
        deactivatedAt: new Date()
      });
    }

    // Créer le nouveau code (utiliser camelCase)
    const newToken = this.generateToken();
    doc.current = {
      code: promo.code,
      token: newToken,
      description: promo.description,
      discountType: promo.discount_type,
      discountValue: promo.discount_value,
      validFrom: new Date(promo.valid_from),
      validUntil: new Date(promo.valid_until),
      maxUses: promo.max_uses,
      currentUses: 0,
      isActive: promo.is_active,
      createdAt: new Date()
    };

    // Réinitialiser les stats de scan (utiliser camelCase)
    doc.scanStats = {
      totalScans: 0,
      totalReveals: 0,
      totalCopies: 0,
      conversionRateReveal: 0,
      conversionRateCopy: 0,
      scansByDay: new Map(),
      scansByHour: new Map(),
      averageTimeToReveal: 0
    };
    doc.events = [];

    await doc.save();

    return {
      ...promo,
      token: newToken,
      current_uses: 0,
      created_at: new Date().toISOString()
    };
  }

  // Incrémenter les vues
  async incrementViews(): Promise<void> {
    await connectToDatabase();
    await PromoConfig.updateOne(
      {},
      {
        $inc: {
          'stats.totalViews': 1,
          'stats.viewsToday': 1
        }
      }
    );
  }

  // Incrémenter les copies
  async incrementCopies(): Promise<void> {
    await connectToDatabase();
    await PromoConfig.updateOne(
      {},
      {
        $inc: {
          'stats.totalCopies': 1,
          'stats.copiesToday': 1,
          'current.currentUses': 1
        }
      }
    );
  }

  // === MÉTHODES DE TRACKING ===

  // Tracker un scan
  async trackScan(sessionId: string): Promise<void> {
    await connectToDatabase();
    const doc = await this.getOrCreateConfig();

    const now = new Date();
    const dateKey = now.toISOString().split('T')[0];
    const hourKey = `${now.getHours()}h`;

    // Ajouter l'événement
    doc.events.push({
      timestamp: now,
      type: 'scan',
      sessionId: sessionId
    });

    // Mettre à jour les stats
    doc.scanStats.totalScans++;

    const currentDayCount = doc.scanStats.scansByDay.get(dateKey) || 0;
    doc.scanStats.scansByDay.set(dateKey, currentDayCount + 1);

    const currentHourCount = doc.scanStats.scansByHour.get(hourKey) || 0;
    doc.scanStats.scansByHour.set(hourKey, currentHourCount + 1);

    // Recalculer les taux de conversion
    this.recalculateConversionRates(doc);

    await doc.save();
  }

  // Tracker une révélation
  async trackReveal(sessionId: string): Promise<void> {
    await connectToDatabase();
    const doc = await this.getOrCreateConfig();

    // Ajouter l'événement
    doc.events.push({
      timestamp: new Date(),
      type: 'reveal',
      sessionId: sessionId
    });

    // Mettre à jour les stats
    doc.scanStats.totalReveals++;

    // Calculer le temps moyen jusqu'à la révélation
    this.calculateAverageTimeToReveal(doc);

    // Recalculer les taux de conversion
    this.recalculateConversionRates(doc);

    await doc.save();
  }

  // Tracker une copie
  async trackCopy(sessionId: string): Promise<void> {
    await connectToDatabase();
    const doc = await this.getOrCreateConfig();

    // Ajouter l'événement
    doc.events.push({
      timestamp: new Date(),
      type: 'copy',
      sessionId: sessionId
    });

    // Mettre à jour les stats
    doc.scanStats.totalCopies++;
    doc.stats.totalCopies++;
    doc.stats.copiesToday++;
    doc.current.currentUses++;

    // Recalculer les taux de conversion
    this.recalculateConversionRates(doc);

    await doc.save();
  }

  // Recalculer les taux de conversion
  private recalculateConversionRates(doc: any): void {
    const { totalScans, totalReveals, totalCopies } = doc.scanStats;

    doc.scanStats.conversionRateReveal = totalScans > 0
      ? Math.round((totalReveals / totalScans) * 100 * 10) / 10
      : 0;

    doc.scanStats.conversionRateCopy = totalReveals > 0
      ? Math.round((totalCopies / totalReveals) * 100 * 10) / 10
      : 0;
  }

  // Calculer le temps moyen jusqu'à la révélation
  private calculateAverageTimeToReveal(doc: any): void {
    const sessionTimes: { [sessionId: string]: { scan?: number; reveal?: number } } = {};

    for (const event of doc.events) {
      if (!sessionTimes[event.sessionId]) {
        sessionTimes[event.sessionId] = {};
      }

      const timestamp = new Date(event.timestamp).getTime();
      if (event.type === 'scan' && !sessionTimes[event.sessionId].scan) {
        sessionTimes[event.sessionId].scan = timestamp;
      } else if (event.type === 'reveal' && !sessionTimes[event.sessionId].reveal) {
        sessionTimes[event.sessionId].reveal = timestamp;
      }
    }

    const times: number[] = [];
    for (const session of Object.values(sessionTimes)) {
      if (session.scan && session.reveal) {
        times.push((session.reveal - session.scan) / 1000);
      }
    }

    doc.scanStats.averageTimeToReveal = times.length > 0
      ? Math.round(times.reduce((a, b) => a + b, 0) / times.length)
      : 0;
  }

  // === MÉTHODES MARKETING ===

  // Obtenir le contenu marketing
  async getMarketingContent(): Promise<MarketingContent> {
    const config = await this.getConfig();
    return config.marketing;
  }

  // Mettre à jour le contenu marketing
  async updateMarketingContent(content: MarketingContent): Promise<boolean> {
    try {
      await connectToDatabase();
      await PromoConfig.updateOne(
        {},
        { $set: { marketing: content } }
      );
      return true;
    } catch (error) {      return false;
    }
  }

  // === MÉTHODES DE STATS ===

  // Obtenir les stats de scan
  async getScanStats(): Promise<ScanStats> {
    const config = await this.getConfig();
    return config.scan_stats;
  }

  // Obtenir les stats des 7 derniers jours
  async getWeeklyStats(): Promise<{ date: string; scans: number }[]> {
    const config = await this.getConfig();
    const result: { date: string; scans: number }[] = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];
      result.push({
        date: dateKey,
        scans: config.scan_stats.scans_by_day[dateKey] || 0
      });
    }

    return result;
  }

  // Obtenir le top des heures de scan
  async getTopHours(): Promise<{ hour: string; count: number; percentage: number }[]> {
    const config = await this.getConfig();
    const hourData = config.scan_stats.scans_by_hour;
    const total = Object.values(hourData).reduce((a, b) => a + b, 0);

    return Object.entries(hourData)
      .map(([hour, count]) => ({
        hour,
        count,
        percentage: total > 0 ? Math.round((count / total) * 100) : 0
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  // Nettoyer les anciens événements (> 30 jours)
  async cleanupOldEvents(): Promise<number> {
    await connectToDatabase();
    const doc = await this.getOrCreateConfig();
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;

    const initialCount = doc.events.length;
    doc.events = doc.events.filter(
      (event: any) => new Date(event.timestamp).getTime() > thirtyDaysAgo
    );

    const removedCount = initialCount - doc.events.length;

    if (removedCount > 0) {
      await doc.save();
    }

    return removedCount;
  }

  // Réinitialiser les stats quotidiennes
  async resetDailyStats(): Promise<void> {
    await connectToDatabase();
    await PromoConfig.updateOne(
      {},
      {
        $set: {
          'stats.viewsToday': 0,
          'stats.copiesToday': 0
        }
      }
    );
  }
}

// Exporter une instance singleton
export const promoService = new PromoService();
