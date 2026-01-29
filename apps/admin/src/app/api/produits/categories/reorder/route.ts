import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/auth";
import { successResponse, errorResponse } from "@/lib/api/response";
import { connectMongoose } from "@/lib/mongodb";
import { MenuCategory } from "@coworking-cafe/database";
import { revalidateAllMenuCache } from "@/lib/revalidate-site-cache";
import type { ApiResponse } from "@/types/produits";

interface ReorderRequest {
  categoryIds: string[];
}

/**
 * PUT /api/produits/categories/reorder
 * Réorganise l'ordre des catégories
 * Accessible à : dev, admin
 */
// Force dynamic rendering (no static analysis at build time)
export const dynamic = 'force-dynamic';
export async function PUT(
  request: NextRequest
): Promise<NextResponse<ApiResponse<void>>> {
  const authResult = await requireAuth(["dev", "admin"]);
  if (!authResult.authorized) {
    return authResult.response;
  }

  await connectMongoose();

  try {
    const body: ReorderRequest = await request.json();

    if (!body.categoryIds || !Array.isArray(body.categoryIds)) {
      return errorResponse(
        "Données invalides",
        "categoryIds doit être un tableau",
        400
      );
    }

    // Mettre à jour l'ordre de chaque catégorie
    const updatePromises = body.categoryIds.map((categoryId, index) =>
      MenuCategory.findByIdAndUpdate(categoryId, { order: index })
    );

    await Promise.all(updatePromises);

    // Invalider tout le cache menu
    await revalidateAllMenuCache();

    return successResponse(undefined, "Ordre des catégories mis à jour avec succès");
  } catch (error) {
    console.error("PUT /api/produits/categories/reorder error:", error);
    return errorResponse(
      "Erreur lors de la réorganisation des catégories",
      (error as Error).message
    );
  }
}
