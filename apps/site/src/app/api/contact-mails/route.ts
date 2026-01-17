import { connectDB } from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const getResendClient = () => {
  return new Resend(process.env.RESEND_API_KEY);
};

// POST - Create new message (public)
export async function POST(request: NextRequest) {
  try {
    const mongoose = await connectDB();

    // Get or create model using the CONNECTED mongoose instance
    let ContactMail;
    if (mongoose.models.ContactMail) {
      ContactMail = mongoose.models.ContactMail;
    } else {
      const schema = new mongoose.Schema({
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, trim: true, lowercase: true },
        phone: { type: String, trim: true },
        subject: { type: String, required: true, trim: true },
        message: { type: String, required: true, trim: true },
        status: { type: String, enum: ['unread', 'read', 'replied', 'archived'], default: 'unread' },
      }, { timestamps: true });

      ContactMail = mongoose.model('ContactMail', schema);
    }

    const body = await request.json();
    const { name, email, phone, subject, message } = body;

    // Validation
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: "Tous les champs obligatoires doivent être remplis" },
        { status: 400 }
      );
    }

    // Create contact mail
    const newMessage = await ContactMail.create({
      name,
      email,
      phone,
      subject,
      message,
      status: "unread",
    });

    // Send notification email to admin
    try {
      const resend = getResendClient();
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
        to: "strasbourg@coworkingcafe.fr",
        subject: `Nouveau message de contact: ${subject}`,
        html: `
          <h2>Nouveau message de contact</h2>
          <p><strong>De:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          ${phone ? `<p><strong>Téléphone:</strong> ${phone}</p>` : ""}
          <p><strong>Sujet:</strong> ${subject}</p>
          <hr />
          <p><strong>Message:</strong></p>
          <p>${message.replace(/\n/g, "<br />")}</p>
          <hr />
          <p><small>Message reçu le ${new Date().toLocaleString(
            "fr-FR"
          )}</small></p>
        `,
      });
    } catch (emailError) {      // Continue even if email fails
    }

    return NextResponse.json(
      {
        success: true,
        message: "Votre message a été envoyé avec succès",
        id: newMessage._id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/contact-mails error:', error);
    return NextResponse.json(
      { error: "Erreur lors de l'envoi du message" },
      { status: 500 }
    );
  }
}

// Add maxDuration for Vercel/Serverless platforms
export const maxDuration = 30; // 30 seconds timeout
