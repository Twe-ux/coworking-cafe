import crypto from "crypto";
import { PromoConfig, connectToDatabase } from "@coworking-cafe/database";
import type {
  PromoConfigData,
  PromoCode,
  MarketingContent,
  ScanStats,
} from "../types/promo";
import { DEFAULT_PROMO_CONFIG } from "../types/promo";

interface MongoPromoDocument {
  current: {
    code: string;
    token: string;
    description: string;
    discountType: string;
    discountValue: number;
    validFrom: Date;
    validUntil: Date;
    maxUses: number;
    currentUses: number;
    isActive: boolean;
    createdAt: Date;
  };
  history: Array<{
    code: string;
    token: string;
    description: string;
    discountType: string;
    discountValue: number;
    validFrom: Date;
    validUntil: Date;
    totalUses: number;
    deactivatedAt: Date;
  }>;
  stats: {
    totalViews: number;
    totalCopies: number;
    viewsToday: number;
    copiesToday: number;
  };
  scanStats: {
    totalScans: number;
    totalReveals: number;
    totalCopies: number;
    conversionRateReveal: number;
    conversionRateCopy: number;
    scansByDay: Map<string, number>;
    scansByHour: Map<string, number>;
    averageTimeToReveal: number;
  };
  marketing: {
    title: string;
    message: string;
    imageUrl?: string;
    ctaText: string;
  };
  events: Array<{
    timestamp: Date;
    type: string;
    sessionId: string;
  }>;
  save: () => Promise<unknown>;
}

class PromoService {
  private generateToken(): string {
    return crypto.randomBytes(16).toString("hex");
  }

  private toPromoConfig(doc: MongoPromoDocument): PromoConfigData {
    const config: PromoConfigData = {
      current: {
        code: doc.current.code,
        token: doc.current.token,
        description: doc.current.description,
        discount_type: doc.current.discountType as "percentage" | "fixed" | "free_item",
        discount_value: doc.current.discountValue,
        valid_from: doc.current.validFrom.toISOString(),
        valid_until: doc.current.validUntil.toISOString(),
        max_uses: doc.current.maxUses,
        current_uses: doc.current.currentUses,
        is_active: doc.current.isActive,
        created_at: doc.current.createdAt.toISOString(),
      },
      history: doc.history.map((h) => ({
        code: h.code,
        token: h.token,
        description: h.description,
        discount_type: h.discountType as "percentage" | "fixed" | "free_item",
        discount_value: h.discountValue,
        valid_from: h.validFrom.toISOString(),
        valid_until: h.validUntil.toISOString(),
        total_uses: h.totalUses,
        deactivated_at: h.deactivatedAt.toISOString(),
      })),
      stats: {
        total_views: doc.stats.totalViews,
        total_copies: doc.stats.totalCopies,
        views_today: doc.stats.viewsToday,
        copies_today: doc.stats.copiesToday,
      },
      scan_stats: {
        total_scans: doc.scanStats.totalScans,
        total_reveals: doc.scanStats.totalReveals,
        total_copies: doc.scanStats.totalCopies,
        conversion_rate_reveal: doc.scanStats.conversionRateReveal,
        conversion_rate_copy: doc.scanStats.conversionRateCopy,
        scans_by_day:
          doc.scanStats.scansByDay instanceof Map
            ? Object.fromEntries(doc.scanStats.scansByDay)
            : doc.scanStats.scansByDay || {},
        scans_by_hour:
          doc.scanStats.scansByHour instanceof Map
            ? Object.fromEntries(doc.scanStats.scansByHour)
            : doc.scanStats.scansByHour || {},
        average_time_to_reveal: doc.scanStats.averageTimeToReveal,
      },
      marketing: {
        title: doc.marketing.title,
        message: doc.marketing.message,
        image_url: doc.marketing.imageUrl,
        cta_text: doc.marketing.ctaText,
      },
      events: doc.events.map((e) => ({
        timestamp: e.timestamp.toISOString(),
        type: e.type,
        session_id: e.sessionId,
      })),
    };
    return config;
  }

  private async getOrCreateConfig(): Promise<MongoPromoDocument> {
    await connectToDatabase();

    let doc = await PromoConfig.findOne();

    if (!doc) {
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
          createdAt: new Date(DEFAULT_PROMO_CONFIG.current.created_at),
        },
        history: [],
        stats: {
          totalViews: 0,
          totalCopies: 0,
          viewsToday: 0,
          copiesToday: 0,
        },
        scanStats: {
          totalScans: 0,
          totalReveals: 0,
          totalCopies: 0,
          conversionRateReveal: 0,
          conversionRateCopy: 0,
          scansByDay: new Map(),
          scansByHour: new Map(),
          averageTimeToReveal: 0,
        },
        marketing: {
          title: DEFAULT_PROMO_CONFIG.marketing.title,
          message: DEFAULT_PROMO_CONFIG.marketing.message,
          imageUrl: DEFAULT_PROMO_CONFIG.marketing.image_url,
          ctaText: DEFAULT_PROMO_CONFIG.marketing.cta_text,
        },
        events: [],
      };

      doc = await PromoConfig.create(defaultConfig);
    }

    return doc as unknown as MongoPromoDocument;
  }

  async getConfig(): Promise<PromoConfigData> {
    const doc = await this.getOrCreateConfig();
    return this.toPromoConfig(doc);
  }

  async getCurrentPromo(): Promise<PromoCode> {
    const config = await this.getConfig();
    return config.current;
  }

  async getCurrentToken(): Promise<string> {
    const config = await this.getConfig();
    return config.current.token;
  }

  async getPromoByToken(token: string): Promise<PromoCode | null> {
    const config = await this.getConfig();
    if (config.current.token === token && config.current.is_active) {
      return config.current;
    }
    return null;
  }

  async createPromo(
    promo: Omit<PromoCode, "token" | "current_uses" | "created_at">,
  ): Promise<PromoCode> {
    await connectToDatabase();
    const doc = await this.getOrCreateConfig();

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
        deactivatedAt: new Date(),
      });
    }

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
      createdAt: new Date(),
    };

    doc.scanStats = {
      totalScans: 0,
      totalReveals: 0,
      totalCopies: 0,
      conversionRateReveal: 0,
      conversionRateCopy: 0,
      scansByDay: new Map(),
      scansByHour: new Map(),
      averageTimeToReveal: 0,
    };
    doc.events = [];

    await doc.save();

    return {
      ...promo,
      token: newToken,
      current_uses: 0,
      created_at: new Date().toISOString(),
    };
  }

  async trackScan(sessionId: string): Promise<void> {
    await connectToDatabase();
    const doc = await this.getOrCreateConfig();

    const now = new Date();
    const dateKey = now.toISOString().split("T")[0];
    const hourKey = `${now.getHours()}h`;

    doc.events.push({
      timestamp: now,
      type: "scan",
      sessionId: sessionId,
    });

    doc.scanStats.totalScans++;

    const currentDayCount = doc.scanStats.scansByDay.get(dateKey) || 0;
    doc.scanStats.scansByDay.set(dateKey, currentDayCount + 1);

    const currentHourCount = doc.scanStats.scansByHour.get(hourKey) || 0;
    doc.scanStats.scansByHour.set(hourKey, currentHourCount + 1);

    this.recalculateConversionRates(doc);

    await doc.save();
  }

  async trackReveal(sessionId: string): Promise<void> {
    await connectToDatabase();
    const doc = await this.getOrCreateConfig();

    doc.events.push({
      timestamp: new Date(),
      type: "reveal",
      sessionId: sessionId,
    });

    doc.scanStats.totalReveals++;

    this.calculateAverageTimeToReveal(doc);
    this.recalculateConversionRates(doc);

    await doc.save();
  }

  async trackCopy(sessionId: string): Promise<void> {
    await connectToDatabase();
    const doc = await this.getOrCreateConfig();

    doc.events.push({
      timestamp: new Date(),
      type: "copy",
      sessionId: sessionId,
    });

    doc.scanStats.totalCopies++;
    doc.stats.totalCopies++;
    doc.stats.copiesToday++;
    doc.current.currentUses++;

    this.recalculateConversionRates(doc);

    await doc.save();
  }

  private recalculateConversionRates(doc: MongoPromoDocument): void {
    const { totalScans, totalReveals, totalCopies } = doc.scanStats;

    doc.scanStats.conversionRateReveal =
      totalScans > 0
        ? Math.round((totalReveals / totalScans) * 100 * 10) / 10
        : 0;

    doc.scanStats.conversionRateCopy =
      totalReveals > 0
        ? Math.round((totalCopies / totalReveals) * 100 * 10) / 10
        : 0;
  }

  private calculateAverageTimeToReveal(doc: MongoPromoDocument): void {
    const sessionTimes: {
      [sessionId: string]: { scan?: number; reveal?: number };
    } = {};

    for (const event of doc.events) {
      if (!sessionTimes[event.sessionId]) {
        sessionTimes[event.sessionId] = {};
      }

      const timestamp = new Date(event.timestamp).getTime();
      if (event.type === "scan" && !sessionTimes[event.sessionId].scan) {
        sessionTimes[event.sessionId].scan = timestamp;
      } else if (
        event.type === "reveal" &&
        !sessionTimes[event.sessionId].reveal
      ) {
        sessionTimes[event.sessionId].reveal = timestamp;
      }
    }

    const times: number[] = [];
    for (const session of Object.values(sessionTimes)) {
      if (session.scan && session.reveal) {
        times.push((session.reveal - session.scan) / 1000);
      }
    }

    doc.scanStats.averageTimeToReveal =
      times.length > 0
        ? Math.round(times.reduce((a, b) => a + b, 0) / times.length)
        : 0;
  }

  async getMarketingContent(): Promise<MarketingContent> {
    const config = await this.getConfig();
    return config.marketing;
  }

  async updateMarketingContent(
    content: Partial<MarketingContent>,
  ): Promise<boolean> {
    try {
      await connectToDatabase();

      const updateFields: Record<string, unknown> = {};
      if (content.title !== undefined) updateFields["marketing.title"] = content.title;
      if (content.message !== undefined) updateFields["marketing.message"] = content.message;
      if (content.image_url !== undefined) updateFields["marketing.imageUrl"] = content.image_url;
      if (content.cta_text !== undefined) updateFields["marketing.ctaText"] = content.cta_text;

      await PromoConfig.updateOne({}, { $set: updateFields });
      return true;
    } catch (error) {
      return false;
    }
  }

  async getScanStats(): Promise<ScanStats> {
    const config = await this.getConfig();
    return config.scan_stats;
  }

  async getWeeklyStats(): Promise<{ date: string; scans: number }[]> {
    const config = await this.getConfig();
    const result: { date: string; scans: number }[] = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split("T")[0];
      result.push({
        date: dateKey,
        scans: config.scan_stats.scans_by_day[dateKey] || 0,
      });
    }

    return result;
  }
}

export const promoService = new PromoService();
