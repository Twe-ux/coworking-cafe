//app/api/reporting/route.ts
import dbConnect from "@/lib/mongodb/dbConnect";
import Turnover from "@/lib/mongodb/models/Turnover";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  await dbConnect();
  const { searchParams } = new URL(request.url);
  const query = Object.fromEntries(searchParams.entries());
  const today = new Date();

  try {
    // Prepare the date range.
    let range;
    const startDate = new Date(); // Start from January 1, 2020
    const endDate = new Date();
    switch (query.range) {
      case "week":
        range = "week";

        if (startDate.getDay() === 0) {
          // If today is Sunday, set startDate to the previous Monday.
          startDate.setDate(startDate.getDate() - 6);
        } else {
          // Set startDate to the previous Monday.
          startDate.setDate(startDate.getDate() - startDate.getDay() + 1);
        }

        break;
      case "previousWeek":
        range = "previousWeek";

        // Set startDate to the last week's Monday.
        if (startDate.getDay() === 0) {
          // If today is Sunday, set startDate to the previous Monday.
          startDate.setDate(startDate.getDate() - 13);
          endDate.setDate(endDate.getDate() - endDate.getDay() - 6);
        } else {
          startDate.setDate(startDate.getDate() - startDate.getDay() - 6); // Set to last week's Monday
          endDate.setDate(endDate.getDate() - endDate.getDay() + 1);
        }
        break;
      case "customPreviousWeek":
        range = "customPreviousWeek";
        if (startDate.getDay() === 0) {
          // If today is Sunday, set startDate to the previous Monday.
          startDate.setDate(startDate.getDate() - 13);
          endDate.setDate(endDate.getDate() - endDate.getDay() - 8); // -8 pour s'arrêter à hier
        } else {
          startDate.setDate(startDate.getDate() - startDate.getDay() - 6); // Lundi précédent
          // Définir le même jour de la semaine précédente -1 (hier)
          endDate.setDate(endDate.getDate() - 8); // -8 au lieu de -7
        }
        break;
      case "month":
        range = "month";
        startDate.setDate(1);
        break;
      case "previousMonth":
        range = "previousMonth";
        startDate.setMonth(startDate.getMonth() - 1);
        endDate.setMonth(endDate.getMonth() - 1);
        startDate.setDate(1);
        endDate.setDate(1);
        endDate.setMonth(endDate.getMonth() + 1);
        endDate.setDate(1); // Set to the last day of the previous month.
        break;
      case "customPreviousMonth":
        range = "customPreviousMonth";
        // Définir le début du mois précédent
        startDate.setMonth(startDate.getMonth() - 1);
        startDate.setDate(1);
        // Définir le même jour que celui d'hier sur le mois précédent
        endDate.setMonth(endDate.getMonth() - 1);
        endDate.setDate(
          Math.min(
            today.getDate() - 1, // -1 pour s'arrêter à hier
            new Date(
              endDate.getFullYear(),
              endDate.getMonth() + 1,
              0,
            ).getDate(),
          ),
        ); // Définir le même jour ou le dernier jour du mois si le jour dépasse
        break;

      case "year":
        range = "year";
        startDate.setMonth(0, 1);
        break;
      case "previousYear":
        range = "previousYear";
        startDate.setFullYear(startDate.getFullYear() - 1);
        endDate.setFullYear(endDate.getFullYear() - 1);
        startDate.setMonth(0, 1);
        endDate.setMonth(11, 31); // Set to the last day of the previous year.
        break;
      case "customPreviousYear":
        range = "customPreviousYear";
        // Définir le début de l'année précédente
        startDate.setFullYear(startDate.getFullYear() - 1);
        startDate.setMonth(0, 1); // Premier jour de l'année précédente
        // Définir le même jour que celui d'hier sur l'année précédente
        endDate.setFullYear(endDate.getFullYear() - 1);
        endDate.setMonth(today.getMonth(), today.getDate() - 1); // -1 pour s'arrêter à hier
        break;

      case "previousDay":
        range = "previousDay";
        // Set to yesterday
        startDate.setDate(startDate.getDate() - 8);
        endDate.setDate(endDate.getDate() - 7);
        break;

      case "customPreviousDay":
        range = "customPreviousDay";
        // Définir le même jour que "yesterday" mais sur la semaine précédente
        startDate.setDate(startDate.getDate() - 8);
        endDate.setDate(endDate.getDate() - 7);
        break;

      default:
        range = "yesterday";
        startDate.setDate(startDate.getDate() - 1);
        break;
    }

    // Move the time to midnight.
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);

    // Convert the dates to match the id format.
    const startDateString = `${startDate.getFullYear()}/${(startDate.getMonth() + 1).toString().padStart(2, "0")}/${startDate.getDate().toString().padStart(2, "0")}`;
    const endDateString = `${endDate.getFullYear()}/${(endDate.getMonth() + 1).toString().padStart(2, "0")}/${endDate.getDate().toString().padStart(2, "0")}`;

    // Aggregate the turnover data.
    const reporting = await Turnover.aggregate([
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
      {
        $sort: {
          _id: -1,
        },
      },
    ]);
    return NextResponse.json(
      { success: true, data: reporting[0] },
      { status: 200 },
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 },
    );
  }
}
