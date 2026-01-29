import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/auth";
import { successResponse, errorResponse } from "@/lib/api/response";
import { connectDB } from "@/lib/db";
import { SpaceConfiguration } from "@coworking-cafe/database";

interface CalculateRequest {
  spaceType: string;
  startDate: string;
  endDate: string;
  startTime?: string;
  endTime?: string;
  numberOfPeople: number;
}

/**
 * POST /api/calculate-price
 * Calculate price for a reservation based on space configuration
 * Identical logic to apps/site but adapted for admin context
 */
// Force dynamic rendering (no static analysis at build time)
export const dynamic = 'force-dynamic';
export async function POST(request: NextRequest) {
  try {
    // Auth required for admin booking
    const authResult = await requireAuth(["dev", "admin"]);
    if (!authResult.authorized) {
      return authResult.response;
    }

    await connectDB();

    const body: CalculateRequest = await request.json();
    const { spaceType, startDate, endDate, startTime, endTime, numberOfPeople } = body;

    // Validation
    if (!spaceType || !startDate || !endDate || !numberOfPeople) {
      return errorResponse("Données manquantes", "spaceType, startDate, endDate, numberOfPeople sont requis", 400);
    }

    // Get space configuration
    const configuration = await SpaceConfiguration.findOne({
      spaceType,
      isActive: true,
      isDeleted: false,
    });

    if (!configuration) {
      return errorResponse("Configuration non trouvée", `La configuration pour ${spaceType} n'existe pas ou est inactive`, 404);
    }

    const { pricing, minCapacity, maxCapacity } = configuration;
    const people = numberOfPeople || 1;

    // Validate capacity
    if (people < minCapacity || people > maxCapacity) {
      return errorResponse(
        "Capacité invalide",
        `Le nombre de personnes doit être entre ${minCapacity} et ${maxCapacity}`,
        400
      );
    }

    // Determine reservation type based on date range
    const start = new Date(startDate);
    const end = new Date(endDate);
    const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const numberOfDays = daysDiff + 1; // Inclure le jour de fin

    let basePrice = 0;
    let duration = 0;
    let extraCharge = 0;
    let applicableTier = null;
    let reservationType: "hourly" | "daily" | "weekly" | "monthly";

    // Determine reservation type
    if (daysDiff >= 28) {
      // Réservation mensuelle
      reservationType = "monthly";
      basePrice = pricing.monthly;
      duration = 30;
    } else if (daysDiff >= 7) {
      // Réservation hebdomadaire
      reservationType = "weekly";
      basePrice = pricing.weekly;
      duration = 7;
    } else if (!startTime || !endTime) {
      // Pas d'heures spécifiées = forfait journalier
      reservationType = "daily";
      basePrice = pricing.daily * numberOfDays;
      duration = numberOfDays;
    } else {
      // Heures spécifiées : calculer pour UN jour, puis multiplier par le nombre de jours
      const startDateTime = new Date(`${startDate}T${startTime}`);
      const endDateTime = new Date(`${startDate}T${endTime}`);
      const durationMs = endDateTime.getTime() - startDateTime.getTime();
      const hoursPerDay = durationMs / (1000 * 60 * 60);

      if (hoursPerDay <= 0) {
        return errorResponse("Horaires invalides", "L'heure de fin doit être après l'heure de début", 400);
      }

      // Si > 5h, utiliser le tarif forfait jour au lieu du tarif horaire
      if (hoursPerDay > 5) {
        reservationType = "daily";
        basePrice = pricing.daily * numberOfDays; // Forfait jour × nombre de jours
        duration = numberOfDays;
      } else {
        reservationType = "hourly";
        basePrice = pricing.hourly * hoursPerDay * numberOfDays; // Tarif horaire × heures × jours
        duration = hoursPerDay * numberOfDays;
      }
    }

    // Apply tier-based pricing if applicable
    if (pricing.tiers && pricing.tiers.length > 0 && (reservationType === "hourly" || reservationType === "daily")) {
      const sortedTiers = [...pricing.tiers].sort((a, b) => a.minPeople - b.minPeople);

      for (const tier of sortedTiers) {
        if (people >= tier.minPeople) {
          if (people <= tier.maxPeople) {
            applicableTier = tier;
            if (reservationType === "hourly") {
              basePrice = tier.hourlyRate * duration;
            } else {
              basePrice = tier.dailyRate * duration;
            }
            extraCharge = 0;
            break;
          } else if (reservationType === "hourly" && tier.extraPersonHourly) {
            applicableTier = tier;
            basePrice = tier.hourlyRate * duration;
            const extraPeople = people - tier.maxPeople;
            extraCharge = extraPeople * tier.extraPersonHourly * duration;
          } else if (reservationType === "daily" && tier.extraPersonDaily) {
            applicableTier = tier;
            basePrice = tier.dailyRate * duration;
            const extraPeople = people - tier.maxPeople;
            extraCharge = extraPeople * tier.extraPersonDaily * duration;
          }
        }
      }
    }

    // Calculate total price
    let totalPrice = basePrice;
    if (!applicableTier && pricing.perPerson) {
      totalPrice = basePrice * people;
    } else if (applicableTier) {
      totalPrice = basePrice + extraCharge;
    }

    return successResponse({
      spaceType,
      reservationType,
      startDate,
      endDate,
      startTime: startTime || null,
      endTime: endTime || null,
      numberOfPeople: people,
      basePrice,
      extraCharge,
      totalPrice,
      duration,
      durationUnit:
        reservationType === "hourly"
          ? "hours"
          : reservationType === "daily"
          ? "days"
          : reservationType === "weekly"
          ? "weeks"
          : "months",
      tierApplied: applicableTier ? {
        minPeople: applicableTier.minPeople,
        maxPeople: applicableTier.maxPeople,
        rate: reservationType === "hourly" ? applicableTier.hourlyRate : applicableTier.dailyRate
      } : null
    });
  } catch (error) {
    console.error("POST /api/calculate-price error:", error);
    return errorResponse("Erreur serveur", error instanceof Error ? error.message : "Erreur inconnue", 500);
  }
}
