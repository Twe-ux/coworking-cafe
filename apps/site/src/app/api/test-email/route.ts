import { generateConfirmationEmail } from "../../../lib/email/templates/confirmation";
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";


// Force dynamic rendering (no static analysis at build time)
export const dynamic = 'force-dynamic';
export async function GET(request: NextRequest) {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    // Email de test - vous pouvez changer cette adresse
    const testEmail = "milone.thierry@gmail.com";

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
    });

    const { data, error } = await resend.emails.send({
      from: "CoworKing Café by Anticafé <noreply@coworkingcafe.fr>",
      to: [testEmail],
      subject: "✅ TEST - Réservation confirmée",
      html: emailHtml,
    });

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 },
      );
    }

    return NextResponse.json({
      success: true,
      message: `Email de test envoyé à ${testEmail}`,
      data,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to send test email" },
      { status: 500 },
    );
  }
}
