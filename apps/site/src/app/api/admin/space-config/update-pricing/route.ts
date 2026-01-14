import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';
import { getServerSession } from "next-auth";
import { options } from "@/lib/auth-options";
import connectDB from "@/lib/db";
import SpaceConfiguration from "@/models/spaceConfiguration";
import { logger } from "@/lib/logger";

/**
 * POST /api/admin/space-config/update-pricing
 * Update space configurations with new pricing rules
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(options);

    if (!session?.user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    // Check if user is admin or higher (level >= 80)
    if (session.user.role.level < 80) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    await connectDB();

    // Open-space: Prix horaire à la personne, si plus de 5h -> 29€ max par personne
    await SpaceConfiguration.findOneAndUpdate(
      { spaceType: "open-space" },
      {
        $set: {
          "pricing.hourly": 6,
          "pricing.daily": 0,
          "pricing.weekly": 0,
          "pricing.monthly": 0,
          "pricing.perPerson": true,
          "pricing.maxHoursBeforeDaily": 5,
          "pricing.dailyRatePerPerson": 29,
          "pricing.tiers": [],
          requiresQuote: false,
        },
      },
      { upsert: false }
    );
    logger.info("Updated open-space pricing");

    // Verriere: 1-4 pers: 24€/h, si pers sup: +6€/h | Journée: 120€ (1-4), +30€ per extra
    await SpaceConfiguration.findOneAndUpdate(
      { spaceType: "salle-verriere" },
      {
        $set: {
          "pricing.hourly": 0,
          "pricing.daily": 0,
          "pricing.weekly": 0,
          "pricing.monthly": 0,
          "pricing.perPerson": false,
          "pricing.maxHoursBeforeDaily": undefined,
          "pricing.dailyRatePerPerson": undefined,
          "pricing.tiers": [
            {
              minPeople: 1,
              maxPeople: 4,
              hourlyRate: 24,
              dailyRate: 120,
              extraPersonHourly: 6,
              extraPersonDaily: 30,
            },
          ],
          requiresQuote: false,
        },
      },
      { upsert: false }
    );
    logger.info("Updated salle-verriere pricing");

    // Etage: 1-10 pers: 60€/h, +6€/h per extra | Journée: 300€, +30€ per extra
    await SpaceConfiguration.findOneAndUpdate(
      { spaceType: "salle-etage" },
      {
        $set: {
          "pricing.hourly": 0,
          "pricing.daily": 0,
          "pricing.weekly": 0,
          "pricing.monthly": 0,
          "pricing.perPerson": false,
          "pricing.maxHoursBeforeDaily": undefined,
          "pricing.dailyRatePerPerson": undefined,
          "pricing.tiers": [
            {
              minPeople: 1,
              maxPeople: 10,
              hourlyRate: 60,
              dailyRate: 300,
              extraPersonHourly: 6,
              extraPersonDaily: 30,
            },
          ],
          requiresQuote: false,
        },
      },
      { upsert: false }
    );
    logger.info("Updated salle-etage pricing");

    // Evenementiel: Sur devis
    await SpaceConfiguration.findOneAndUpdate(
      { spaceType: "evenementiel" },
      {
        $set: {
          "pricing.hourly": 0,
          "pricing.daily": 0,
          "pricing.weekly": 0,
          "pricing.monthly": 0,
          "pricing.perPerson": false,
          "pricing.maxHoursBeforeDaily": undefined,
          "pricing.dailyRatePerPerson": undefined,
          "pricing.tiers": [],
          requiresQuote: true,
        },
      },
      { upsert: false }
    );
    logger.info("Updated evenementiel to quote-based");

    return NextResponse.json({
      success: true,
      message: "Toutes les configurations de prix ont été mises à jour avec succès",
    });
  } catch (error) {
    logger.error("Error updating space pricing", {
      component: "API /admin/space-config/update-pricing",
      data: error,
    });
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour des configurations" },
      { status: 500 }
    );
  }
}
