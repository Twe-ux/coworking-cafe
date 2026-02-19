import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/auth";
import { successResponse, errorResponse } from "@/lib/api/response";
import { connectDB } from "@/lib/db";
import { Event } from "@coworking-cafe/database";
import { eventSchema } from "@/lib/validations/event";
import type { EventInput } from "@/lib/validations/event";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

/**
 * GET /api/events/[id]
 * Get event details by ID
 * Auth: dev, admin
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await requireAuth(["dev", "admin"]);
  if (!authResult.authorized) {
    return authResult.response;
  }

  try {
    await connectDB();

    const { id } = params;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse("Invalid event ID", "The provided ID is not valid", 400);
    }

    const event = await Event.findById(id)
      .populate("createdBy", "givenName familyName email")
      .lean();

    if (!event) {
      return errorResponse("Event not found", "No event found with this ID", 404);
    }

    return successResponse(event, "Event retrieved successfully");
  } catch (error) {
    console.error(`[API] GET /api/events/${params.id} error:`, error);
    return errorResponse(
      "Failed to retrieve event",
      error instanceof Error ? error.message : "Unknown error",
      500
    );
  }
}

/**
 * PATCH /api/events/[id]
 * Update an event
 * Auth: dev, admin
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await requireAuth(["dev", "admin"]);
  if (!authResult.authorized) {
    return authResult.response;
  }

  try {
    await connectDB();

    const { id } = params;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse("Invalid event ID", "The provided ID is not valid", 400);
    }

    const body = await request.json();

    // Validate input (partial update allowed)
    const validationResult = eventSchema.partial().safeParse(body);

    if (!validationResult.success) {
      return errorResponse(
        "Validation failed",
        validationResult.error.issues.map((e: any) => `${e.path.join(".")}: ${e.message}`).join(", "),
        400
      );
    }

    const updateData: Partial<EventInput> = validationResult.data;

    // Check if slug change conflicts with existing event
    if (updateData.slug) {
      const existingEvent = await Event.findOne({
        slug: updateData.slug,
        _id: { $ne: id },
      });

      if (existingEvent) {
        return errorResponse(
          "Slug already exists",
          "Another event with this slug already exists. Please choose a different slug.",
          409
        );
      }
    }

    // Update event
    const event = await Event.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate("createdBy", "givenName familyName email");

    if (!event) {
      return errorResponse("Event not found", "No event found with this ID", 404);
    }

    return successResponse(event, "Event updated successfully");
  } catch (error) {
    console.error(`[API] PATCH /api/events/${params.id} error:`, error);

    // Handle duplicate slug error from MongoDB
    if (error instanceof Error && error.message.includes("duplicate key")) {
      return errorResponse(
        "Slug already exists",
        "Another event with this slug already exists. Please choose a different slug.",
        409
      );
    }

    return errorResponse(
      "Failed to update event",
      error instanceof Error ? error.message : "Unknown error",
      500
    );
  }
}

/**
 * DELETE /api/events/[id]
 * Delete an event
 * Auth: dev, admin
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await requireAuth(["dev", "admin"]);
  if (!authResult.authorized) {
    return authResult.response;
  }

  try {
    await connectDB();

    const { id } = params;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse("Invalid event ID", "The provided ID is not valid", 400);
    }

    const event = await Event.findByIdAndDelete(id);

    if (!event) {
      return errorResponse("Event not found", "No event found with this ID", 404);
    }

    return successResponse(
      { id: event._id, title: event.title },
      "Event deleted successfully"
    );
  } catch (error) {
    console.error(`[API] DELETE /api/events/${params.id} error:`, error);
    return errorResponse(
      "Failed to delete event",
      error instanceof Error ? error.message : "Unknown error",
      500
    );
  }
}
