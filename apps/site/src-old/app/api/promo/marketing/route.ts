import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { options } from "../../../../lib/auth-options";
import { promoService } from "../../../../lib/promo-service";

export const dynamic = "force-dynamic";

// Récupérer le contenu marketing
export async function GET() {
  try {
    const marketing = await promoService.getMarketingContent();
    return NextResponse.json(marketing, { status: 200 });
  } catch (error) {
    console.error("GET /api/promo/marketing error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// Mettre à jour le contenu marketing (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(options);

    if (!session?.user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    // Vérifier les permissions (admin ou plus)
    if (session.user.role.level < 80) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    const body = await request.json();
    const { title, message, image_url, cta_text } = body;

    // Validation
    if (!title || !message || !cta_text) {
      return NextResponse.json(
        { error: "Titre, message et texte du bouton sont requis" },
        { status: 400 },
      );
    }

    const success = await promoService.updateMarketingContent({
      title,
      message,
      image_url,
      cta_text,
    });

    if (success) {
      return NextResponse.json(
        { message: "Contenu marketing mis à jour" },
        { status: 200 },
      );
    } else {
      return NextResponse.json(
        { error: "Erreur lors de la mise à jour" },
        { status: 500 },
      );
    }
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
