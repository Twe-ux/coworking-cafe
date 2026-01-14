"use client";

import { useMemo, useState } from "react";

console.log("🚀🚀🚀 FICHIER use-immediate-reporting.ts CHARGÉ !!! 🚀🚀🚀");

interface ReportingData {
  _id: string;
  TTC: number;
  HT: number;
}

interface ApiResponse {
  success: boolean;
  data: ReportingData;
}

interface HookState {
  data: ReportingData | null;
  isLoading: boolean;
  error: string | null;
}

// Cache global pour éviter les requêtes multiples
const cache = new Map<
  string,
  { data: ReportingData | null; timestamp: number }
>();
const CACHE_DURATION = 30000; // 30 secondes

// Hook principal qui fait le fetch IMMÉDIATEMENT (sans useEffect)
export function useImmediateReporting(range: string): HookState {
  console.log(`🚀🚀🚀 IMMEDIATE HOOK CALLED FOR RANGE: ${range}`);

  const [state, setState] = useState<HookState>({
    data: null,
    isLoading: true,
    error: null,
  });

  // Utilisation de useMemo pour déclencher le fetch au moment de l'appel du hook
  useMemo(() => {
    console.log(`🎯 IMMEDIATE FETCH START FOR RANGE: ${range}`);

    // Vérifier le cache d'abord
    const cacheKey = `reporting-${range}`;
    const cached = cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log(`📦 CACHE HIT for ${range}:`, cached.data);
      setState({
        data: cached.data,
        isLoading: false,
        error: null,
      });
      return;
    }

    // Faire le fetch immédiatement
    const fetchData = async () => {
      try {
        // Construire l'URL correctement pour client/serveur
        const baseUrl =
          typeof window !== "undefined" ? "" : "http://localhost:3000";
        const url = `${baseUrl}/api/reporting?range=${range}`;

        console.log(`🔥 IMMEDIATE FETCH STARTING: ${url}`);

        const response = await fetch(url);
        console.log(`🌐 IMMEDIATE FETCH RESPONSE STATUS: ${response.status}`);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result: ApiResponse = await response.json();
        console.log(`📊 IMMEDIATE FETCH SUCCESS for ${range}:`, result.data);

        // Mettre en cache
        cache.set(cacheKey, {
          data: result.data,
          timestamp: Date.now(),
        });

        setState({
          data: result.data,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        console.error(`❌ IMMEDIATE FETCH ERROR for ${range}:`, error);
        setState({
          data: null,
          isLoading: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    };

    fetchData();
  }, [range]);

  console.log(`🚀 IMMEDIATE HOOK STATE FOR ${range}:`, state);
  return state;
}

// Hook combiné pour les données principales et de comparaison
export function useImmediateReportingData(
  range: string,
  compareRange?: string,
) {
  console.log(
    `📊 IMMEDIATE REPORTING DATA HOOK [${range}] with compare [${compareRange}]`,
  );

  const mainData = useImmediateReporting(range);
  const compareData = compareRange
    ? useImmediateReporting(compareRange)
    : {
        data: null,
        isLoading: false,
        error: null,
      };

  const result = {
    mainData: mainData.data,
    mainLoading: mainData.isLoading,
    mainError: mainData.error,
    compareData: compareData.data,
    compareLoading: compareData.isLoading,
    compareRange,
  };

  console.log(`📊 IMMEDIATE REPORTING DATA [${range}]:`, result);

  return result;
}
