import { NextRequest, NextResponse } from "next/server";
import { promoService } from "../../../../lib/promo-service";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } },
) {
  try {
    const { token } = params;

    if (!token) {
      return NextResponse.json({ error: "Token requis" }, { status: 400 });
    }

    const promo = await promoService.getPromoByToken(token);

    if (!promo) {
      return NextResponse.json(
        { error: "Code promo non trouvé ou expiré" },
        { status: 404 },
      );
    }

    // Incrémenter les vues
    await promoService.incrementViews();

    return NextResponse.json(promo, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
