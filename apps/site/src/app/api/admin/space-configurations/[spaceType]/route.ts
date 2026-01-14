import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDB from "@/lib/db";
import SpaceConfiguration from "@/models/spaceConfiguration";

/**
 * GET /api/admin/space-configurations/[spaceType]
 * Get a specific space configuration
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { spaceType: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const configuration = await SpaceConfiguration.findOne({
      spaceType: params.spaceType,
      isDeleted: false,
    });

    if (!configuration) {
      return NextResponse.json(
        { error: "Configuration not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: configuration,
    });
  } catch (error) {    return NextResponse.json(
      { error: "Failed to fetch configuration" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/space-configurations/[spaceType]
 * Update a space configuration
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { spaceType: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();

    const configuration = await SpaceConfiguration.findOneAndUpdate(
      {
        spaceType: params.spaceType,
        isDeleted: false,
      },
      body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!configuration) {
      return NextResponse.json(
        { error: "Configuration not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: configuration,
    });
  } catch (error) {    return NextResponse.json(
      { error: "Failed to update configuration" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/space-configurations/[spaceType]
 * Partially update a space configuration (e.g., only hours)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { spaceType: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();

    const configuration = await SpaceConfiguration.findOneAndUpdate(
      {
        spaceType: params.spaceType,
        isDeleted: false,
      },
      { $set: body },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!configuration) {
      return NextResponse.json(
        { error: "Configuration not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: configuration,
    });
  } catch (error) {    return NextResponse.json(
      { error: "Failed to update configuration" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/space-configurations/[spaceType]
 * Soft delete a space configuration
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { spaceType: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const configuration = await SpaceConfiguration.findOneAndUpdate(
      {
        spaceType: params.spaceType,
        isDeleted: false,
      },
      { isDeleted: true },
      { new: true }
    );

    if (!configuration) {
      return NextResponse.json(
        { error: "Configuration not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Configuration deleted successfully",
    });
  } catch (error) {    return NextResponse.json(
      { error: "Failed to delete configuration" },
      { status: 500 }
    );
  }
}
