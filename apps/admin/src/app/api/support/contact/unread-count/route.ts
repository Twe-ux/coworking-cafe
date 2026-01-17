import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/auth";
import { successResponse, errorResponse } from "@/lib/api/response";
import { connectMongoose } from "@/lib/mongodb";
import { ContactMail } from "@/models/contactMail";
import type { ApiResponse } from "@/types/timeEntry";

/**
 * GET /api/support/contact/unread-count
 * Récupère le nombre de messages non lus
 */
export async function GET(
  request: NextRequest
): Promise<NextResponse<ApiResponse<{ count: number }>>> {
  // Auth dev/admin
  const authResult = await requireAuth(["dev", "admin"]);
  if (!authResult.authorized) {
    return authResult.response as NextResponse<ApiResponse<{ count: number }>>;
  }

  await connectMongoose();

  try {
    const count = await ContactMail.countDocuments({ status: "unread" });

    return successResponse({ count });
  } catch (error) {
    console.error("GET /api/support/contact/unread-count error:", error);
    return errorResponse(
      "Erreur lors de la récupération du nombre de messages non lus",
      error instanceof Error ? error.message : "Erreur inconnue"
    );
  }
}
