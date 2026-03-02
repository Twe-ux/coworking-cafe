import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { sendEmail } from "@/lib/email/emailService";

interface SendEmailPayload {
  recipientEmail: string;
  pdfBase64: string;
  month: number;
  year: number;
}

/**
 * POST /api/hr/payroll/send-email
 * Send payroll PDF by email
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: "Non authentifié",
        },
        { status: 401 }
      );
    }

    // Only dev and admin can send payroll emails
    const userRole = session?.user?.role;
    if (!userRole || !["dev", "admin"].includes(userRole)) {
      return NextResponse.json(
        {
          success: false,
          error: "Accès refusé - Administrateurs uniquement",
        },
        { status: 403 }
      );
    }

    // Parse request body
    const { recipientEmail, pdfBase64, month, year }: SendEmailPayload =
      await request.json();

    // Validation
    if (!recipientEmail || !pdfBase64 || !month || !year) {
      return NextResponse.json(
        {
          success: false,
          error: "Données manquantes",
        },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(recipientEmail)) {
      return NextResponse.json(
        {
          success: false,
          error: "Format d'email invalide",
        },
        { status: 400 }
      );
    }

    // Month name
    const monthNames = [
      "Janvier",
      "Février",
      "Mars",
      "Avril",
      "Mai",
      "Juin",
      "Juillet",
      "Août",
      "Septembre",
      "Octobre",
      "Novembre",
      "Décembre",
    ];
    const monthName = monthNames[month - 1];

    // Convert base64 to Buffer
    const pdfBuffer = Buffer.from(pdfBase64, "base64");

    // Send email with SMTP (via @coworking-cafe/email package)
    const result = await sendEmail({
      to: recipientEmail,
      subject: `Récapitulatif Paie - ${monthName} ${year}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1e40af;">Récapitulatif Paie - ${monthName} ${year}</h2>

          <p>Bonjour,</p>

          <p>Veuillez trouver ci-joint le récapitulatif de paie pour le mois de <strong>${monthName} ${year}</strong>.</p>

          <p>Ce document contient :</p>
          <ul>
            <li>Informations complètes des employés (nom, adresse, N° sécu)</li>
            <li>Dates de contrat (début et fin si applicable)</li>
            <li>Heures contractuelles et heures réalisées</li>
            <li>Heures supplémentaires calculées</li>
            <li>Statut mutuelle</li>
          </ul>

          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;" />

          <p style="font-size: 12px; color: #6b7280;">
            Ce message a été envoyé automatiquement depuis le système de gestion RH de CoworKing Café.
          </p>
        </div>
      `,
      attachments: [
        {
          filename: `Paie_${year}-${String(month).padStart(2, "0")}.pdf`,
          content: pdfBuffer,
        },
      ],
    });

    if (!result.success) {
      console.error("Email sending error:", result.error);
      return NextResponse.json(
        {
          success: false,
          error: "Erreur lors de l'envoi de l'email",
          details: result.error,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Email envoyé à ${recipientEmail}`,
    });
  } catch (error) {
    console.error("Error sending payroll email:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Erreur serveur",
        details: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 }
    );
  }
}
