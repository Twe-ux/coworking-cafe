import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/auth";
import { successResponse, errorResponse } from "@/lib/api/response";
import { connectDB } from "@/lib/db";
import { Event } from "@coworking-cafe/database";
import { eventSchema, eventFiltersSchema } from "@/lib/validations/event";
import type { EventInput, EventFilters } from "@/lib/validations/event";

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
      return errorResponse(
        "Invalid query parameters",
        filtersResult.error.issues.map((e: any) => `${e.path.join(".")}: ${e.message}`).join(", "),
        400
      );
    }

    const filters: EventFilters = filtersResult.data;

    // Build MongoDB query
    const query: any = {};

    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.category) {
      query.category = { $in: [filters.category] };
    }

    // Calculate pagination
    const skip = (filters.page - 1) * filters.limit;

    // Sort configuration
    const sortConfig: any = {};
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
      return errorResponse(
        "Validation failed",
        validationResult.error.issues.map((e: any) => `${e.path.join(".")}: ${e.message}`).join(", "),
        400
      );
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
