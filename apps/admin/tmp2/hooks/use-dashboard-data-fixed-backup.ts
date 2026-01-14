"use client";

import { useEffect, useMemo, useState } from "react";

// Types pour le cache
interface CacheData {
  data: Record<string, RangeData>;
  timestamp: number;
  date: string; // Format YYYY-MM-DD pour validation jour suivant
}

interface RangeData {
  TTC: number;
  HT: number;
}

interface DashboardApiResponse {
  success: boolean;
  data: Record<string, RangeData>;
  timestamp: string;
}

interface DashboardHookState {
  data: Record<string, RangeData> | null;
  isLoading: boolean;
  error: string | null;
}

// ===== SINGLETON GLOBAL CACHE MANAGER =====
class DashboardCacheManager {
  private static instance: DashboardCacheManager;
  private data: Record<string, RangeData> | null = null;
  private isLoading = false;
  private error: string | null = null;
  private promise: Promise<void> | null = null;
  private listeners: Set<() => void> = new Set();

  private constructor() {}

  static getInstance(): DashboardCacheManager {
    if (!DashboardCacheManager.instance) {
      DashboardCacheManager.instance = new DashboardCacheManager();
    }
    return DashboardCacheManager.instance;
  }

  // Ajouter un listener pour les changements d'état
  addListener(callback: () => void) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  // Notifier tous les listeners
  private notifyListeners() {
    this.listeners.forEach((callback) => callback());
  }

  // Obtenir l'état actuel
  getState(): DashboardHookState {
    return {
      data: this.data,
      isLoading: this.isLoading,
      error: this.error,
    };
  }

  // Vérifier si le cache localStorage est valide
  private isCacheValid(cacheData: CacheData): boolean {
    const currentDate = new Date().toISOString().split("T")[0];
    const maxAge =
      process.env.NODE_ENV === "development"
        ? 5 * 60 * 1000
        : 24 * 60 * 60 * 1000;
    const cacheAge = Date.now() - cacheData.timestamp;

    // Invalide si c'est un autre jour
    if (cacheData.date !== currentDate) {
      console.log("📦 CACHE INVALID: Different day detected", {
        cached: cacheData.date,
        current: currentDate,
      });
      return false;
    }

    // Invalide si le cache est trop vieux
    if (cacheAge > maxAge) {
      console.log("📦 CACHE INVALID: Cache expired", {
        age: Math.round(cacheAge / 1000),
        maxAge: Math.round(maxAge / 1000),
      });
      return false;
    }

    // Vérifier que toutes les ranges importantes sont présentes
    const requiredRanges = [
      "yesterday",
      "week",
      "month",
      "year",
      "customPreviousDay",
      "customPreviousWeek",
      "customPreviousMonth",
      "customPreviousYear",
      "previousDay",
      "previousWeek",
      "previousMonth",
      "previousYear",
    ];

    const missingRanges = requiredRanges.filter(
      (range) => !cacheData.data[range],
    );
    if (missingRanges.length > 0) {
      console.log("📦 CACHE INVALID: Missing ranges", {
        missingRanges,
        availableRanges: Object.keys(cacheData.data),
      });
      return false;
    }

    console.log("📦 CACHE VALID: Using cached data", {
      age: Math.round(cacheAge / 1000),
      date: cacheData.date,
      ranges: Object.keys(cacheData.data).length,
    });
    return true;
  }

  // Lire le cache depuis localStorage (y compris le cache préchargé)
  private getCacheData(): CacheData | null {
    if (typeof window === "undefined") return null;

    try {
      // Essayer d'abord le cache dashboard normal
      const cached = localStorage.getItem("dashboard-data-cache");
      if (cached) {
        const parsedCache = JSON.parse(cached);
        if (this.isCacheValid(parsedCache)) {
          console.log("📦 DASHBOARD CACHE HIT: Using normal cache");
          return parsedCache;
        }
      }

      // Si pas de cache normal valide, vérifier le cache préchargé
      const preloadedCache = localStorage.getItem("dashboard-data-cache");
      if (preloadedCache) {
        const parsedPreloadCache = JSON.parse(preloadedCache);
        if (this.isCacheValid(parsedPreloadCache)) {
          console.log("🚀 DASHBOARD PRELOAD CACHE HIT: Using preloaded data");
          return parsedPreloadCache;
        }
      }

      return null;
    } catch (error) {
      console.warn("📦 CACHE ERROR: Failed to read cache", error);
      return null;
    }
  }

  // Sauvegarder le cache dans localStorage
  private setCacheData(data: Record<string, RangeData>) {
    if (typeof window === "undefined") return;

    try {
      const cacheData: CacheData = {
        data,
        timestamp: Date.now(),
        date: new Date().toISOString().split("T")[0],
      };
      localStorage.setItem("dashboard-data-cache", JSON.stringify(cacheData));
      console.log("📦 CACHE SET: Data cached successfully");
    } catch (error) {
      console.warn("📦 CACHE ERROR: Failed to set cache", error);
    }
  }

  // Initialiser à partir du cache
  private initializeFromCache() {
    const cachedData = this.getCacheData();
    if (cachedData && this.isCacheValid(cachedData)) {
      console.log("📦 SINGLETON CACHE INIT: Using localStorage cache");
      this.data = cachedData.data;
      this.isLoading = false;
      this.error = null;
      return true;
    }
    return false;
  }

  // Fonction principale pour obtenir les données
  async getDashboardData(forceRefresh = false): Promise<void> {
    console.log("🎯 SINGLETON GETDASHBOARDDATA: Start function", {
      hasData: !!this.data,
      isLoading: this.isLoading,
      hasPromise: !!this.promise,
      forceRefresh,
    });

    // Si on force un refresh, on nettoie tout
    if (forceRefresh) {
      console.log("🔄 SINGLETON: Force refresh requested - clearing cache");
      this.data = null;
      this.isLoading = false;
      this.promise = null;
      if (typeof window !== "undefined") {
        localStorage.removeItem("dashboard-data-cache");
      }
    }

    // Si on a déjà des données en mémoire, pas besoin de refetch
    if (this.data && !forceRefresh) {
      console.log("📦 SINGLETON: Data already in memory");
      return;
    }

    // Si une requête est déjà en cours, attendre sa completion
    if (this.isLoading && this.promise) {
      console.log("🔄 SINGLETON: Fetch already in progress - joining");
      return this.promise;
    }

    // Essayer d'initialiser depuis le cache (sauf si force refresh)
    if (!forceRefresh && this.initializeFromCache()) {
      this.notifyListeners();
      return;
    }

    // Sinon, faire le fetch
    console.log("🔥 SINGLETON: Starting new fetch");
    this.isLoading = true;
    this.error = null;
    this.notifyListeners();

    this.promise = this.fetchFromApi();
    return this.promise;
  }

  // Fetch depuis l'API
  private async fetchFromApi(): Promise<void> {
    try {
      console.log("🔥 SINGLETON FETCH: Starting API call to /api/dashboard");

      // Construction de l'URL pour SSR/CSR
      const baseUrl =
        typeof window !== "undefined" ? "" : "http://localhost:3000";
      const url = `${baseUrl}/api/dashboard`;
      console.log("🔗 SINGLETON URL:", url);

      const response = await fetch(url);
      console.log(`🌐 SINGLETON RESPONSE: ${response.status}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: DashboardApiResponse = await response.json();
      console.log(
        "📊 SINGLETON SUCCESS: Ranges loaded:",
        Object.keys(result.data),
      );

      // Mettre en cache
      this.setCacheData(result.data);
      this.data = result.data;
      this.isLoading = false;
      this.error = null;
      this.promise = null;

      this.notifyListeners();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      console.error("❌ SINGLETON ERROR:", error);

      this.isLoading = false;
      this.error = errorMessage;
      this.promise = null;

      this.notifyListeners();
    }
  }

  // Invalider le cache manuellement
  invalidateCache() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("dashboard-data-cache");
    }
    this.data = null;
    this.isLoading = false;
    this.error = null;
    this.promise = null;
    console.log("📦 SINGLETON: Cache invalidated");
    this.notifyListeners();
  }

  // Forcer un refresh complet
  async forceRefresh(): Promise<void> {
    console.log("🔄 SINGLETON: Force refresh requested");
    return this.getDashboardData(true);
  }

  // Obtenir les infos du cache
  getCacheInfo() {
    const cached = this.getCacheData();
    if (!cached) return null;

    return {
      age: Date.now() - cached.timestamp,
      date: cached.date,
      isValid: this.isCacheValid(cached),
      dataKeys: Object.keys(cached.data || {}),
    };
  }
}

// Instance globale du cache
const dashboardCache = DashboardCacheManager.getInstance();

// Hook principal qui utilise le singleton
export function useDashboardData(): DashboardHookState {
  console.log("🚀🚀🚀 SINGLETON HOOK CALLED");

  const [state, setState] = useState<DashboardHookState>(() => {
    const initialState = dashboardCache.getState();
    console.log("🎯 SINGLETON INITIAL STATE:", initialState);

    // Déclencher le fetch immédiatement si pas de données
    if (!initialState.data && !initialState.isLoading) {
      console.log("🎯 SINGLETON: Triggering immediate fetch on first call");
      setTimeout(() => {
        dashboardCache.getDashboardData().catch((error) => {
          console.error("🎯 SINGLETON IMMEDIATE FETCH ERROR:", error);
        });
      }, 0);
    }

    return initialState;
  });

  useEffect(() => {
    console.log("🎯 SINGLETON USEEFFECT: Starting");

    // S'abonner aux changements du cache
    const unsubscribe = dashboardCache.addListener(() => {
      const newState = dashboardCache.getState();
      console.log("🔔 SINGLETON LISTENER: State changed", newState);
      setState(newState);
    });

    // Déclencher le fetch si nécessaire (backup au cas où l'immédiat n'a pas marché)
    console.log("🎯 SINGLETON USEEFFECT: Calling getDashboardData");
    dashboardCache.getDashboardData().catch((error) => {
      console.error("🎯 SINGLETON USEEFFECT: Error in getDashboardData", error);
    });

    return () => {
      console.log("🎯 SINGLETON USEEFFECT: Cleanup");
      unsubscribe();
    };
  }, []);

  // Auto-recovery ultra-rapide : réaction quasi-immédiate
  useEffect(() => {
    const checkAndRecover = () => {
      if (!state.isLoading && !state.data) {
        console.log("⚡ ULTRA-FAST RECOVERY: Immediate data reload triggered");
        dashboardCache.forceRefresh();
      }
    };

    // Délai ultra-réduit pour une récupération quasi-instantanée (100ms)
    const timeoutId = setTimeout(checkAndRecover, 100);

    return () => clearTimeout(timeoutId);
  }, [state.isLoading, state.data]);

  console.log("🚀 SINGLETON HOOK STATE:", {
    isLoading: state.isLoading,
    hasData: !!state.data,
    ranges: state.data ? Object.keys(state.data) : [],
  });

  return state;
}

// Hook spécialisé pour extraire les données d'une range spécifique
export function useRangeData(range: string, compareRange?: string) {
  const { data: allData, isLoading, error } = useDashboardData();

  // Mécanisme pour forcer un refresh si les données semblent corrompues ou manquantes
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    // Si on a fini de charger mais qu'on n'a pas de données principales, forcer un refresh
    if (!isLoading && allData && !allData[range]) {
      console.log(
        `🔄 RANGE FORCE REFRESH: Range ${range} missing, triggering refresh`,
      );
      dashboardCache.forceRefresh().then(() => {
        setRefreshTrigger((prev) => prev + 1);
      });
    }
  }, [allData, range, isLoading]);

  return useMemo(() => {
    if (!allData || isLoading) {
      const result = {
        mainData: null,
        compareData: null,
        isLoading,
        error,
      };
      console.log(
        `🔥 SINGLETON RANGE RESULT: useRangeData(${range}) returned:`,
        result,
      );
      return result;
    }

    const mainData = allData[range] || null;
    const compareData = compareRange ? allData[compareRange] || null : null;

    console.log(`📊 SINGLETON RANGE DATA [${range}]:`, {
      mainData,
      compareData,
      hasMain: !!mainData,
      hasCompare: !!compareData,
    });

    const result = {
      mainData,
      compareData,
      isLoading: false,
      error,
    };
    console.log(
      `🔥 SINGLETON RANGE RESULT: useRangeData(${range}) returned:`,
      result,
    );
    return result;
  }, [allData, range, compareRange, isLoading, error, refreshTrigger]);
}

// Fonction utilitaire pour invalider le cache manuellement
export const invalidateDashboardCache = () => {
  dashboardCache.invalidateCache();
};

// Fonction utilitaire pour obtenir les infos du cache
export const getDashboardCacheInfo = () => {
  return dashboardCache.getCacheInfo();
};

// Fonction utilitaire pour forcer un refresh
export const forceDashboardRefresh = () => {
  return dashboardCache.forceRefresh();
};

// Fonction utilitaire pour diagnostique
export const diagnoseDashboardCache = () => {
  const state = dashboardCache.getState();
  const cacheInfo = dashboardCache.getCacheInfo();

  console.log("🔍 DASHBOARD CACHE DIAGNOSIS:", {
    state,
    cacheInfo,
    localStorage:
      typeof window !== "undefined"
        ? localStorage.getItem("dashboard-data-cache")
        : null,
  });

  return { state, cacheInfo };
};
