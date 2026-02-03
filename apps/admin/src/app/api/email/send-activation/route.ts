import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/auth";
import { successResponse, errorResponse } from "@/lib/api/response";
import { sendAccountActivationEmail } from "@/lib/email/emailService";

/**
 * POST /api/email/send-activation - Send account activation email
 */
export async function POST(request: NextRequest) {
  try {
    // Auth: Only dev/admin can send activation emails
    const authResult = await requireAuth(["dev", "admin"]);
    if (!authResult.authorized) {
      return authResult.response;
    }

    // Parse body
    const body = await request.json();

    // Validation
    if (!body.email || !body.userName || !body.activationToken) {
      return errorResponse(
        "Missing required fields",
        "email, userName, activationToken are required",
        400,
      );
    }

    // Send email
    const emailSent = await sendAccountActivationEmail(body.email, {
      userName: body.userName,
      activationToken: body.activationToken,
    });

    if (!emailSent) {
      return errorResponse("Failed to send activation email", undefined, 500);
    }

    return successResponse(
      { sent: true },
      "Activation email sent successfully",
    );
  } catch (error) {
    console.error("POST /api/email/send-activation error:", error);
    return errorResponse(
      "Failed to send activation email",
      error instanceof Error ? error.message : undefined,
      500,
    );
  }
}
