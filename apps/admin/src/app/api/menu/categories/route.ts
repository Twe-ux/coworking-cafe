import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/auth";
import { successResponse, errorResponse } from "@/lib/api/response";
import { connectMongoose } from "@/lib/mongodb";
import { MenuCategory } from "@coworking-cafe/database";
import type { ApiResponse, MenuCategory as MenuCategoryType } from "@/types/menu";

/**
 * GET /api/menu/categories
 * Récupère la liste des catégories
 * Accessible à : dev, admin, staff
 */
export async function GET(
  request: NextRequest
): Promise<NextResponse<ApiResponse<MenuCategoryType[]>>> {
  const authResult = await requireAuth(["dev", "admin", "staff"]);
  if (!authResult.authorized) {
    return authResult.response;
  }

  await connectMongoose();

  const searchParams = request.nextUrl.searchParams;
  const type = searchParams.get("type"); // "food" | "drink" | null
  const activeOnly = searchParams.get("activeOnly") === "true";

  try {
    const filter: Record<string, unknown> = {};
    if (type) filter.type = type;
    if (activeOnly) filter.isActive = true;

    const categories = await MenuCategory.find(filter)
      .sort({ type: 1, order: 1 })
      .lean();

    const formattedCategories: MenuCategoryType[] = categories.map((cat) => ({
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
    }));

    return successResponse(
      formattedCategories,
      "Catégories récupérées avec succès"
    );
  } catch (error) {
    console.error("GET /api/menu/categories error:", error);
    return errorResponse(
      "Erreur lors de la récupération des catégories",
      (error as Error).message
    );
  }
}

/**
 * POST /api/menu/categories
 * Crée une nouvelle catégorie
 * Accessible à : dev, admin
 */
export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse<MenuCategoryType>>> {
  const authResult = await requireAuth(["dev", "admin"]);
  if (!authResult.authorized) {
    return authResult.response;
  }

  await connectMongoose();

  try {
    const body = await request.json();

    // Validation
    if (!body.name || !body.slug || !body.type) {
      return errorResponse(
        "Données manquantes",
        "name, slug, type sont requis",
        400
      );
    }

    if (!["food", "drink"].includes(body.type)) {
      return errorResponse(
        "Type invalide",
        "type doit être 'food' ou 'drink'",
        400
      );
    }

    // Vérifier unicité du slug
    const existingCategory = await MenuCategory.findOne({ slug: body.slug });
    if (existingCategory) {
      return errorResponse(
        "Slug déjà utilisé",
        "Une catégorie avec ce slug existe déjà",
        400
      );
    }

    // Créer la catégorie
    const category = await MenuCategory.create({
      name: body.name,
      slug: body.slug,
      description: body.description,
      type: body.type,
      order: body.order ?? 0,
      isActive: body.isActive ?? true,
      showOnSite: body.showOnSite ?? true,
    });

    const formattedCategory: MenuCategoryType = {
      id: category._id.toString(),
      name: category.name,
      slug: category.slug,
      description: category.description,
      type: category.type,
      order: category.order,
      isActive: category.isActive,
      showOnSite: category.showOnSite,
      createdAt: category.createdAt.toISOString(),
      updatedAt: category.updatedAt.toISOString(),
    };

    return successResponse(
      formattedCategory,
      "Catégorie créée avec succès",
      201
    );
  } catch (error) {
    console.error("POST /api/menu/categories error:", error);
    return errorResponse(
      "Erreur lors de la création de la catégorie",
      (error as Error).message
    );
  }
}
