import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

/**
 * API pour invalider le cache Next.js
 * Utilisée par l'admin après modification des données
 *
 * POST /api/revalidate
 * Body: { tags: string[] }
 * Header: x-revalidate-secret (pour sécurité)
 */

// Force dynamic rendering (no static analysis at build time)
export const dynamic = 'force-dynamic';
export async function POST(request: NextRequest) {
  try {
    // Vérifier le secret (optionnel mais recommandé en prod)
    const secret = request.headers.get("x-revalidate-secret");
    if (process.env.REVALIDATE_SECRET && secret !== process.env.REVALIDATE_SECRET) {
      return NextResponse.json(
        { error: "Invalid secret" },
        { status: 401 }
      );
    }

    // Récupérer les tags à invalider
    const body = await request.json();
    const { tags } = body;

    if (!tags || !Array.isArray(tags)) {
      return NextResponse.json(
        { error: "Tags array is required" },
        { status: 400 }
      );
    }

    // Invalider chaque tag
    for (const tag of tags) {
      revalidateTag(tag);
    }

    return NextResponse.json({
      success: true,
      message: `Revalidated ${tags.length} tag(s)`,
      tags,
    });
  } catch (error) {
    console.error("Revalidate error:", error);
    return NextResponse.json(
      { error: "Failed to revalidate" },
      { status: 500 }
    );
  }
}
