import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@coworking-cafe/database";
import { User, PasswordResetToken } from "@coworking-cafe/database";
import crypto from "crypto";
import { sendEmail } from "@/lib/email/send-email";
import { passwordResetEmail } from "@/lib/email/password-reset";

export const dynamic = "force-dynamic";

interface ForgotPasswordRequest {
  email: string;
}

interface SuccessResponse {
  success: true;
  message: string;
}

interface ErrorResponse {
  success: false;
  message: string;
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<SuccessResponse | ErrorResponse>> {
  try {
    const body: ForgotPasswordRequest = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, message: "Email requis" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Trouver l'utilisateur
    const user = await User.findOne({ email: email.toLowerCase() }).lean();

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
      process.env.NEXTAUTH_URL || `http://localhost:${process.env.PORT || 3000}`;
    const resetUrl = `${baseUrl}/auth/reset-password?token=${token}`;

    // Envoyer l'email
    await sendEmail({
      to: user.email,
      subject: "Réinitialisation de votre mot de passe - CoworKing Café",
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
      { status: 500 }
    );
  }
}
