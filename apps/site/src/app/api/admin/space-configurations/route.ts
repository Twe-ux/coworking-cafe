import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';
import { getServerSession } from "next-auth";
import connectDB from "@/lib/db";
import SpaceConfiguration from "@/models/spaceConfiguration";

/**
 * GET /api/admin/space-configurations
 * Get all space configurations
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // TODO: Check if user is admin
    // For now, we'll allow any authenticated user

    await connectDB();

    const configurations = await SpaceConfiguration.find({
      isDeleted: false,
    }).sort({ displayOrder: 1 });

    return NextResponse.json({
      success: true,
      data: configurations,
    });
  } catch (error) {    return NextResponse.json(
      { error: "Failed to fetch configurations" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/space-configurations
 * Create a new space configuration
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();

    const configuration = await SpaceConfiguration.create(body);

    return NextResponse.json(
      {
        success: true,
        data: configuration,
      },
      { status: 201 }
    );
  } catch (error) {    return NextResponse.json(
      { error: "Failed to create configuration" },
      { status: 500 }
    );
  }
}
