import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/auth";
import { successResponse, errorResponse } from "@/lib/api/response";
import { connectMongoose } from "@/lib/mongodb";
import { MenuItem, MenuCategory } from "@coworking-cafe/database";
import type { ApiResponse, MenuItem as MenuItemType } from "@/types/menu";

/**
 * GET /api/menu/items
 * Récupère la liste des items
 * Accessible à : dev, admin, staff
 */
export async function GET(
  request: NextRequest
): Promise<NextResponse<ApiResponse<MenuItemType[]>>> {
  const authResult = await requireAuth(["dev", "admin", "staff"]);
  if (!authResult.authorized) {
    return authResult.response;
  }

  await connectMongoose();

  const searchParams = request.nextUrl.searchParams;
  const type = searchParams.get("type"); // "food" | "drink" | null
  const categoryId = searchParams.get("categoryId");
  const activeOnly = searchParams.get("activeOnly") === "true";

  try {
    const filter: Record<string, unknown> = {};
    if (type) filter.type = type;
    if (categoryId) filter.category = categoryId;
    if (activeOnly) filter.isActive = true;

    const items = await MenuItem.find(filter)
      .populate("category", "name slug")
      .sort({ type: 1, category: 1, order: 1 })
      .lean();

    const formattedItems: MenuItemType[] = items.map((item) => ({
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
    }));

    return successResponse(formattedItems, "Items récupérés avec succès");
  } catch (error) {
    console.error("GET /api/menu/items error:", error);
    return errorResponse(
      "Erreur lors de la récupération des items",
      (error as Error).message
    );
  }
}

/**
 * POST /api/menu/items
 * Crée un nouvel item
 * Accessible à : dev, admin
 */
export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse<MenuItemType>>> {
  const authResult = await requireAuth(["dev", "admin"]);
  if (!authResult.authorized) {
    return authResult.response;
  }

  await connectMongoose();

  try {
    const body = await request.json();

    // Validation
    if (!body.name || !body.categoryId || !body.type) {
      return errorResponse(
        "Données manquantes",
        "name, categoryId, type sont requis",
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

    // Vérifier que la catégorie existe
    const category = await MenuCategory.findById(body.categoryId);
    if (!category) {
      return errorResponse(
        "Catégorie introuvable",
        "La catégorie spécifiée n'existe pas",
        400
      );
    }

    // Vérifier cohérence du type (item.type === category.type)
    if (body.type !== category.type) {
      return errorResponse(
        "Type incohérent",
        `Le type de l'item (${body.type}) doit correspondre au type de la catégorie (${category.type})`,
        400
      );
    }

    // Créer l'item
    const item = await MenuItem.create({
      name: body.name,
      description: body.description,
      recipe: body.recipe,
      image: body.image,
      category: body.categoryId,
      type: body.type,
      order: body.order ?? 0,
      isActive: body.isActive ?? true,
    });

    // Populate pour retourner les infos de la catégorie
    await item.populate("category", "name slug");

    const formattedItem: MenuItemType = {
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
    };

    return successResponse(formattedItem, "Item créé avec succès", 201);
  } catch (error) {
    console.error("POST /api/menu/items error:", error);
    return errorResponse(
      "Erreur lors de la création de l'item",
      (error as Error).message
    );
  }
}
