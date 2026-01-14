//app/api/dashboard/route.ts
import dbConnect from "@/lib/mongodb/dbConnect";
import Turnover from "@/lib/mongodb/models/Turnover";
import { NextResponse } from "next/server";

/**
 * API unifiée pour récupérer toutes les données du dashboard en une seule requête
 */
export async function GET() {
  await dbConnect();
  try {
    const today = new Date();
    console.log("🚀 API DASHBOARD - Récupération de toutes les données");

    // Fonction helper pour calculer les dates
    const calculateDates = (rangeType: string) => {
      const startDate = new Date();
      const endDate = new Date();

      switch (rangeType) {
        case "yesterday":
          startDate.setDate(startDate.getDate() - 1);
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
          endDate.setDate(endDate.getDate() - 7);
          break;
        case "customPreviousWeek":
          // Début : Lundi de la semaine précédente
          const currentDayOfWeek = startDate.getDay(); // 0 = dimanche, 1 = lundi, etc.

          if (currentDayOfWeek === 1) {
            // Lundi : pas de données
            // Retourner des dates qui ne matchent aucune donnée
            startDate.setFullYear(1970, 0, 1); // Date très ancienne
            endDate.setFullYear(1970, 0, 1);
          } else {
            // Mardi au Dimanche : semaine précédente du lundi jusqu'à la veille d'aujourd'hui
            // Début : Lundi de la semaine précédente
            const daysToMondayLastWeek =
              currentDayOfWeek === 0 ? 7 : currentDayOfWeek - 1 + 7; // Gérer dimanche (0) et autres jours
            startDate.setDate(startDate.getDate() - daysToMondayLastWeek);
            // Fin : Même jour de la semaine précédente (pour inclure jusqu'à la veille d'aujourd'hui de la semaine précédente)
            endDate.setDate(endDate.getDate() - 7); // Aujourd'hui, mais semaine précédente
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
                0,
              ).getDate(),
            ),
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
          endDate.setDate(endDate.getDate() - 7);
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
          endDate.setDate(1);
          break;
        case "previousYear":
          startDate.setFullYear(startDate.getFullYear() - 1);
          endDate.setFullYear(endDate.getFullYear() - 1);
          startDate.setMonth(0, 1);
          endDate.setMonth(11, 31);
          break;
      }

      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(0, 0, 0, 0);

      return {
        startDateString: `${startDate.getFullYear()}/${(startDate.getMonth() + 1).toString().padStart(2, "0")}/${startDate.getDate().toString().padStart(2, "0")}`,
        endDateString: `${endDate.getFullYear()}/${(endDate.getMonth() + 1).toString().padStart(2, "0")}/${endDate.getDate().toString().padStart(2, "0")}`,
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
              $lt: endDateString,
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
    const dashboardData: any = {};
    results.forEach(({ range, data }) => {
      dashboardData[range] = data;
    });

    console.log(
      "✅ API DASHBOARD - Toutes les données récupérées:",
      Object.keys(dashboardData),
    );

    return NextResponse.json(
      {
        success: true,
        data: dashboardData,
        timestamp: new Date().toISOString(),
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("❌ API DASHBOARD - Erreur:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 },
    );
  }
}
