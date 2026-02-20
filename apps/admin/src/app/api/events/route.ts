import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/api/auth";
import { successResponse, errorResponse } from "@/lib/api/response";
import { connectDB } from "@/lib/db";
import { Event } from "@coworking-cafe/database";
import { eventSchema, eventFiltersSchema } from "@/lib/validations/event";
import type { EventInput, EventFilters } from "@/lib/validations/event";
import type { FilterQuery, SortOrder } from "mongoose";
import { createEventBooking } from "@/lib/event-booking-sync";

export const dynamic = "force-dynamic";

/**
 * GET /api/events
 * List events with filters and pagination
 * Auth: dev, admin
 */
export async function GET(request: NextRequest) {
  const authResult = await requireAuth(["dev", "admin"]);
  if (!authResult.authorized) {
    return authResult.response;
  }

  try {
    await connectDB();

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const filtersResult = eventFiltersSchema.safeParse({
      status: searchParams.get("status") || undefined,
      category: searchParams.get("category") || undefined,
      page: searchParams.get("page") || "1",
      limit: searchParams.get("limit") || "20",
      sortBy: searchParams.get("sortBy") || "date",
      sortOrder: searchParams.get("sortOrder") || "asc",
    });

    if (!filtersResult.success) {
      const errorMessages = filtersResult.error.issues
        .map((e) => `${e.path.join(".")}: ${e.message}`)
        .join(", ");
      return errorResponse("Invalid query parameters", errorMessages, 400);
    }

    const filters: EventFilters = filtersResult.data;

    // Build MongoDB query
    const query: FilterQuery<typeof Event> = {};

    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.category) {
      query.category = { $in: [filters.category] };
    }

    // Calculate pagination
    const skip = (filters.page - 1) * filters.limit;

    // Sort configuration
    const sortConfig: Record<string, SortOrder> = {};
    sortConfig[filters.sortBy] = filters.sortOrder === "asc" ? 1 : -1;

    // Execute query
    const [events, total] = await Promise.all([
      Event.find(query)
        .sort(sortConfig)
        .skip(skip)
        .limit(filters.limit)
        .populate("createdBy", "givenName familyName email")
        .lean(),
      Event.countDocuments(query),
    ]);

    return successResponse(
      {
        events,
        pagination: {
          page: filters.page,
          limit: filters.limit,
          total,
          totalPages: Math.ceil(total / filters.limit),
        },
      },
      "Events retrieved successfully"
    );
  } catch (error) {
    console.error("[API] GET /api/events error:", error);
    return errorResponse(
      "Failed to retrieve events",
      error instanceof Error ? error.message : "Unknown error",
      500
    );
  }
}

/**
 * POST /api/events
 * Create a new event
 * Auth: dev, admin
 */
export async function POST(request: NextRequest) {
  const authResult = await requireAuth(["dev", "admin"]);
  if (!authResult.authorized) {
    return authResult.response;
  }

  try {
    await connectDB();

    const body = await request.json();

    // Validate input
    const validationResult = eventSchema.safeParse(body);

    if (!validationResult.success) {
      const errorMessages = validationResult.error.issues
        .map((e) => `${e.path.join(".")}: ${e.message}`)
        .join(", ");
      return errorResponse("Validation failed", errorMessages, 400);
    }

    const eventData: EventInput = validationResult.data;

    // Check if slug already exists (if provided)
    if (eventData.slug) {
      const existingEvent = await Event.findOne({ slug: eventData.slug });
      if (existingEvent) {
        return errorResponse(
          "Slug already exists",
          "An event with this slug already exists. Please choose a different slug.",
          409
        );
      }
    }

    // Create event
    const event = await Event.create({
      ...eventData,
      createdBy: authResult.session.user.id,
    });

    // Populate createdBy for response
    await event.populate("createdBy", "givenName familyName email");

    // Create linked booking reservation (blocks calendar) if requested
    if (body.addToAgenda !== false) {
      // Default to true if not specified (backward compatibility)
      try {
        await createEventBooking(event, authResult.session.user.id);
      } catch (bookingError) {
        console.error("[API] Failed to create event booking:", bookingError);
        // Continue even if booking creation fails (event is still created)
      }
    }

    return successResponse(
      event,
      "Event created successfully",
      201
    );
  } catch (error) {
    console.error("[API] POST /api/events error:", error);

    // Handle duplicate slug error from MongoDB
    if (error instanceof Error && error.message.includes("duplicate key")) {
      return errorResponse(
        "Slug already exists",
        "An event with this slug already exists. Please choose a different slug.",
        409
      );
    }

    return errorResponse(
      "Failed to create event",
      error instanceof Error ? error.message : "Unknown error",
      500
    );
  }
}
