import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/auth";
import { successResponse, errorResponse } from "@/lib/api/response";
import { connectMongoose } from "@/lib/mongodb";
import { MenuItem, MenuCategory } from "@coworking-cafe/database";
import { revalidateMenuCache } from "@/lib/revalidate-site-cache";
import type { ApiResponse, MenuItem as MenuItemType, ProduitsItemType } from "@/types/produits";

/**
 * GET /api/menu/items/[id]
 * Récupère un item par ID
 * Accessible à : dev, admin, staff
 */
// Force dynamic rendering (no static analysis at build time)
export const dynamic = 'force-dynamic';
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<ApiResponse<MenuItemType>>> {
  const authResult = await requireAuth(["dev", "admin", "staff"]);
  if (!authResult.authorized) {
    return authResult.response;
  }

  await connectMongoose();

  try {
    const item = await MenuItem.findById(params.id)
      .populate("category", "name slug")
      .lean();

    if (!item) {
      return errorResponse("Item introuvable", "Aucun item avec cet ID", 404);
    }

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

    return successResponse(formattedItem, "Item récupéré avec succès");
  } catch (error) {
    console.error(`GET /api/menu/items/${params.id} error:`, error);
    return errorResponse(
      "Erreur lors de la récupération de l'item",
      (error as Error).message
    );
  }
}

/**
 * PUT /api/menu/items/[id]
 * Met à jour un item
 * Accessible à : dev, admin
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<ApiResponse<MenuItemType>>> {
  const authResult = await requireAuth(["dev", "admin"]);
  if (!authResult.authorized) {
    return authResult.response;
  }

  await connectMongoose();

  try {
    const body = await request.json();

    // Vérifier que l'item existe
    const item = await MenuItem.findById(params.id);
    if (!item) {
      return errorResponse("Item introuvable", "Aucun item avec cet ID", 404);
    }

    // Si categoryId change, vérifier que la catégorie existe
    if (body.categoryId && body.categoryId !== item.category.toString()) {
      const category = await MenuCategory.findById(body.categoryId);
      if (!category) {
        return errorResponse(
          "Catégorie introuvable",
          "La catégorie spécifiée n'existe pas",
          400
        );
      }

      // Vérifier cohérence du type
      const newType = body.type || item.type;
      if (newType !== category.type) {
        return errorResponse(
          "Type incohérent",
          `Le type de l'item (${newType}) doit correspondre au type de la catégorie (${category.type})`,
          400
        );
      }
    }

    // Valider le type si fourni
    if (body.type && !["food", "drink", "grocery", "goodies"].includes(body.type)) {
      return errorResponse(
        "Type invalide",
        "type doit être 'food', 'drink', 'grocery' ou 'goodies'",
        400
      );
    }

    // Mettre à jour
    const updatedItem = await MenuItem.findByIdAndUpdate(
      params.id,
      {
        ...(body.name && { name: body.name }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.recipe !== undefined && { recipe: body.recipe }),
        ...(body.image !== undefined && { image: body.image }),
        ...(body.categoryId && { category: body.categoryId }),
        ...(body.type && { type: body.type }),
        ...(body.order !== undefined && { order: body.order }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
      },
      { new: true, runValidators: true }
    )
      .populate("category", "name slug")
      .lean();

    if (!updatedItem) {
      return errorResponse("Erreur lors de la mise à jour", "Item introuvable", 404);
    }

    const formattedItem: MenuItemType = {
      id: updatedItem._id.toString(),
      name: updatedItem.name,
      description: updatedItem.description,
      recipe: updatedItem.recipe,
      image: updatedItem.image,
      category: {
        id: (updatedItem.category as any)._id.toString(),
        name: (updatedItem.category as any).name,
        slug: (updatedItem.category as any).slug,
      },
      type: updatedItem.type,
      order: updatedItem.order,
      isActive: updatedItem.isActive,
      createdAt: updatedItem.createdAt.toISOString(),
      updatedAt: updatedItem.updatedAt.toISOString(),
    };

    // Invalider le cache du site pour ce type
    await revalidateMenuCache(updatedItem.type as ProduitsItemType);

    return successResponse(formattedItem, "Item mis à jour avec succès");
  } catch (error) {
    console.error(`PUT /api/menu/items/${params.id} error:`, error);
    return errorResponse(
      "Erreur lors de la mise à jour de l'item",
      (error as Error).message
    );
  }
}

/**
 * DELETE /api/menu/items/[id]
 * Supprime un item
 * Accessible à : dev, admin
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<ApiResponse<void>>> {
  const authResult = await requireAuth(["dev", "admin"]);
  if (!authResult.authorized) {
    return authResult.response;
  }

  await connectMongoose();

  try {
    const item = await MenuItem.findById(params.id);

    if (!item) {
      return errorResponse("Item introuvable", "Aucun item avec cet ID", 404);
    }

    // Sauvegarder le type pour invalider le cache après suppression
    const itemType = item.type;

    await MenuItem.findByIdAndDelete(params.id);

    // Invalider le cache du site pour ce type
    await revalidateMenuCache(itemType as ProduitsItemType);

    return successResponse(undefined, "Item supprimé avec succès");
  } catch (error) {
    console.error(`DELETE /api/menu/items/${params.id} error:`, error);
    return errorResponse(
      "Erreur lors de la suppression de l'item",
      (error as Error).message
    );
  }
}
