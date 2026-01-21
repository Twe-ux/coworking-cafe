import { NextRequest, NextResponse } from "next/server";
import connectDB from "../../../../lib/db";
import SpaceConfiguration from "../../../../models/spaceConfiguration";

/**
 * GET /api/space-configurations/[spaceType]
 * Public endpoint to get space configuration (pricing, hours, capacity)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { spaceType: string } },
) {
  try {
    await connectDB();

    const configuration = await SpaceConfiguration.findOne({
      spaceType: params.spaceType,
      isActive: true,
      isDeleted: false,
    });

    if (!configuration) {
      return NextResponse.json(
        { error: "Space configuration not found or inactive" },
        { status: 404 },
      );
    }

    // Return only necessary public information
    return NextResponse.json({
      success: true,
      data: {
        spaceType: configuration.spaceType,
        name: configuration.name,
        slug: configuration.slug,
        description: configuration.description,
        pricing: configuration.pricing,
        availableReservationTypes: configuration.availableReservationTypes,
        requiresQuote: configuration.requiresQuote,
        minCapacity: configuration.minCapacity,
        maxCapacity: configuration.maxCapacity,
        imageUrl: configuration.imageUrl,
        features: configuration.features,
        depositPolicy: configuration.depositPolicy,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch configuration" },
      { status: 500 },
    );
  }
}
