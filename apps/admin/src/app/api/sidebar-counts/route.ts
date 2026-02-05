import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/auth";
import { successResponse, errorResponse } from "@/lib/api/response";
import { connectMongoose } from "@/lib/mongodb";
import { connectDB } from "@/lib/db";
import { ContactMail } from "@/models/contactMail";
import Unavailability from "@/models/unavailability";
import TimeEntry from "@/models/timeEntry";
import { Booking } from "@coworking-cafe/database";

interface SidebarCounts {
  pendingBookings: number;
  unreadMessages: number;
  pendingUnavailabilities: number;
  pendingJustifications: number;
}

/**
 * GET /api/sidebar-counts
 * Returns all sidebar badge counts in a single request
 * Replaces 3 separate endpoints to reduce DB connections
 */
export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest
): Promise<NextResponse> {
  const authResult = await requireAuth(["dev", "admin"]);
  if (!authResult.authorized) {
    return authResult.response;
  }

  try {
    // Connect both drivers in parallel
    await Promise.all([connectMongoose(), connectDB()]);

    // Run all 4 count queries in parallel
    const [unreadMessages, pendingUnavailabilities, pendingBookings, pendingJustifications] =
      await Promise.all([
        ContactMail.countDocuments({ status: "unread" }),
        Unavailability.countDocuments({ status: "pending" }),
        Booking.countDocuments({ status: "pending" }),
        TimeEntry.countDocuments({
          isOutOfSchedule: true,
          justificationRead: { $ne: true }, // Only count unread justifications
          isActive: true,
        }),
      ]);

    const counts: SidebarCounts = {
      pendingBookings,
      unreadMessages,
      pendingUnavailabilities,
      pendingJustifications,
    };

    return successResponse(counts);
  } catch (error) {
    console.error("GET /api/sidebar-counts error:", error);
    return errorResponse(
      "Erreur lors de la récupération des compteurs sidebar",
      error instanceof Error ? error.message : "Erreur inconnue"
    );
  }
}
