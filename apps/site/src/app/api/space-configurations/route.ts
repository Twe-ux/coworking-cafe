import { NextRequest, NextResponse } from "next/server";
import connectDB from "../../../lib/db";
import { SpaceConfiguration } from '@coworking-cafe/database';

/**
 * GET /api/space-configurations
 * Public endpoint to get all active space configurations
 */

// Force dynamic rendering (no static analysis at build time)
export const dynamic = 'force-dynamic';
export async function GET(request: NextRequest) {
  try {
    console.log("[API] Fetching space configurations...");
    await connectDB();
    console.log("[API] Database connected");

    const configurations = await SpaceConfiguration.find({
      isActive: true,
      isDeleted: false,
    }).sort({ displayOrder: 1 });
    console.log("[API] Found configurations:", configurations.length);

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
  } catch (error) {
    console.error("[API] Error fetching configurations:", error);
    return NextResponse.json(
      { error: "Failed to fetch configurations" },
      { status: 500 },
    );
  }
}
