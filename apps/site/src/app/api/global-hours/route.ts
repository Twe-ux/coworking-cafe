import { NextResponse } from "next/server";
import connectDB from "../../../lib/db";
import { GlobalHoursConfiguration } from '@coworking-cafe/database';
import { cache24h } from "../../../lib/cache-helpers";

/**
 * GET /api/global-hours
 * Get global hours configuration (public endpoint)
 */
export async function GET() {
  try {
    // Utiliser le cache pour les horaires (changent rarement)
    const getCachedHours = cache24h(
      async () => {
        await connectDB();

        // Get the most recent global hours configuration
        const config = await GlobalHoursConfiguration.findOne().sort({
          createdAt: -1,
        });

        if (!config) {
          throw new Error("No global hours configuration found");
        }

        return config;
      },
      ['global-hours'],
      { tags: ['global-hours'] }
    );

    const config = await getCachedHours();

    return NextResponse.json({
      success: true,
      data: config,
    });
  } catch (error: any) {
    if (error.message === "No global hours configuration found") {
      return NextResponse.json(
        { error: "No global hours configuration found. Please initialize." },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { error: "Failed to fetch global hours configuration" },
      { status: 500 },
    );
  }
}
