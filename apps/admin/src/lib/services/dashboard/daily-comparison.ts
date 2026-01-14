import { NextResponse } from "next/server";
import { connectMongoose } from "@/lib/mongodb";
import Turnover from "@/models/turnover";
import { formatDateForMongoDB } from "./date-utils";
import type { DailyComparisonItem } from "./types";

/**
 * Récupère la comparaison jour par jour entre cette année et l'année précédente
 */
export async function getDailyComparison(days: number) {
  try {
    await connectMongoose();
    console.log(
      `🚀 API DASHBOARD - Comparaison ${days} jours (année vs année -1)`
    );

    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - days);

    // Dates pour cette année
    const thisYearStart = formatDateForMongoDB(startDate);
    const thisYearEnd = formatDateForMongoDB(today);

    // Dates pour l'année précédente (mêmes jours)
    const lastYearStart = new Date(startDate);
    lastYearStart.setFullYear(lastYearStart.getFullYear() - 1);
    const lastYearEnd = new Date(today);
    lastYearEnd.setFullYear(lastYearEnd.getFullYear() - 1);

    const lastYearStartString = formatDateForMongoDB(lastYearStart);
    const lastYearEndString = formatDateForMongoDB(lastYearEnd);

    // Récupérer les données de cette année
    const thisYearData = await Turnover.aggregate([
      {
        $match: {
          _id: {
            $gte: thisYearStart,
            $lte: thisYearEnd,
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
      { $sort: { date: 1 } },
    ]);

    // Récupérer les données de l'année précédente
    const lastYearData = await Turnover.aggregate([
      {
        $match: {
          _id: {
            $gte: lastYearStartString,
            $lte: lastYearEndString,
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
      { $sort: { date: 1 } },
    ]);

    // Créer un mapping par date pour l'année précédente
    const lastYearMap = new Map();
    lastYearData.forEach((entry) => {
      const date = new Date(entry.date.replace(/\//g, "-"));
      const dayMonth = `${date.getMonth() + 1}-${date.getDate()}`;
      lastYearMap.set(dayMonth, entry);
    });

    // Combiner les données
    const dailyComparison: DailyComparisonItem[] = thisYearData.map((entry) => {
      const date = new Date(entry.date.replace(/\//g, "-"));
      const dayMonth = `${date.getMonth() + 1}-${date.getDate()}`;
      const lastYearEntry = lastYearMap.get(dayMonth) || { TTC: 0, HT: 0 };

      return {
        date: entry.date,
        displayDate: `${date.getDate()}/${date.getMonth() + 1}`,
        thisYear: {
          TTC: entry.TTC || 0,
          HT: entry.HT || 0,
        },
        lastYear: {
          TTC: lastYearEntry.TTC || 0,
          HT: lastYearEntry.HT || 0,
        },
      };
    });

    console.log(
      `✅ API DASHBOARD - ${dailyComparison.length} jours récupérés`
    );

    return NextResponse.json(
      {
        success: true,
        data: dailyComparison,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("❌ API DASHBOARD - Erreur comparaison:", errorMessage);
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
