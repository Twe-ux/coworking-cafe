import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/auth";
import { successResponse, errorResponse } from "@/lib/api/response";
import { connectMongoose } from "@/lib/mongodb";
import { connectDB } from "@/lib/db";
import { ContactMail } from "@/models/contactMail";
import Unavailability from "@/models/unavailability";
import { Booking } from "@coworking-cafe/database";

interface SidebarCounts {
  pendingBookings: number;
  unreadMessages: number;
  pendingUnavailabilities: number;
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

    // Run all 3 count queries in parallel
    const [unreadMessages, pendingUnavailabilities, pendingBookings] =
      await Promise.all([
        ContactMail.countDocuments({ status: "unread" }),
        Unavailability.countDocuments({ status: "pending" }),
        Booking.countDocuments({ status: "pending" }),
      ]);

    const counts: SidebarCounts = {
      pendingBookings,
      unreadMessages,
      pendingUnavailabilities,
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
