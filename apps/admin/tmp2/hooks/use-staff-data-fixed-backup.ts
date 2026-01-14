"use client";

import { useCallback, useEffect, useState } from "react";

console.log("🚀🚀🚀 FICHIER use-staff-data-FIXED.ts CHARGÉ !!! 🚀🚀🚀");

// Types pour les données Staff (API MongoDB moderne)
interface StaffMemberFromAPI {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string; // Champ moderne unifié
  numberSecu?: string;
  adresse?: string;
  zipcode?: string;
  city?: string;
  framework?: string;
  times?: string;
  hourlyRate?: number;
  startDate?: string;
  endDate?: string;
  contract?: string;
  mdp: number;
  isActive: boolean; // Champ moderne unifié
  createdAt?: string;
  updatedAt?: string;
}

// Types pour les composants (format unifié moderne)
interface StaffMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string; // Unifié vers le format moderne
  mdp: number;
  isActive: boolean; // Unifié vers le format moderne
}

interface StaffResponse {
  success: boolean;
  data: StaffMemberFromAPI[];
}

interface StaffCacheData {
  data: StaffResponse;
  timestamp: number;
}

type StaffListener = (
  data: StaffMember[] | null,
  isLoading: boolean,
  error: string | null,
) => void;

// ===== SINGLETON GLOBAL CACHE MANAGER =====
class StaffCacheManager {
  private static instance: StaffCacheManager;
  private cache: StaffMember[] | null = null;
  private isLoading = false;
  private error: string | null = null;
  private listeners: Set<StaffListener> = new Set();
  private lastFetch = 0;
  private currentFetch: Promise<StaffMember[]> | null = null;
  private readonly CACHE_DURATION =
    process.env.NODE_ENV === "development"
      ? 5 * 60 * 1000
      : 24 * 60 * 60 * 1000; // 5min dev, 24h prod
  private readonly STORAGE_KEY = "staff-cache-data";

  static getInstance(): StaffCacheManager {
    if (!StaffCacheManager.instance) {
      StaffCacheManager.instance = new StaffCacheManager();
    }
    return StaffCacheManager.instance;
  }

  private constructor() {
    // Charger depuis localStorage si disponible
    this.loadFromStorage();
    console.log(`🎯 STAFF SINGLETON INITIAL STATE:`, this.getState());
  }

  private loadFromStorage() {
    if (typeof window === "undefined") return;

    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const cachedData: StaffCacheData = JSON.parse(stored);
        const now = Date.now();

        if (now - cachedData.timestamp < this.CACHE_DURATION) {
          this.cache = this.transformStaffData(cachedData.data.data);
          this.lastFetch = cachedData.timestamp;
          console.log(
            "📦 STAFF SINGLETON CACHE INIT: Using localStorage cache",
          );
        } else {
          localStorage.removeItem(this.STORAGE_KEY);
        }
      }
    } catch (error) {
      console.error("📦 STAFF SINGLETON: Error loading from storage", error);
    }
  }

  private saveToStorage(data: StaffResponse) {
    if (typeof window === "undefined") return;

    try {
      const cacheData: StaffCacheData = {
        data,
        timestamp: Date.now(),
      };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(cacheData));
    } catch (error) {
      console.error("📦 STAFF SINGLETON: Error saving to storage", error);
    }
  }

  private transformStaffData = (
    apiData: StaffMemberFromAPI[],
  ): StaffMember[] => {
    return apiData.map((member) => ({
      id: member._id,
      firstName: member.firstName,
      lastName: member.lastName,
      email: member.email || "",
      phone: member.phone || "",
      mdp: member.mdp || 0,
      isActive: member.isActive ?? true,
    }));
  };

  async getStaffData(forceRefresh = false): Promise<StaffMember[]> {
    console.log(`🎯 STAFF SINGLETON GETDATA: Start function`, {
      hasCache: !!this.cache,
      cacheLength: this.cache?.length,
      forceRefresh,
      lastFetch: this.lastFetch,
    });

    const now = Date.now();
    const isCacheValid =
      this.cache && now - this.lastFetch < this.CACHE_DURATION;

    if (!forceRefresh && isCacheValid) {
      console.log(
        `📊 STAFF SINGLETON: Using existing data (${this.cache!.length} records)`,
        this.cache,
      );
      return this.cache!;
    }

    if (this.cache && !forceRefresh) {
      console.log(
        `📊 STAFF SINGLETON: Using existing data (${this.cache.length} records)`,
        this.cache,
      );
      return this.cache;
    }

    // Si un fetch est déjà en cours, on s'y joint
    if (this.currentFetch) {
      console.log(`🔄 STAFF SINGLETON: Fetch already in progress - joining`);
      return this.currentFetch;
    }

    console.log(`🔥 STAFF SINGLETON: Starting new fetch`);
    this.setLoading(true);
    this.setError(null);

    this.currentFetch = this.performFetch();

    try {
      const result = await this.currentFetch;
      return result;
    } finally {
      this.currentFetch = null;
    }
  }

  private async performFetch(): Promise<StaffMember[]> {
    try {
      const now = Date.now();
      const url = "/api/staff";

      console.log(`🔥 STAFF SINGLETON FETCH: Starting API call to /api/staff`);
      console.log(`🔗 STAFF SINGLETON URL: ${url}`);

      const response = await fetch(url);
      console.log(`🌐 STAFF SINGLETON RESPONSE: ${response.status}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: StaffResponse = await response.json();
      console.log(
        `📊 STAFF SINGLETON SUCCESS: ${result.data?.length || 0} records loaded`,
        result,
      );

      if (result.success && result.data) {
        this.cache = this.transformStaffData(result.data);
        this.lastFetch = now;
        this.saveToStorage(result);
        this.setLoading(false);
        this.notifyListeners();
        return this.cache;
      } else {
        throw new Error("API returned unsuccessful response");
      }
    } catch (error) {
      console.error("❌ STAFF SINGLETON ERROR:", error);
      this.setError(error instanceof Error ? error.message : "Unknown error");
      this.setLoading(false);
      this.notifyListeners();
      throw error;
    }
  }

  forceRefresh(): Promise<StaffMember[]> {
    console.log(`🔄 STAFF SINGLETON: Force refresh requested`);
    return this.getStaffData(true);
  }

  // Interface publique
  getState() {
    return {
      data: this.cache,
      isLoading: this.isLoading,
      error: this.error,
    };
  }

  subscribe(listener: StaffListener) {
    this.listeners.add(listener);
    // Envoyer immédiatement l'état actuel
    listener(this.cache, this.isLoading, this.error);

    return () => {
      this.listeners.delete(listener);
    };
  }

  private setLoading(loading: boolean) {
    this.isLoading = loading;
  }

  private setError(error: string | null) {
    this.error = error;
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => {
      listener(this.cache, this.isLoading, this.error);
    });
  }

  invalidateCache() {
    this.cache = null;
    this.lastFetch = 0;
    if (typeof window !== "undefined") {
      localStorage.removeItem(this.STORAGE_KEY);
    }
    console.log("📦 STAFF SINGLETON: Cache invalidated");
  }
}

// Instance globale
const staffCacheManager = StaffCacheManager.getInstance();

// Hook principal utilisant le Singleton
export const useStaffDataFixed = () => {
  console.log(`🚀🚀🚀 STAFF SINGLETON HOOK CALLED`);

  const [state, setState] = useState(() => {
    const initialState = staffCacheManager.getState();
    console.log("🎯 STAFF SINGLETON INITIAL STATE:", initialState);
    return initialState;
  });

  useEffect(() => {
    // Si pas de données, on déclenche un fetch immédiat
    if (!state.data && !state.isLoading) {
      console.log(
        "🎯 STAFF SINGLETON: Triggering immediate fetch on first call",
      );
      staffCacheManager.getStaffData().catch((error) => {
        console.error("🎯 STAFF SINGLETON IMMEDIATE FETCH ERROR:", error);
      });
    }

    // S'abonner aux changements
    const unsubscribe = staffCacheManager.subscribe(
      (data, isLoading, error) => {
        console.log("🔔 STAFF SINGLETON LISTENER: State changed", {
          data: data?.length,
          isLoading,
          error,
        });
        setState({ data, isLoading, error });
      },
    );

    console.log("🎯 STAFF SINGLETON USEEFFECT: Starting");
    staffCacheManager.getStaffData().catch((error) => {
      console.error(
        "🎯 STAFF SINGLETON USEEFFECT: Error in getDashboardData",
        error,
      );
    });

    return () => {
      console.log("🎯 STAFF SINGLETON USEEFFECT: Cleanup");
      unsubscribe();
    };
  }, []);

  console.log(`🚀 STAFF SINGLETON HOOK STATE:`, {
    dataLength: state.data?.length,
    isLoading: state.isLoading,
    error: state.error,
  });

  const refresh = useCallback(() => {
    return staffCacheManager.forceRefresh();
  }, []);

  const invalidateCache = useCallback(() => {
    staffCacheManager.invalidateCache();
  }, []);

  return {
    data: state.data,
    isLoading: state.isLoading,
    error: state.error,
    refresh,
    invalidateCache,
  };
};
