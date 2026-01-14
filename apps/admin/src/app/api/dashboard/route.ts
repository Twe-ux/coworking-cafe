import { NextResponse } from "next/server";
import { connectMongoose } from "@/lib/mongodb";
import Turnover from "@/lib/models/Turnover";

interface RangeData {
  TTC: number;
  HT: number;
}

/**
 * API unifiée pour récupérer toutes les données du dashboard en une seule requête
 * GET /api/dashboard
 */
export async function GET() {
  try {
    await connectMongoose();
    console.log("🚀 API DASHBOARD - Récupération de toutes les données");

    const today = new Date();

    // Fonction helper pour calculer les dates de début et fin
    const calculateDates = (rangeType: string) => {
      const startDate = new Date();
      const endDate = new Date();

      switch (rangeType) {
        case "yesterday":
          startDate.setDate(startDate.getDate() - 1);
          endDate.setDate(endDate.getDate() - 1);
          break;
        case "week":
          if (startDate.getDay() === 0) {
            startDate.setDate(startDate.getDate() - 6);
          } else {
            startDate.setDate(startDate.getDate() - startDate.getDay() + 1);
          }
          break;
        case "month":
          startDate.setDate(1);
          break;
        case "year":
          startDate.setMonth(0, 1);
          break;
        case "customPreviousDay":
          startDate.setDate(startDate.getDate() - 8);
          endDate.setDate(endDate.getDate() - 8);
          break;
        case "customPreviousWeek":
          const currentDayOfWeek = startDate.getDay();
          if (currentDayOfWeek === 1) {
            startDate.setFullYear(1970, 0, 1);
            endDate.setFullYear(1970, 0, 1);
          } else {
            const daysToMondayLastWeek =
              currentDayOfWeek === 0 ? 7 : currentDayOfWeek - 1 + 7;
            startDate.setDate(startDate.getDate() - daysToMondayLastWeek);
            endDate.setDate(endDate.getDate() - 7);
          }
          break;
        case "customPreviousMonth":
          startDate.setMonth(startDate.getMonth() - 1);
          startDate.setDate(1);
          endDate.setMonth(endDate.getMonth() - 1);
          endDate.setDate(
            Math.min(
              today.getDate() - 1,
              new Date(
                endDate.getFullYear(),
                endDate.getMonth() + 1,
                0
              ).getDate()
            )
          );
          break;
        case "customPreviousYear":
          startDate.setFullYear(startDate.getFullYear() - 1);
          startDate.setMonth(0, 1);
          endDate.setFullYear(endDate.getFullYear() - 1);
          endDate.setMonth(today.getMonth(), today.getDate() - 1);
          break;
        case "previousDay":
          startDate.setDate(startDate.getDate() - 8);
          endDate.setDate(endDate.getDate() - 8);
          break;
        case "previousWeek":
          if (startDate.getDay() === 0) {
            startDate.setDate(startDate.getDate() - 13);
            endDate.setDate(endDate.getDate() - endDate.getDay() - 6);
          } else {
            startDate.setDate(startDate.getDate() - startDate.getDay() - 6);
            endDate.setDate(endDate.getDate() - endDate.getDay() + 1);
          }
          break;
        case "previousMonth":
          startDate.setMonth(startDate.getMonth() - 1);
          endDate.setMonth(endDate.getMonth() - 1);
          startDate.setDate(1);
          endDate.setDate(1);
          endDate.setMonth(endDate.getMonth() + 1);
          endDate.setDate(0);
          break;
        case "previousYear":
          startDate.setFullYear(startDate.getFullYear() - 1);
          endDate.setFullYear(endDate.getFullYear() - 1);
          startDate.setMonth(0, 1);
          endDate.setMonth(11, 31);
          break;
      }

      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);

      return {
        startDateString: `${startDate.getFullYear()}/${(
          startDate.getMonth() + 1
        )
          .toString()
          .padStart(2, "0")}/${startDate.getDate().toString().padStart(2, "0")}`,
        endDateString: `${endDate.getFullYear()}/${(endDate.getMonth() + 1)
          .toString()
          .padStart(2, "0")}/${endDate.getDate().toString().padStart(2, "0")}`,
      };
    };

    // Liste de toutes les périodes nécessaires
    const ranges = [
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

    // Créer toutes les requêtes en parallèle
    const aggregationPromises = ranges.map(async (range) => {
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
