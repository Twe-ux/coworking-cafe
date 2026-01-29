import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/auth";
import { successResponse, errorResponse } from "@/lib/api/response";
import { connectMongoose } from "@/lib/mongodb";
import { MenuItem } from "@coworking-cafe/database";
import { revalidateAllMenuCache } from "@/lib/revalidate-site-cache";
import type { ApiResponse } from "@/types/produits";

interface ReorderRequest {
  itemIds: string[];
}

/**
 * PUT /api/produits/items/reorder
 * Réorganise l'ordre des items
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

    if (!body.itemIds || !Array.isArray(body.itemIds)) {
      return errorResponse(
        "Données invalides",
        "itemIds doit être un tableau",
        400
      );
    }

    // Mettre à jour l'ordre de chaque item
    const updatePromises = body.itemIds.map((itemId, index) =>
      MenuItem.findByIdAndUpdate(itemId, { order: index })
    );

    await Promise.all(updatePromises);

    // Invalider tout le cache menu
    await revalidateAllMenuCache();

    return successResponse(undefined, "Ordre des items mis à jour avec succès");
  } catch (error) {
    console.error("PUT /api/produits/items/reorder error:", error);
    return errorResponse(
      "Erreur lors de la réorganisation des items",
      (error as Error).message
    );
  }
}
