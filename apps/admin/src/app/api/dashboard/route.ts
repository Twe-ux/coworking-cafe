import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { getDailyComparison } from "@/lib/services/dashboard/daily-comparison";
import { getAggregatedData } from "@/lib/services/dashboard/aggregated-data";

/**
 * API unifiée pour récupérer toutes les données du dashboard en une seule requête
 * GET /api/dashboard?days=7 (optional: pour la comparaison jour par jour)
 */
export async function GET(request: Request) {
  try {
    // Vérification d'authentification
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Non authentifié" },
        { status: 401 }
      );
    }

    // Vérification des permissions (dev ou admin uniquement)
    const userRole = (session?.user as any)?.role;
    if (!["dev", "admin"].includes(userRole)) {
      return NextResponse.json(
        { success: false, error: "Permissions insuffisantes" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const daysParam = searchParams.get("days");

    // Si days est spécifié, retourner la comparaison jour par jour
    if (daysParam) {
      return getDailyComparison(parseInt(daysParam));
    }

    // Sinon, retourner les données agrégées par période
    return getAggregatedData();
  } catch (error) {
    console.error("Erreur API /api/dashboard:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Erreur lors de la récupération des données du dashboard",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
