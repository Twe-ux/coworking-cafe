import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { promoService } from "@/lib/promo-service";
import type { MarketingContent } from "@/types/promo";

export async function GET() {
  try {
    const marketing = await promoService.getMarketingContent();

    return NextResponse.json(marketing);
  } catch (error) {
    console.error("Error getting marketing content:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: "Non authentifié" },
        { status: 401 }
      );
    }

    const userRole = (session.user as { role?: string }).role;

    if (userRole !== "admin" && userRole !== "dev") {
      return NextResponse.json(
        { success: false, error: "Non autorisé" },
        { status: 403 }
      );
    }

    const body: Partial<MarketingContent> = await request.json();

    const success = await promoService.updateMarketingContent(body);

    if (!success) {
      return NextResponse.json(
        { success: false, error: "Erreur lors de la mise à jour" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating marketing content:", error);
    return NextResponse.json(
      { success: false, error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
