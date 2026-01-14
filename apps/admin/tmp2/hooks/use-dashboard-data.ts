"use client";

import { useEffect, useMemo, useState } from "react";

// Types pour le cache
interface CacheData {
  data: Record<string, RangeData>;
  timestamp: number;
  date: string; // Format YYYY-MM-DD pour validation jour suivant
}

// Utilitaires de cache
const CACHE_KEY = "dashboard-data-cache";

const getCacheData = (): CacheData | null => {
  if (typeof window === "undefined") return null;

  try {
    const cached = localStorage.getItem(CACHE_KEY);
    return cached ? JSON.parse(cached) : null;
  } catch (error) {
    console.warn("📦 CACHE ERROR: Failed to read cache", error);
    return null;
  }
};

const setCacheData = (data: Record<string, RangeData>) => {
  if (typeof window === "undefined") return;

  try {
    const cacheData: CacheData = {
      data,
      timestamp: Date.now(),
      date: new Date().toISOString().split("T")[0], // YYYY-MM-DD
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
  } catch (error) {
    console.warn("📦 CACHE ERROR: Failed to set cache", error);
  }
};

// Configuration du cache
const CACHE_CONFIG = {
  // En développement: 5 minutes
  // En production: invalider seulement le jour suivant
  maxAge:
    process.env.NODE_ENV === "development"
      ? 5 * 60 * 1000
      : 24 * 60 * 60 * 1000,
  key: "dashboard-data-cache",
};

// Fonction pour invalider le cache manuellement
export const invalidateDashboardCache = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem(CACHE_CONFIG.key);
  }
};

// Fonction pour obtenir les infos du cache
export const getCacheInfo = () => {
  const cached = getCacheData();
  if (!cached) return null;

  return {
    age: Date.now() - cached.timestamp,
    date: cached.date,
    isValid: isCacheValid(cached),
    dataKeys: Object.keys(cached.data || {}),
  };
};

// Mettre à jour la configuration du cache
const updateCacheConfig = () => {
  const currentDate = new Date().toISOString().split("T")[0];
  const cacheAge = Date.now() - (getCacheData()?.timestamp || 0);

  // En production: cache plus long, invalider seulement au changement de jour
  const maxAge =
    process.env.NODE_ENV === "development"
      ? 5 * 60 * 1000 // 5 minutes en dev
      : 24 * 60 * 60 * 1000; // 24h en prod

  return { maxAge, currentDate };
};

const isCacheValid = (cacheData: CacheData): boolean => {
  const { maxAge, currentDate } = updateCacheConfig();
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

  return true;
};

interface RangeData {
  _id: string;
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

// Cache global en mémoire pour éviter les requêtes multiples
let globalDashboardData: Record<string, RangeData> | null = null;
let globalIsLoading = false;
let globalError: string | null = null;
let globalPromise: Promise<void> | null = null;

// Hook principal qui récupère TOUTES les données dashboard en une seule requête
export function useDashboardData(): DashboardHookState {
  console.log(`🚀🚀🚀 DASHBOARD DATA HOOK CALLED`);

  const [state, setState] = useState<DashboardHookState>(() => {
    // D'abord vérifier le cache global en mémoire
    if (globalDashboardData) {
      console.log(
        `📦 DASHBOARD GLOBAL CACHE HIT:`,
        Object.keys(globalDashboardData),
      );
      return {
        data: globalDashboardData,
        isLoading: false,
        error: globalError,
      };
    }

    // Puis vérifier le cache localStorage
    const cachedData = getCacheData();
    if (cachedData && isCacheValid(cachedData)) {
      console.log(
        `📦 DASHBOARD LOCALSTORAGE CACHE HIT:`,
        Object.keys(cachedData.data || {}),
      );
      globalDashboardData = cachedData.data;
      globalIsLoading = false;
      globalError = null;
      return {
        data: cachedData.data,
        isLoading: false,
        error: null,
      };
    }

    // Si une requête est en cours, indiquer le loading
    if (globalIsLoading) {
      console.log(`🔄 DASHBOARD FETCH IN PROGRESS - WAITING`);
      return {
        data: null,
        isLoading: true,
        error: null,
      };
    }

    return {
      data: null,
      isLoading: true,
      error: null,
    };
  });

  // Utilisation de useEffect pour gérer le cache et le fetch - seulement si nécessaire
  useEffect(() => {
    console.log(`🎯 DASHBOARD DATA FETCH START`);

    // Si on a déjà les données en mémoire, pas besoin de refetch
    if (globalDashboardData) {
      console.log(`📦 DASHBOARD GLOBAL DATA ALREADY AVAILABLE`);
      setState({
        data: globalDashboardData,
        isLoading: false,
        error: globalError,
      });
      return;
    }

    // Si une requête est déjà en cours, attendre sa completion
    if (globalIsLoading && globalPromise) {
      console.log(`🔄 DASHBOARD FETCH ALREADY IN PROGRESS - JOINING`);
      globalPromise.then(() => {
        setState({
          data: globalDashboardData,
          isLoading: false,
          error: globalError,
        });
      });
      return;
    }

    // Vérifier le cache local storage une dernière fois
    const cachedData = getCacheData();
    if (cachedData && isCacheValid(cachedData)) {
      console.log(
        `📦 DASHBOARD CACHE HIT IN EFFECT:`,
        Object.keys(cachedData.data || {}),
      );
      globalDashboardData = cachedData.data;
      globalIsLoading = false;
      globalError = null;
      setState({
        data: cachedData.data,
        isLoading: false,
        error: null,
      });
      return;
    }

    // Si pas de cache valide, faire le fetch UNE SEULE FOIS
    const fetchData = async () => {
      try {
        globalIsLoading = true;

        // Construire l'URL correctement pour client/serveur
        const baseUrl =
          typeof window !== "undefined" ? "" : "http://localhost:3000";
        const url = `${baseUrl}/api/dashboard`;

        console.log(`🔥 DASHBOARD DATA FETCH STARTING: ${url}`);

        const response = await fetch(url);
        console.log(`🌐 DASHBOARD DATA RESPONSE STATUS: ${response.status}`);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result: DashboardApiResponse = await response.json();
        console.log(
          `📊 DASHBOARD DATA SUCCESS - Ranges loaded:`,
          Object.keys(result.data),
        );

        // Mettre en cache dans localStorage ET en mémoire globale
        setCacheData(result.data);
        globalDashboardData = result.data;
        globalIsLoading = false;
        globalError = null;

        setState({
          data: result.data,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        console.error(`❌ DASHBOARD DATA ERROR:`, error);

        globalIsLoading = false;
        globalError = errorMessage;

        setState({
          data: null,
          isLoading: false,
          error: errorMessage,
        });
      }
    };

    // Créer la promesse globale pour que d'autres instances puissent l'attendre
    globalPromise = fetchData();
  }, []); // Dépendance vide pour ne fetch qu'une seule fois

  console.log(`🚀 DASHBOARD DATA HOOK STATE:`, {
    isLoading: state.isLoading,
    hasData: !!state.data,
    ranges: state.data ? Object.keys(state.data) : [],
  });

  return state;
}

// Hook spécialisé pour extraire les données d'une range spécifique
export function useRangeData(range: string, compareRange?: string) {
  const { data: allData, isLoading, error } = useDashboardData();

  return useMemo(() => {
    if (!allData || isLoading) {
      const result = {
        mainData: null,
        compareData: null,
        isLoading,
        error,
      };
      console.log(`🔥 HOOK RESULT: useRangeData(${range}) returned:`, result);
      return result;
    }

    const mainData = allData[range] || null;
    const compareData = compareRange ? allData[compareRange] || null : null;

    console.log(`📊 RANGE DATA [${range}]:`, { mainData, compareData });

    const result = {
      mainData,
      compareData,
      isLoading: false,
      error,
    };
    console.log(`🔥 HOOK RESULT: useRangeData(${range}) returned:`, result);
    return result;
  }, [allData, range, compareRange, isLoading, error]);
}
