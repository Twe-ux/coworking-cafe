import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "../../../../lib/mongodb";
import { User } from "@coworking-cafe/database";
import { PasswordResetToken } from "@coworking-cafe/database";
import crypto from "crypto";
import { sendEmail } from "@coworking-cafe/email";
import { passwordResetEmail } from "../../../../lib/email/templates";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, message: "Email requis" },
        { status: 400 },
      );
    }

    await connectDB();

    // Trouver l'utilisateur
    const user = await User.findOne({ email: email.toLowerCase() });

    // Pour des raisons de sécurité, on retourne toujours le même message
    // même si l'utilisateur n'existe pas
    if (!user) {
      return NextResponse.json({
        success: true,
        message:
          "Si un compte existe avec cet email, vous recevrez un lien de réinitialisation.",
      });
    }

    // Générer un token sécurisé
    const token = crypto.randomBytes(32).toString("hex");

    // Créer le token de réinitialisation (expire dans 1 heure)
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 heure

    await PasswordResetToken.create({
      userId: user._id,
      token,
      expiresAt,
      used: false,
    });

    // Construire l'URL de réinitialisation
    const baseUrl =
      process.env.NEXTAUTH_URL ||
      `http://localhost:${process.env.PORT || 3000}`;
    const resetUrl = `${baseUrl}/auth/reset-password?token=${token}`;

    // Envoyer l'email (via SMTP OVH avec noreply@coworkingcafe.fr)
    await sendEmail({
      to: user.email,
      subject: "Réinitialisation de votre mot de passe",
      html: passwordResetEmail({
        userName: user.givenName || user.username || user.email,
        resetUrl,
      }),
    });

    return NextResponse.json({
      success: true,
      message:
        "Si un compte existe avec cet email, vous recevrez un lien de réinitialisation.",
    });
  } catch (error) {
    console.error("Erreur lors de la réinitialisation du mot de passe:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Une erreur est survenue",
      },
      { status: 500 },
    );
  }
}
