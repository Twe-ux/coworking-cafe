import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import SpaceConfiguration from "@/models/spaceConfiguration";

/**
 * GET /api/space-configurations
 * Public endpoint to get all active space configurations
 */
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const configurations = await SpaceConfiguration.find({
      isActive: true,
      isDeleted: false,
    }).sort({ displayOrder: 1 });

    // Return only necessary public information
    const publicData = configurations.map((config) => ({
      spaceType: config.spaceType,
      name: config.name,
      slug: config.slug,
      description: config.description,
      pricing: config.pricing,
      availableReservationTypes: config.availableReservationTypes,
      requiresQuote: config.requiresQuote,
      minCapacity: config.minCapacity,
      maxCapacity: config.maxCapacity,
      imageUrl: config.imageUrl,
      displayOrder: config.displayOrder,
      features: config.features,
    }));

    return NextResponse.json({
      success: true,
      data: publicData,
    });
  } catch (error) {    return NextResponse.json(
      { error: "Failed to fetch configurations" },
      { status: 500 }
    );
  }
}
