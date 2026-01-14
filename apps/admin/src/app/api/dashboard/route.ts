import { getDailyComparison } from "@/lib/services/dashboard/daily-comparison";
import { getAggregatedData } from "@/lib/services/dashboard/aggregated-data";

/**
 * API unifiée pour récupérer toutes les données du dashboard en une seule requête
 * GET /api/dashboard?days=7 (optional: pour la comparaison jour par jour)
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const daysParam = searchParams.get("days");

  // Si days est spécifié, retourner la comparaison jour par jour
  if (daysParam) {
    return getDailyComparison(parseInt(daysParam));
  }

  // Sinon, retourner les données agrégées par période
  return getAggregatedData();
}
