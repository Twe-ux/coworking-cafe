import { NextResponse } from "next/server";
import { connectMongoose } from "@/lib/mongodb";
import Turnover from "@/lib/models/Turnover";
import { calculateDates } from "./date-utils";
import type { RangeData } from "./types";

// Liste de toutes les périodes nécessaires
const RANGES = [
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
] as const;

/**
 * Récupère les données agrégées par période
 */
export async function getAggregatedData() {
  try {
    await connectMongoose();
    console.log("🚀 API DASHBOARD - Récupération de toutes les données");

    // Créer toutes les requêtes en parallèle
    const aggregationPromises = RANGES.map(async (range) => {
      const { startDateString, endDateString } = calculateDates(range);

      const result = await Turnover.aggregate([
        {
          $match: {
            _id: {
              $gte: startDateString,
              $lte: endDateString,
            },
          },
        },
        {
          $project: {
            date: "$_id",
            TTC: {
              $round: [
                {
                  $sum: [
                    "$vat-20.total-ttc",
                    "$vat-10.total-ttc",
                    "$vat-55.total-ttc",
                    "$vat-0.total-ttc",
                  ],
                },
                2,
              ],
            },
            HT: {
              $round: [
                {
                  $sum: [
                    "$vat-20.total-ht",
                    "$vat-10.total-ht",
                    "$vat-55.total-ht",
                    "$vat-0.total-ht",
                  ],
                },
                2,
              ],
            },
          },
        },
        {
          $group: {
            _id: range,
            TTC: { $sum: "$TTC" },
            HT: { $sum: "$HT" },
          },
        },
      ]);

      return {
        range,
        data: result[0] || { _id: range, TTC: 0, HT: 0 },
      };
    });

    // Exécuter toutes les requêtes en parallèle
    const results = await Promise.all(aggregationPromises);

    // Organiser les résultats par range
    const dashboardData: Record<string, RangeData> = {};
    results.forEach(({ range, data }) => {
      dashboardData[range] = {
        TTC: data.TTC || 0,
        HT: data.HT || 0,
      };
    });

    console.log(
      "✅ API DASHBOARD - Toutes les données récupérées:",
      Object.keys(dashboardData)
    );

    return NextResponse.json(
      {
        success: true,
        data: dashboardData,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    console.error("❌ API DASHBOARD - Erreur:", errorMessage);

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
