import { NextRequest, NextResponse } from "next/server";
import connectDB from "../../../lib/db";
import SpaceConfiguration from '@coworking-cafe/database';

/**
 * POST /api/calculate-price
 * Calculate price for a reservation based on space configuration
 */
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { spaceType, reservationType, startTime, endTime, numberOfPeople } =
      body;

    // Validation
    if (!spaceType || !reservationType || !startTime || !endTime) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Get space configuration
    const configuration = await SpaceConfiguration.findOne({
      spaceType,
      isActive: true,
      isDeleted: false,
    });

    if (!configuration) {
      return NextResponse.json(
        { error: "Space configuration not found or inactive" },
        { status: 404 },
      );
    }

    const { pricing, minCapacity, maxCapacity } = configuration;
    const people = numberOfPeople || 1;

    // Validate capacity
    if (people < minCapacity || people > maxCapacity) {
      return NextResponse.json(
        {
          error: `Number of people must be between ${minCapacity} and ${maxCapacity}`,
        },
        { status: 400 },
      );
    }

    let basePrice = 0;
    let duration = 0;
    let extraCharge = 0;
    let applicableTier = null;

    // Calculate based on reservation type
    switch (reservationType) {
      case "hourly": {
        // Calculate hours between start and end time
        const start = new Date(startTime);
        const end = new Date(endTime);
        const durationMs = end.getTime() - start.getTime();
        duration = durationMs / (1000 * 60 * 60); // Convert to hours

        if (duration <= 0) {
          return NextResponse.json(
            { error: "End time must be after start time" },
            { status: 400 },
          );
        }

        basePrice = pricing.hourly * duration;

        // Check for tier-based pricing
        if (pricing.tiers && pricing.tiers.length > 0) {
          // Sort tiers by minPeople to process them in order
          const sortedTiers = [...pricing.tiers].sort(
            (a, b) => a.minPeople - b.minPeople,
          );

          // Find the applicable tier (the last tier where people >= minPeople)
          for (const tier of sortedTiers) {
            if (people >= tier.minPeople) {
              // This tier might apply, but check if we're within its range
              if (people <= tier.maxPeople) {
                // We're within this tier's range - use base rate only
                applicableTier = tier;
                basePrice = tier.hourlyRate * duration;
                extraCharge = 0; // No extra charge within tier range
                break;
              } else if (tier.extraPersonHourly) {
                // We exceed this tier's max - apply base + extras for people beyond maxPeople
                applicableTier = tier;
                basePrice = tier.hourlyRate * duration;
                const extraPeople = people - tier.maxPeople;
                extraCharge = extraPeople * tier.extraPersonHourly * duration;
                // Continue to see if there's a higher tier
              }
            }
          }
        }
        break;
      }

      case "daily": {
        basePrice = pricing.daily;
        duration = 1;

        // Check for tier-based pricing
        if (pricing.tiers && pricing.tiers.length > 0) {
          // Sort tiers by minPeople to process them in order
          const sortedTiers = [...pricing.tiers].sort(
            (a, b) => a.minPeople - b.minPeople,
          );

          // Find the applicable tier (the last tier where people >= minPeople)
          for (const tier of sortedTiers) {
            if (people >= tier.minPeople) {
              // This tier might apply, but check if we're within its range
              if (people <= tier.maxPeople) {
                // We're within this tier's range - use base rate only
                applicableTier = tier;
                basePrice = tier.dailyRate;
                extraCharge = 0; // No extra charge within tier range
                break;
              } else if (tier.extraPersonDaily) {
                // We exceed this tier's max - apply base + extras for people beyond maxPeople
                applicableTier = tier;
                basePrice = tier.dailyRate;
                const extraPeople = people - tier.maxPeople;
                extraCharge = extraPeople * tier.extraPersonDaily;
                // Continue to see if there's a higher tier
              }
            }
          }
        }
        break;
      }

      case "weekly": {
        basePrice = pricing.weekly;
        duration = 7;
        break;
      }

      case "monthly": {
        basePrice = pricing.monthly;
        duration = 30;
        break;
      }

      default:
        return NextResponse.json(
          { error: "Invalid reservation type" },
          { status: 400 },
        );
    }

    // Apply per-person multiplier if configured AND no tiers exist
    let totalPrice = basePrice;
    if (!applicableTier && pricing.perPerson) {
      totalPrice = basePrice * people;
    } else if (applicableTier) {
      totalPrice = basePrice + extraCharge;
    }

    return NextResponse.json({
      success: true,
      data: {
        spaceType,
        reservationType,
        basePrice,
        numberOfPeople: people,
        perPerson: pricing.perPerson,
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
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to calculate price" },
      { status: 500 },
    );
  }
}
