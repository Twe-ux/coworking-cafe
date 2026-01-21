import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@coworking-cafe/database";
import { User, PasswordResetToken } from "@coworking-cafe/database";

export const dynamic = "force-dynamic";

interface ResetPasswordRequest {
  token: string;
  password: string;
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
    const body: ResetPasswordRequest = await request.json();
    const { token, password } = body;

    if (!token || !password) {
      return NextResponse.json(
        { success: false, message: "Token et mot de passe requis" },
        { status: 400 }
      );
    }

    // Validation du mot de passe
    if (password.length < 8) {
      return NextResponse.json(
        {
          success: false,
          message: "Le mot de passe doit contenir au moins 8 caractères",
        },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Trouver le token
    const resetToken = await PasswordResetToken.findOne({
      token,
      used: false,
      expiresAt: { $gt: new Date() },
    }).lean();

    if (!resetToken) {
      return NextResponse.json(
        {
          success: false,
          message: "Token invalide ou expiré",
        },
        { status: 400 }
      );
    }

    // Trouver l'utilisateur
    const user = await User.findById(resetToken.userId);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Utilisateur introuvable",
        },
        { status: 404 }
      );
    }

    // Mettre à jour le mot de passe (sera hashé automatiquement par le hook pre-save)
    user.password = password;
    user.passwordChangedAt = new Date();
    await user.save();

    // Marquer le token comme utilisé
    await PasswordResetToken.findByIdAndUpdate(resetToken._id, {
      used: true,
    });

    return NextResponse.json({
      success: true,
      message: "Mot de passe réinitialisé avec succès",
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
