import { getCacheInfo, invalidateDashboardCache } from "./use-dashboard-data";

// Hook de debug pour le cache
export const useDashboardCacheDebug = () => {
  const getCacheStatus = () => {
    const info = getCacheInfo();
    if (!info) {
      return "Aucun cache trouvé";
    }

    const ageMinutes = Math.round(info.age / (1000 * 60));
    const ageSeconds = Math.round(info.age / 1000);

    return {
      isValid: info.isValid,
      date: info.date,
      age: ageSeconds < 60 ? `${ageSeconds}s` : `${ageMinutes}min`,
      dataKeys: info.dataKeys.length,
      ranges: info.dataKeys,
    };
  };

  const clearCache = () => {
    invalidateDashboardCache();
    console.log("🗑️ CACHE CLEARED: Cache invalidé manuellement");
  };

  return {
    getCacheStatus,
    clearCache,
  };
};

// Fonction utilitaire pour les développeurs
export const logCacheStatus = () => {
  const info = getCacheInfo();
  if (!info) {
    console.log("📦 CACHE STATUS: Aucun cache");
    return;
  }

  const ageMinutes = Math.round(info.age / (1000 * 60));
  console.log("📦 CACHE STATUS:", {
    isValid: info.isValid,
    date: info.date,
    age: `${ageMinutes} minutes`,
    ranges: info.dataKeys.length,
    keys: info.dataKeys,
  });
};

// Log automatique en développement
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  // Log le statut du cache toutes les 30 secondes en développement
  setInterval(logCacheStatus, 30000);
}
