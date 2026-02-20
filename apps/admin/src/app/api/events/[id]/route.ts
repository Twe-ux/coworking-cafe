import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/api/auth";
import { successResponse, errorResponse } from "@/lib/api/response";
import { connectDB } from "@/lib/db";
import { Event } from "@coworking-cafe/database";
import { eventUpdateSchema } from "@/lib/validations/event";
import type { EventUpdateInput } from "@/lib/validations/event";
import mongoose from "mongoose";
import { updateEventBooking, deleteEventBooking } from "@/lib/event-booking-sync";

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
    const validationResult = eventUpdateSchema.partial().safeParse(body);

    if (!validationResult.success) {
      const errorMessages = validationResult.error.issues
        .map((e) => `${e.path.join(".")}: ${e.message}`)
        .join(", ");
      return errorResponse("Validation failed", errorMessages, 400);
    }

    const updateData: Partial<EventUpdateInput> = validationResult.data;

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

    // Get previous event status before update
    const previousEvent = await Event.findById(id);

    // Update event
    const event = await Event.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate("createdBy", "givenName familyName email");

    if (!event) {
      return errorResponse("Event not found", "No event found with this ID", 404);
    }

    // Handle linked booking reservation based on status change and addToAgenda flag
    try {
      const addToAgenda = body.addToAgenda;

      // 1. If status changed to archived or cancelled, delete the booking
      if (
        updateData.status &&
        (updateData.status === "archived" || updateData.status === "cancelled") &&
        previousEvent?.status !== updateData.status
      ) {
        await deleteEventBooking(id);
        console.log(`[API] Booking deleted for ${updateData.status} event ${id}`);
      }
      // 2. If addToAgenda is explicitly set to false, delete the booking
      else if (addToAgenda === false) {
        await deleteEventBooking(id);
        console.log(`[API] Booking deleted (addToAgenda=false) for event ${id}`);
      }
      // 3. If addToAgenda is explicitly set to true, create or update the booking
      else if (addToAgenda === true) {
        // Check if event has all required fields for booking
        const hasRequiredFields = event.date && event.startTime && event.endTime && event.location;

        if (hasRequiredFields) {
          if (event.relatedBooking) {
            // Update existing booking if booking-related fields changed
            const hasBookingRelatedChanges =
              updateData.date !== undefined ||
              updateData.startTime !== undefined ||
              updateData.endTime !== undefined ||
              updateData.location !== undefined ||
              updateData.maxParticipants !== undefined ||
              updateData.price !== undefined ||
              updateData.organizer !== undefined ||
              updateData.title !== undefined;

            if (hasBookingRelatedChanges) {
              await updateEventBooking(id, updateData);
              console.log(`[API] Booking updated (addToAgenda=true) for event ${id}`);
            }
          } else {
            // Create new booking
            const { createEventBooking } = await import("@/lib/event-booking-sync");
            await createEventBooking(event, authResult.session.user.id);
            console.log(`[API] Booking created (addToAgenda=true) for event ${id}`);
          }
        } else {
          console.log(`[API] Cannot create booking - missing required fields for event ${id}`);
        }
      }
      // 4. If addToAgenda not specified, update booking if it exists and fields changed
      else if (
        event.relatedBooking &&
        (!updateData.status || (updateData.status !== "archived" && updateData.status !== "cancelled"))
      ) {
        const hasBookingRelatedChanges =
          updateData.date !== undefined ||
          updateData.startTime !== undefined ||
          updateData.endTime !== undefined ||
          updateData.location !== undefined ||
          updateData.maxParticipants !== undefined ||
          updateData.price !== undefined ||
          updateData.organizer !== undefined ||
          updateData.title !== undefined;

        if (hasBookingRelatedChanges) {
          await updateEventBooking(id, updateData);
        }
      }
    } catch (bookingError) {
      console.error("[API] Failed to update event booking:", bookingError);
      // Continue even if booking update fails (event is still updated)
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

    // Delete linked booking reservation first
    try {
      await deleteEventBooking(id);
    } catch (bookingError) {
      console.error("[API] Failed to delete event booking:", bookingError);
      // Continue even if booking deletion fails
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
