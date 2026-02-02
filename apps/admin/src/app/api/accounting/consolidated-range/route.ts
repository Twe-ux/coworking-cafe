import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/auth";
import { successResponse, errorResponse } from "@/lib/api/response";
import { connectMongoose } from "@/lib/mongodb";
import Turnover from "@/models/turnover";
import { B2BRevenue } from "@/models/b2bRevenue";
import type { ConsolidatedDailyRevenue, TurnoverData } from "@/types/accounting";

interface RangeStats {
  turnovers: { ht: number; ttc: number; tva: number };
  b2b: { ht: number; ttc: number; tva: number };
  total: { ht: number; ttc: number; tva: number };
  dailyAverage: { ht: number; ttc: number };
  daysCount: number;
}

interface ConsolidatedRangeResponse {
  dailyData: ConsolidatedDailyRevenue[];
  stats: RangeStats;
}

/**
 * GET /api/accounting/consolidated-range
 * Récupère les données consolidées (Turnovers + B2B) sur une période définie
 *
 * Query params:
 * - startDate: YYYY-MM-DD (requis)
 * - endDate: YYYY-MM-DD (requis)
 */
export async function GET(
  request: NextRequest
): Promise<NextResponse<{ success: boolean; data?: ConsolidatedRangeResponse; error?: string }>> {
  // Auth
  const authResult = await requireAuth(["dev", "admin", "staff"]);
  if (!authResult.authorized) {
    return authResult.response;
  }

  // DB Connection
  await connectMongoose();

  // Query params
  const searchParams = request.nextUrl.searchParams;
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");

  // Validation
  if (!startDate || !endDate) {
    return errorResponse(
      "Paramètres manquants",
      "startDate et endDate sont requis (format YYYY-MM-DD)",
      400
    );
  }

  // Valider format YYYY-MM-DD
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
    return errorResponse(
      "Format de date invalide",
      "Les dates doivent être au format YYYY-MM-DD",
      400
    );
  }

  // Vérifier que startDate <= endDate
  if (new Date(startDate) > new Date(endDate)) {
    return errorResponse(
      "Période invalide",
      "La date de début doit être antérieure ou égale à la date de fin",
      400
    );
  }

  try {
    // Fetch turnovers
    const turnovers = await Turnover.find({
      date: {
        $gte: startDate,
        $lte: endDate,
      },
    }).lean();

    // Fetch B2B revenues
    const b2bRevenues = await B2BRevenue.find({
      date: {
        $gte: startDate,
        $lte: endDate,
      },
    }).lean();

    // Consolider les données par jour
    const dataMap = new Map<string, ConsolidatedDailyRevenue>();

    // Ajouter les turnovers
    turnovers.forEach((turnover) => {
      // Gérer les deux formats possibles (_id ou date)
      const t = turnover as any;
      const rawDate = t.date || t._id || "";
      const date = rawDate.replace(/\//g, "-"); // YYYY/MM/DD → YYYY-MM-DD

      if (!date) return;

      const d = new Date(date);
      if (isNaN(d.getTime())) return;

      dataMap.set(date, {
        date,
        turnovers: {
          ht: t.HT || 0,
          ttc: t.TTC || 0,
          tva: t.TVA || 0,
        },
        b2b: {
          ht: 0,
          ttc: 0,
          tva: 0,
        },
        total: {
          ht: t.HT || 0,
          ttc: t.TTC || 0,
          tva: t.TVA || 0,
        },
      });
    });

    // Ajouter les B2B revenues
    b2bRevenues.forEach((b2b) => {
      const date = b2b.date;
      const existing = dataMap.get(date);

      if (existing) {
        // Merge avec turnover existant
        existing.b2b = {
          ht: b2b.ht || 0,
          ttc: b2b.ttc || 0,
          tva: b2b.tva || 0,
        };
        existing.total = {
          ht: existing.turnovers.ht + (b2b.ht || 0),
          ttc: existing.turnovers.ttc + (b2b.ttc || 0),
          tva: existing.turnovers.tva + (b2b.tva || 0),
        };
      } else {
        // Créer nouvelle entrée (jour sans turnover)
        dataMap.set(date, {
          date,
          turnovers: {
            ht: 0,
            ttc: 0,
            tva: 0,
          },
          b2b: {
            ht: b2b.ht || 0,
            ttc: b2b.ttc || 0,
            tva: b2b.tva || 0,
          },
          total: {
            ht: b2b.ht || 0,
            ttc: b2b.ttc || 0,
            tva: b2b.tva || 0,
          },
        });
      }
    });

    // Convertir en tableau et trier par date
    const dailyData = Array.from(dataMap.values()).sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Calculer les stats agrégées
    const stats: RangeStats = {
      turnovers: { ht: 0, ttc: 0, tva: 0 },
      b2b: { ht: 0, ttc: 0, tva: 0 },
      total: { ht: 0, ttc: 0, tva: 0 },
      dailyAverage: { ht: 0, ttc: 0 },
      daysCount: dailyData.length,
    };

    dailyData.forEach((day) => {
      stats.turnovers.ht += day.turnovers.ht;
      stats.turnovers.ttc += day.turnovers.ttc;
      stats.turnovers.tva += day.turnovers.tva;

      stats.b2b.ht += day.b2b.ht;
      stats.b2b.ttc += day.b2b.ttc;
      stats.b2b.tva += day.b2b.tva;

      stats.total.ht += day.total.ht;
      stats.total.ttc += day.total.ttc;
      stats.total.tva += day.total.tva;
    });

    // Calculer moyenne journalière
    if (stats.daysCount > 0) {
      stats.dailyAverage.ht = stats.total.ht / stats.daysCount;
      stats.dailyAverage.ttc = stats.total.ttc / stats.daysCount;
    }

    return successResponse<ConsolidatedRangeResponse>({
      dailyData,
      stats,
    });
  } catch (error) {
    console.error("GET /api/accounting/consolidated-range error:", error);
    return errorResponse(
      "Erreur lors de la récupération des données",
      error instanceof Error ? error.message : "Erreur inconnue"
    );
  }
}
