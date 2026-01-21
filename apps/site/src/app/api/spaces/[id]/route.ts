import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "../../../../lib/mongodb";
import Space from "../../../../models/space";
import {
  getAuthUser,
  requireAuth,
  handleApiError,
  generateSlug,
} from "../../../../lib/api-helpers";
import mongoose from "mongoose";

// Force dynamic rendering
export const dynamic = "force-dynamic";

/**
 * GET /api/spaces/[id]
 * Get space details by ID or slug
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    await connectDB();

    const { id } = params;

    // Check if ID is a valid MongoDB ObjectId or a slug
    const isObjectId = mongoose.Types.ObjectId.isValid(id);
    const query = isObjectId ? { _id: id } : { slug: id };

    const space = await Space.findOne(query).lean();

    if (!space) {
      return NextResponse.json(
        { success: false, error: "Space not found" },
        { status: 404 },
      );
    }

    // Check if user is admin/staff to see inactive spaces
    const user = await getAuthUser();
    const isAdminOrStaff =
      user && ["admin", "staff", "dev"].includes(user.role?.slug || "");

    // Hide inactive spaces from non-admin users
    if (!isAdminOrStaff && (!space.isActive || space.isDeleted)) {
      return NextResponse.json(
        { success: false, error: "Space not found" },
        { status: 404 },
      );
    }

    // Increment view count (fire and forget)
    Space.findByIdAndUpdate(space._id, { $inc: { viewCount: 1 } })
      .exec()
      .catch(() => {});

    return NextResponse.json({
      success: true,
      data: space,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * PATCH /api/spaces/[id]
 * Update space details (admin only)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    await connectDB();

    // Check authentication and admin role
    const user = await requireAuth();
    if (!user || !["admin", "dev"].includes(user.role?.slug || "")) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin access required." },
        { status: 403 },
      );
    }

    const { id } = params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid space ID" },
        { status: 400 },
      );
    }

    const space = await Space.findById(id);

    if (!space) {
      return NextResponse.json(
        { success: false, error: "Space not found" },
        { status: 404 },
      );
    }

    const body = await request.json();

    // Validate type if provided
    if (body.type) {
      const validTypes = [
        "desk",
        "meeting-room",
        "private-office",
        "event-space",
      ];
      if (!validTypes.includes(body.type)) {
        return NextResponse.json(
          {
            success: false,
            error: `Invalid type. Must be one of: ${validTypes.join(", ")}`,
          },
          { status: 400 },
        );
      }
    }

    // Validate capacity if provided
    if (body.capacity !== undefined) {
      if (body.capacity < 1 || body.capacity > 100) {
        return NextResponse.json(
          { success: false, error: "Capacity must be between 1 and 100" },
          { status: 400 },
        );
      }
    }

    // Update slug if name changed
    if (body.name && body.name !== space.name) {
      const newSlug = body.slug || generateSlug(body.name);

      // Check if new slug already exists
      const existingSpace = await Space.findOne({
        slug: newSlug,
        _id: { $ne: id },
      });
      if (existingSpace) {
        return NextResponse.json(
          { success: false, error: "A space with this slug already exists" },
          { status: 409 },
        );
      }

      body.slug = newSlug;
    }

    // Update allowed fields
    const allowedFields = [
      "name",
      "slug",
      "description",
      "type",
      "capacity",
      "pricing",
      "floor",
      "building",
      "amenities",
      "images",
      "featuredImage",
      "availability",
      "isActive",
    ];

    allowedFields.forEach((field) => {
      if (body[field] !== undefined) {
        (space as unknown as Record<string, unknown>)[field] = body[field];
      }
    });

    await space.save();

    return NextResponse.json({
      success: true,
      data: space,
      message: "Space updated successfully",
    });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * DELETE /api/spaces/[id]
 * Soft delete a space (admin only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    await connectDB();

    // Check authentication and admin role
    const user = await requireAuth();
    if (!user || !["admin", "dev"].includes(user.role?.slug || "")) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin access required." },
        { status: 403 },
      );
    }

    const { id } = params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid space ID" },
        { status: 400 },
      );
    }

    const space = await Space.findById(id);

    if (!space) {
      return NextResponse.json(
        { success: false, error: "Space not found" },
        { status: 404 },
      );
    }

    // Check for permanent delete flag
    const { searchParams } = new URL(request.url);
    const permanent = searchParams.get("permanent") === "true";

    if (permanent) {
      // Permanent delete (hard delete)
      await Space.findByIdAndDelete(id);

      return NextResponse.json({
        success: true,
        message: "Space permanently deleted",
      });
    } else {
      // Soft delete
      space.isDeleted = true;
      space.deletedAt = new Date();
      space.isActive = false;
      await space.save();

      return NextResponse.json({
        success: true,
        message: "Space deleted successfully",
      });
    }
  } catch (error) {
    return handleApiError(error);
  }
}
