import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/auth";
import { successResponse, errorResponse } from "@/lib/api/response";
import { connectMongoose } from "@/lib/mongodb";
import { connectDB } from "@/lib/db";
import { ContactMail } from "@/models/contactMail";
import Absence from "@/models/absence";
import TimeEntry from "@/models/timeEntry";
import { Booking } from "@coworking-cafe/database";
import { PurchaseOrder } from "@/models/inventory/purchaseOrder";
import { Product } from "@/models/inventory/product";

interface SidebarCounts {
  pendingBookings: number;
  unreadMessages: number;
  pendingAbsences: number;
  pendingJustifications: number;
  draftOrders: number;
  outOfStockCount: number;
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

    // Optional: only count bookings/products updated after this timestamp (for "last seen" badge)
    const { searchParams } = new URL(request.url);
    const bookingsSeenAt = searchParams.get("bookingsSeenAt");
    const productsSeenAt = searchParams.get("productsSeenAt");

    const bookingsQuery: Record<string, unknown> = { status: "pending" };
    if (bookingsSeenAt) {
      bookingsQuery.createdAt = { $gt: new Date(bookingsSeenAt) };
    }

    const productsQuery: Record<string, unknown> = {
      currentStock: 0,
      isActive: true
    };
    if (productsSeenAt) {
      productsQuery.updatedAt = { $gt: new Date(productsSeenAt) };
    }

    // Run all 6 count queries in parallel
    const [unreadMessages, pendingAbsences, pendingBookings, pendingJustifications, draftOrders, outOfStockCount] =
      await Promise.all([
        ContactMail.countDocuments({ status: "unread" }),
        Absence.countDocuments({ status: "pending", isActive: true }),
        Booking.countDocuments(bookingsQuery),
        TimeEntry.countDocuments({
          isOutOfSchedule: true,
          justificationRead: { $ne: true }, // Only count unread justifications
          isActive: true,
        }),
        PurchaseOrder.countDocuments({ status: "draft" }),
        Product.countDocuments(productsQuery),
      ]);

    const counts: SidebarCounts = {
      pendingBookings,
      unreadMessages,
      pendingAbsences,
      pendingJustifications,
      draftOrders,
      outOfStockCount,
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
