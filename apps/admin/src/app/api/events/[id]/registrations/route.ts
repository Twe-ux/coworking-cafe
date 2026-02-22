import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/api/auth";
import { successResponse, errorResponse, notFoundResponse } from "@/lib/api/response";
import { connectDB } from "@/lib/db";
import { Event, EventRegistration } from "@coworking-cafe/database";
import type { FilterQuery } from "mongoose";
import type { EventRegistrationDocument } from "@coworking-cafe/database";

export const dynamic = "force-dynamic";

/**
 * GET /api/events/[id]/registrations
 * List registrations for an event with filters and pagination
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

    // Verify event exists
    const event = await Event.findById(params.id)
      .select("title date startTime maxParticipants currentParticipants")
      .lean();

    if (!event) {
      return notFoundResponse("Événement");
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    // Build query
    const query: FilterQuery<EventRegistrationDocument> = { eventId: params.id };

    if (status && ["pending", "confirmed", "cancelled"].includes(status)) {
      query.status = status;
    }

    if (search) {
      const searchRegex = new RegExp(search, "i");
      query.$or = [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { email: searchRegex },
      ];
    }

    const skip = (page - 1) * limit;

    const [registrations, total] = await Promise.all([
      EventRegistration.find(query)
        .sort({ registeredAt: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      EventRegistration.countDocuments(query),
    ]);

    return successResponse({
      event: {
        _id: event._id.toString(),
        title: event.title,
        date: event.date,
        startTime: event.startTime,
        maxParticipants: event.maxParticipants,
        currentParticipants: event.currentParticipants,
      },
      registrations: registrations.map((r) => ({
        ...r,
        _id: r._id.toString(),
        eventId: r.eventId.toString(),
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("[API] GET /api/events/[id]/registrations error:", error);
    return errorResponse(
      "Erreur lors du chargement des inscriptions",
      error instanceof Error ? error.message : "Unknown error",
      500
    );
  }
}

/**
 * PATCH /api/events/[id]/registrations
 * Update a registration status
 * Auth: dev, admin
 * Body: { registrationId: string, status: "pending" | "confirmed" | "cancelled" }
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

    const body = await request.json();
    const { registrationId, status } = body as {
      registrationId: string;
      status: string;
    };

    if (!registrationId || !status) {
      return errorResponse("registrationId et status sont requis", undefined, 400);
    }

    if (!["pending", "confirmed", "cancelled"].includes(status)) {
      return errorResponse("Status invalide", undefined, 400);
    }

    const registration = await EventRegistration.findOne({
      _id: registrationId,
      eventId: params.id,
    });

    if (!registration) {
      return notFoundResponse("Inscription");
    }

    const previousStatus = registration.status;
    registration.status = status as "pending" | "confirmed" | "cancelled";
    await registration.save();

    // Update participant count if status changed to/from cancelled
    if (previousStatus !== "cancelled" && status === "cancelled") {
      await Event.findByIdAndUpdate(params.id, {
        $inc: { currentParticipants: -1 },
      });
    } else if (previousStatus === "cancelled" && status !== "cancelled") {
      await Event.findByIdAndUpdate(params.id, {
        $inc: { currentParticipants: 1 },
      });
    }

    return successResponse(
      { _id: registration._id.toString(), status: registration.status },
      "Inscription mise à jour"
    );
  } catch (error) {
    console.error("[API] PATCH /api/events/[id]/registrations error:", error);
    return errorResponse(
      "Erreur lors de la mise à jour",
      error instanceof Error ? error.message : "Unknown error",
      500
    );
  }
}

/**
 * DELETE /api/events/[id]/registrations
 * Delete a registration
 * Auth: dev, admin
 * Body: { registrationId: string }
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

    const body = await request.json();
    const { registrationId } = body as { registrationId: string };

    if (!registrationId) {
      return errorResponse("registrationId est requis", undefined, 400);
    }

    const registration = await EventRegistration.findOne({
      _id: registrationId,
      eventId: params.id,
    });

    if (!registration) {
      return notFoundResponse("Inscription");
    }

    // Decrement count only if registration was not cancelled
    if (registration.status !== "cancelled") {
      await Event.findByIdAndUpdate(params.id, {
        $inc: { currentParticipants: -1 },
      });
    }

    await EventRegistration.deleteOne({ _id: registrationId });

    return successResponse(null, "Inscription supprimée");
  } catch (error) {
    console.error("[API] DELETE /api/events/[id]/registrations error:", error);
    return errorResponse(
      "Erreur lors de la suppression",
      error instanceof Error ? error.message : "Unknown error",
      500
    );
  }
}
