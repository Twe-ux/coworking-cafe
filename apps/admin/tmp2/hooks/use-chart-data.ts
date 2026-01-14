"use client";

import type { TurnoverData } from "@/store/reporting/api";
import { useMemo, useState } from "react";

console.log("🚀🚀🚀 FICHIER use-chart-data.ts CHARGÉ !!! 🚀🚀🚀");

interface ApiResponse {
  success: boolean;
  data: TurnoverData[];
}

interface ChartHookState {
  data: TurnoverData[] | null;
  isLoading: boolean;
  error: string | null;
}

// Cache global pour les données du chart
const chartCache = new Map<
  string,
  { data: TurnoverData[] | null; timestamp: number }
>();
const CACHE_DURATION = 30000; // 30 secondes

// Hook pour récupérer les données de turnover pour le chart
export function useChartData(): ChartHookState {
  console.log(`🚀🚀🚀 CHART DATA HOOK CALLED`);

  const [state, setState] = useState<ChartHookState>({
    data: null,
    isLoading: true,
    error: null,
  });

  // Utilisation de useMemo pour déclencher le fetch au moment de l'appel du hook
  useMemo(() => {
    console.log(`🎯 CHART DATA FETCH START`);

    // Vérifier le cache d'abord
    const cacheKey = "chart-turnover-data";
    const cached = chartCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log(`📦 CHART CACHE HIT:`, cached.data?.length, "records");
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
        const url = `${baseUrl}/api/turnover`;

        console.log(`🔥 CHART DATA FETCH STARTING: ${url}`);

        const response = await fetch(url);
        console.log(`🌐 CHART DATA RESPONSE STATUS: ${response.status}`);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result: ApiResponse = await response.json();
        console.log(`📊 CHART DATA SUCCESS:`, result.data?.length, "records");

        // Mettre en cache
        chartCache.set(cacheKey, {
          data: result.data || [],
          timestamp: Date.now(),
        });

        setState({
          data: result.data || [],
          isLoading: false,
          error: null,
        });
      } catch (error) {
        console.error(`❌ CHART DATA ERROR:`, error);
        setState({
          data: null,
          isLoading: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    };

    fetchData();
  }, []);

  console.log(`🚀 CHART DATA HOOK STATE:`, state);
  return state;
}
