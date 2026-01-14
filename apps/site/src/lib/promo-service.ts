import crypto from 'crypto';
import connectDB from '@/lib/db';
import PromoConfig from '@/models/promo';
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
        discount_type: doc.current.discount_type,
        discount_value: doc.current.discount_value,
        valid_from: doc.current.valid_from.toISOString(),
        valid_until: doc.current.valid_until.toISOString(),
        max_uses: doc.current.max_uses,
        current_uses: doc.current.current_uses,
        is_active: doc.current.is_active,
        created_at: doc.current.created_at.toISOString()
      },
      history: doc.history.map((h: any) => ({
        code: h.code,
        token: h.token,
        description: h.description,
        discount_type: h.discount_type,
        discount_value: h.discount_value,
        valid_from: h.valid_from.toISOString(),
        valid_until: h.valid_until.toISOString(),
        total_uses: h.total_uses,
        deactivated_at: h.deactivated_at.toISOString()
      })),
      stats: {
        total_views: doc.stats.total_views,
        total_copies: doc.stats.total_copies,
        views_today: doc.stats.views_today,
        copies_today: doc.stats.copies_today
      },
      scan_stats: {
        total_scans: doc.scan_stats.total_scans,
        total_reveals: doc.scan_stats.total_reveals,
        total_copies: doc.scan_stats.total_copies,
        conversion_rate_reveal: doc.scan_stats.conversion_rate_reveal,
        conversion_rate_copy: doc.scan_stats.conversion_rate_copy,
        scans_by_day: doc.scan_stats.scans_by_day instanceof Map
          ? Object.fromEntries(doc.scan_stats.scans_by_day)
          : doc.scan_stats.scans_by_day || {},
        scans_by_hour: doc.scan_stats.scans_by_hour instanceof Map
          ? Object.fromEntries(doc.scan_stats.scans_by_hour)
          : doc.scan_stats.scans_by_hour || {},
        average_time_to_reveal: doc.scan_stats.average_time_to_reveal
      },
      marketing: {
        title: doc.marketing.title,
        message: doc.marketing.message,
        image_url: doc.marketing.image_url,
        cta_text: doc.marketing.cta_text
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
    await connectDB();

    let doc = await PromoConfig.findOne();

    if (!doc) {
      // Créer la configuration par défaut
      const defaultConfig = {
        ...DEFAULT_PROMO_CONFIG,
        current: {
          ...DEFAULT_PROMO_CONFIG.current,
          token: this.generateToken(),
          valid_from: new Date(DEFAULT_PROMO_CONFIG.current.valid_from),
          valid_until: new Date(DEFAULT_PROMO_CONFIG.current.valid_until),
          created_at: new Date(DEFAULT_PROMO_CONFIG.current.created_at)
        },
        scan_stats: {
          ...DEFAULT_PROMO_CONFIG.scan_stats,
          scans_by_day: new Map(),
          scans_by_hour: new Map()
        },
        events: []
      };

      doc = await PromoConfig.create(defaultConfig);    }

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
    await connectDB();
    const doc = await this.getOrCreateConfig();

    // Archiver l'ancien code si actif
    if (doc.current.is_active && doc.current.current_uses > 0) {
      doc.history.push({
        code: doc.current.code,
        token: doc.current.token,
        description: doc.current.description,
        discount_type: doc.current.discount_type,
        discount_value: doc.current.discount_value,
        valid_from: doc.current.valid_from,
        valid_until: doc.current.valid_until,
        total_uses: doc.current.current_uses,
        deactivated_at: new Date()
      });
    }

    // Créer le nouveau code
    const newToken = this.generateToken();
    doc.current = {
      code: promo.code,
      token: newToken,
      description: promo.description,
      discount_type: promo.discount_type,
      discount_value: promo.discount_value,
      valid_from: new Date(promo.valid_from),
      valid_until: new Date(promo.valid_until),
      max_uses: promo.max_uses,
      current_uses: 0,
      is_active: promo.is_active,
      created_at: new Date()
    };

    // Réinitialiser les stats de scan
    doc.scan_stats = {
      total_scans: 0,
      total_reveals: 0,
      total_copies: 0,
      conversion_rate_reveal: 0,
      conversion_rate_copy: 0,
      scans_by_day: new Map(),
      scans_by_hour: new Map(),
      average_time_to_reveal: 0
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
    await connectDB();
    await PromoConfig.updateOne(
      {},
      {
        $inc: {
          'stats.total_views': 1,
          'stats.views_today': 1
        }
      }
    );
  }

  // Incrémenter les copies
  async incrementCopies(): Promise<void> {
    await connectDB();
    await PromoConfig.updateOne(
      {},
      {
        $inc: {
          'stats.total_copies': 1,
          'stats.copies_today': 1,
          'current.current_uses': 1
        }
      }
    );
  }

  // === MÉTHODES DE TRACKING ===

  // Tracker un scan
  async trackScan(sessionId: string): Promise<void> {
    await connectDB();
    const doc = await this.getOrCreateConfig();

    const now = new Date();
    const dateKey = now.toISOString().split('T')[0];
    const hourKey = `${now.getHours()}h`;

    // Ajouter l'événement
    doc.events.push({
      timestamp: now,
      type: 'scan',
      session_id: sessionId
    });

    // Mettre à jour les stats
    doc.scan_stats.total_scans++;

    const currentDayCount = doc.scan_stats.scans_by_day.get(dateKey) || 0;
    doc.scan_stats.scans_by_day.set(dateKey, currentDayCount + 1);

    const currentHourCount = doc.scan_stats.scans_by_hour.get(hourKey) || 0;
    doc.scan_stats.scans_by_hour.set(hourKey, currentHourCount + 1);

    // Recalculer les taux de conversion
    this.recalculateConversionRates(doc);

    await doc.save();
  }

  // Tracker une révélation
  async trackReveal(sessionId: string): Promise<void> {
    await connectDB();
    const doc = await this.getOrCreateConfig();

    // Ajouter l'événement
    doc.events.push({
      timestamp: new Date(),
      type: 'reveal',
      session_id: sessionId
    });

    // Mettre à jour les stats
    doc.scan_stats.total_reveals++;

    // Calculer le temps moyen jusqu'à la révélation
    this.calculateAverageTimeToReveal(doc);

    // Recalculer les taux de conversion
    this.recalculateConversionRates(doc);

    await doc.save();
  }

  // Tracker une copie
  async trackCopy(sessionId: string): Promise<void> {
    await connectDB();
    const doc = await this.getOrCreateConfig();

    // Ajouter l'événement
    doc.events.push({
      timestamp: new Date(),
      type: 'copy',
      session_id: sessionId
    });

    // Mettre à jour les stats
    doc.scan_stats.total_copies++;
    doc.stats.total_copies++;
    doc.stats.copies_today++;
    doc.current.current_uses++;

    // Recalculer les taux de conversion
    this.recalculateConversionRates(doc);

    await doc.save();
  }

  // Recalculer les taux de conversion
  private recalculateConversionRates(doc: any): void {
    const { total_scans, total_reveals, total_copies } = doc.scan_stats;

    doc.scan_stats.conversion_rate_reveal = total_scans > 0
      ? Math.round((total_reveals / total_scans) * 100 * 10) / 10
      : 0;

    doc.scan_stats.conversion_rate_copy = total_reveals > 0
      ? Math.round((total_copies / total_reveals) * 100 * 10) / 10
      : 0;
  }

  // Calculer le temps moyen jusqu'à la révélation
  private calculateAverageTimeToReveal(doc: any): void {
    const sessionTimes: { [sessionId: string]: { scan?: number; reveal?: number } } = {};

    for (const event of doc.events) {
      if (!sessionTimes[event.session_id]) {
        sessionTimes[event.session_id] = {};
      }

      const timestamp = new Date(event.timestamp).getTime();
      if (event.type === 'scan' && !sessionTimes[event.session_id].scan) {
        sessionTimes[event.session_id].scan = timestamp;
      } else if (event.type === 'reveal' && !sessionTimes[event.session_id].reveal) {
        sessionTimes[event.session_id].reveal = timestamp;
      }
    }

    const times: number[] = [];
    for (const session of Object.values(sessionTimes)) {
      if (session.scan && session.reveal) {
        times.push((session.reveal - session.scan) / 1000);
      }
    }

    doc.scan_stats.average_time_to_reveal = times.length > 0
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
      await connectDB();
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
    await connectDB();
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
    await connectDB();
    await PromoConfig.updateOne(
      {},
      {
        $set: {
          'stats.views_today': 0,
          'stats.copies_today': 0
        }
      }
    );
  }
}

// Exporter une instance singleton
export const promoService = new PromoService();
