import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/auth";
import { successResponse, errorResponse } from "@/lib/api/response";
import { connectMongoose } from "@/lib/mongodb";
import { MenuCategory, MenuItem } from "@coworking-cafe/database";
import type { ApiResponse, MenuData } from "@/types/menu";

/**
 * GET /api/menu
 * Récupère toutes les catégories et tous les items du menu
 * Accessible à : dev, admin, staff
 */
export async function GET(
  request: NextRequest
): Promise<NextResponse<ApiResponse<MenuData>>> {
  // 1. Auth
  const authResult = await requireAuth(["dev", "admin", "staff"]);
  if (!authResult.authorized) {
    return authResult.response;
  }

  // 2. DB Connection
  await connectMongoose();

  // 3. Query params (optionnel)
  const searchParams = request.nextUrl.searchParams;
  const type = searchParams.get("type"); // "food" | "drink" | null

  try {
    // 4. Récupérer les catégories
    const categoryFilter = type ? { type, isActive: true } : { isActive: true };
    const categories = await MenuCategory.find(categoryFilter)
      .sort({ type: 1, order: 1 })
      .lean();

    // 5. Récupérer les items
    const itemFilter = type ? { type, isActive: true } : { isActive: true };
    const items = await MenuItem.find(itemFilter)
      .populate("category", "name slug")
      .sort({ type: 1, order: 1 })
      .lean();

    // 6. Formatter les données
    const menuData: MenuData = {
      categories: categories.map((cat) => ({
        id: cat._id.toString(),
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        type: cat.type,
        order: cat.order,
        isActive: cat.isActive,
        showOnSite: cat.showOnSite,
        createdAt: cat.createdAt.toISOString(),
        updatedAt: cat.updatedAt.toISOString(),
      })),
      items: items.map((item) => ({
        id: item._id.toString(),
        name: item.name,
        description: item.description,
        recipe: item.recipe,
        image: item.image,
        category: {
          id: (item.category as any)._id.toString(),
          name: (item.category as any).name,
          slug: (item.category as any).slug,
        },
        type: item.type,
        order: item.order,
        isActive: item.isActive,
        createdAt: item.createdAt.toISOString(),
        updatedAt: item.updatedAt.toISOString(),
      })),
    };

    return successResponse(menuData, "Données du menu récupérées avec succès");
  } catch (error) {
    console.error("GET /api/menu error:", error);
    return errorResponse(
      "Erreur lors de la récupération des données du menu",
      (error as Error).message
    );
  }
}
