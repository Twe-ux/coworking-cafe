import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/auth";
import { successResponse, errorResponse } from "@/lib/api/response";
import { connectMongoose } from "@/lib/mongodb";
import { MenuItem as MenuItemModel, MenuCategory as MenuCategoryModel } from "@coworking-cafe/database";
import { revalidateMenuCache } from "@/lib/revalidate-site-cache";
import type { ApiResponse, MenuItem, ProduitsItemType } from "@/types/produits";
import { Types } from "mongoose";

/**
 * Interface pour une catégorie populée par Mongoose
 */
interface PopulatedCategory {
  _id: Types.ObjectId;
  name: string;
  slug: string;
}

/**
 * Interface pour un MenuItem avec la catégorie populée
 * Note: Mongoose lean() retourne des objets plain avec _id de type ObjectId
 */
interface PopulatedMenuItem {
  _id: Types.ObjectId;
  name: string;
  description?: string;
  recipe?: string;
  image?: string;
  category: PopulatedCategory | Types.ObjectId;
  type: ProduitsItemType;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Type guard pour vérifier si la catégorie est populée
 */
function isPopulatedCategory(category: PopulatedCategory | Types.ObjectId): category is PopulatedCategory {
  return (category as PopulatedCategory).name !== undefined;
}

/**
 * GET /api/menu/items
 * Récupère la liste des items
 * Accessible à : dev, admin, staff
 */
// Force dynamic rendering (no static analysis at build time)
export const dynamic = 'force-dynamic';
export async function GET(
  request: NextRequest
): Promise<NextResponse<ApiResponse<MenuItem[]>>> {
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

    const items = await MenuItemModel.find(filter)
      .populate("category", "name slug")
      .sort({ type: 1, category: 1, order: 1 })
      .lean();

    const formattedItems: MenuItem[] = (items as unknown as PopulatedMenuItem[]).map((item) => {
      // Vérifier que la catégorie est bien populée
      if (!isPopulatedCategory(item.category)) {
        throw new Error(`Category not populated for item ${item._id}`);
      }

      return {
        id: item._id.toString(),
        name: item.name,
        description: item.description,
        recipe: item.recipe,
        image: item.image,
        category: {
          id: item.category._id.toString(),
          name: item.category.name,
          slug: item.category.slug,
        },
        type: item.type,
        order: item.order,
        isActive: item.isActive,
        createdAt: item.createdAt.toISOString(),
        updatedAt: item.updatedAt.toISOString(),
      };
    });

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
): Promise<NextResponse<ApiResponse<MenuItem>>> {
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

    if (!["food", "drink", "grocery", "goodies"].includes(body.type)) {
      return errorResponse(
        "Type invalide",
        "type doit être 'food', 'drink', 'grocery' ou 'goodies'",
        400
      );
    }

    // Vérifier que la catégorie existe
    const category = await MenuCategoryModel.findById(body.categoryId);
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
    const item = await MenuItemModel.create({
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

    // Vérifier que la catégorie est populée
    const populatedItem = item.toObject() as unknown as PopulatedMenuItem;
    if (!isPopulatedCategory(populatedItem.category)) {
      throw new Error("Category not populated after populate() call");
    }

    const formattedItem: MenuItem = {
      id: populatedItem._id.toString(),
      name: populatedItem.name,
      description: populatedItem.description,
      recipe: populatedItem.recipe,
      image: populatedItem.image,
      category: {
        id: populatedItem.category._id.toString(),
        name: populatedItem.category.name,
        slug: populatedItem.category.slug,
      },
      type: populatedItem.type,
      order: populatedItem.order,
      isActive: populatedItem.isActive,
      createdAt: populatedItem.createdAt.toISOString(),
      updatedAt: populatedItem.updatedAt.toISOString(),
    };

    // Invalider le cache du site pour ce type
    await revalidateMenuCache(item.type as ProduitsItemType);

    return successResponse(formattedItem, "Item créé avec succès", 201);
  } catch (error) {
    console.error("POST /api/menu/items error:", error);
    return errorResponse(
      "Erreur lors de la création de l'item",
      (error as Error).message
    );
  }
}
