import connectDB from "../../../lib/mongodb";
import { ContactMail } from "@coworking-cafe/database";
import { NextRequest, NextResponse } from "next/server";

interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

export async function POST(request: NextRequest) {
  try {
    // Connect to database
    await connectDB();

    // Parse body
    const body: ContactFormData = await request.json();

    // Validation
    if (!body.name || !body.email || !body.subject || !body.message) {
      return NextResponse.json(
        { error: "Tous les champs obligatoires doivent être remplis" },
        { status: 400 },
      );
    }

    // Validation email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json({ error: "Email invalide" }, { status: 400 });
    }

    // Sauvegarder en base de données
    const contactMail = await ContactMail.create({
      name: body.name,
      email: body.email,
      phone: body.phone || "",
      subject: body.subject,
      message: body.message,
      status: "unread",
    });

    // Envoyer notification push aux admins (non-bloquant)
    try {
      const adminApiUrl =
        process.env.NEXT_PUBLIC_ADMIN_API_URL || "http://localhost:3001";
      const notificationsSecret = process.env.NOTIFICATIONS_SECRET;

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      // Ajouter le token secret si disponible
      if (notificationsSecret) {
        headers["Authorization"] = `Bearer ${notificationsSecret}`;
      }

      await fetch(`${adminApiUrl}/api/notifications/send`, {
        method: "POST",
        headers,
        body: JSON.stringify({ messageId: contactMail._id.toString() }),
      });
      console.log(
        "[Contact] ✅ Push notification triggered for message:",
        contactMail._id,
      );
    } catch (notifError) {
      // Ne pas bloquer si la notification échoue
      console.error("[Contact] ❌ Failed to send push notification:", notifError);
    }

    return NextResponse.json({
      success: true,
      message:
        "Votre message a bien été enregistré. Nous vous répondrons dans les plus brefs délais.",
      data: {
        id: contactMail._id.toString(),
      },
    });
  } catch (error) {
    console.error("POST /api/contact-mails error:", error);
    return NextResponse.json(
      {
        error: "Erreur lors de l'enregistrement du message",
        details: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 },
    );
  }
}
