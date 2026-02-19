import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/auth";
import { successResponse, errorResponse } from "@/lib/api/response";
import { connectDB } from "@/lib/db";
import { Event } from "@coworking-cafe/database";
import { eventStatusSchema } from "@/lib/validations/event";
import type { EventStatusInput } from "@/lib/validations/event";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

/**
 * POST /api/events/[id]/publish
 * Toggle event status between draft/published/archived
 * Auth: dev, admin
 */
export async function POST(
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

    // Validate input
    const validationResult = eventStatusSchema.safeParse(body);

    if (!validationResult.success) {
      return errorResponse(
        "Validation failed",
        validationResult.error.issues.map((e: any) => `${e.path.join(".")}: ${e.message}`).join(", "),
        400
      );
    }

    const { status }: EventStatusInput = validationResult.data;

    // Update event status
    const event = await Event.findByIdAndUpdate(
      id,
      { $set: { status } },
      { new: true, runValidators: true }
    ).populate("createdBy", "givenName familyName email");

    if (!event) {
      return errorResponse("Event not found", "No event found with this ID", 404);
    }

    return successResponse(
      event,
      `Event ${status === "published" ? "published" : status === "draft" ? "moved to draft" : "archived"} successfully`
    );
  } catch (error) {
    console.error(`[API] POST /api/events/${params.id}/publish error:`, error);
    return errorResponse(
      "Failed to update event status",
      error instanceof Error ? error.message : "Unknown error",
      500
    );
  }
}
