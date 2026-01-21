import { NextRequest, NextResponse } from "next/server";
import { promoService } from "@/lib/promo-service";

export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params;

    if (!token) {
      return NextResponse.json(
        { error: "Token requis" },
        { status: 400 }
      );
    }

    const promo = await promoService.getPromoByToken(token);

    if (!promo) {
      return NextResponse.json(
        { error: "Code promo non trouvé ou expiré" },
        { status: 404 }
      );
    }

    return NextResponse.json(promo);
  } catch (error) {
    console.error("Error getting promo by token:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
