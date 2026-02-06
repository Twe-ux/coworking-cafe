import { generateConfirmationEmail } from "../../../lib/email/templates/confirmation";
import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@coworking-cafe/email";


// Force dynamic rendering (no static analysis at build time)
export const dynamic = 'force-dynamic';
export async function GET(request: NextRequest) {
  try {
    // Email de test - vous pouvez changer cette adresse
    const testEmail = "milone.thierry@gmail.com";
    const contactEmail = process.env.CONTACT_EMAIL || "strasbourg@coworkingcafe.fr";

    const emailHtml = generateConfirmationEmail({
      name: "Test User",
      spaceName: "Place - Open-space",
      date: "vendredi 17 janvier 2026",
      startTime: "09:00",
      endTime: "17:00",
      numberOfPeople: 2,
      totalPrice: 99.0,
      depositAmount: 4950, // En centimes (49.50€)
      confirmationNumber: "BT-TEST-123456",
      contactEmail,
    });

    await sendEmail({
      to: testEmail,
      subject: "✅ TEST - Réservation confirmée",
      html: emailHtml,
      text: "Email de test - Réservation confirmée",
    });

    return NextResponse.json({
      success: true,
      message: `Email de test envoyé à ${testEmail}`,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to send test email" },
      { status: 500 },
    );
  }
}
