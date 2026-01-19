import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/auth";
import { successResponse, errorResponse } from "@/lib/api/response";
import { connectMongoose } from "@/lib/mongodb";
import { MenuCategory } from "@coworking-cafe/database";
import type { ApiResponse, MenuCategory as MenuCategoryType } from "@/types/produits";

/**
 * GET /api/menu/categories/[id]
 * Récupère une catégorie par ID
 * Accessible à : dev, admin, staff
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<ApiResponse<MenuCategoryType>>> {
  const authResult = await requireAuth(["dev", "admin", "staff"]);
  if (!authResult.authorized) {
    return authResult.response;
  }

  await connectMongoose();

  try {
    const category = await MenuCategory.findById(params.id).lean();

    if (!category) {
      return errorResponse("Catégorie introuvable", "Aucune catégorie avec cet ID", 404);
    }

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

    return successResponse(formattedCategory, "Catégorie récupérée avec succès");
  } catch (error) {
    console.error(`GET /api/menu/categories/${params.id} error:`, error);
    return errorResponse(
      "Erreur lors de la récupération de la catégorie",
      (error as Error).message
    );
  }
}

/**
 * PUT /api/menu/categories/[id]
 * Met à jour une catégorie
 * Accessible à : dev, admin
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<ApiResponse<MenuCategoryType>>> {
  const authResult = await requireAuth(["dev", "admin"]);
  if (!authResult.authorized) {
    return authResult.response;
  }

  await connectMongoose();

  try {
    const body = await request.json();

    // Vérifier que la catégorie existe
    const category = await MenuCategory.findById(params.id);
    if (!category) {
      return errorResponse("Catégorie introuvable", "Aucune catégorie avec cet ID", 404);
    }

    // Si le slug change, vérifier l'unicité
    if (body.slug && body.slug !== category.slug) {
      const existingCategory = await MenuCategory.findOne({ slug: body.slug });
      if (existingCategory) {
        return errorResponse(
          "Slug déjà utilisé",
          "Une catégorie avec ce slug existe déjà",
          400
        );
      }
    }

    // Valider le type si fourni
    if (body.type && !["food", "drink"].includes(body.type)) {
      return errorResponse(
        "Type invalide",
        "type doit être 'food' ou 'drink'",
        400
      );
    }

    // Mettre à jour
    const updatedCategory = await MenuCategory.findByIdAndUpdate(
      params.id,
      {
        ...(body.name && { name: body.name }),
        ...(body.slug && { slug: body.slug }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.type && { type: body.type }),
        ...(body.order !== undefined && { order: body.order }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
        ...(body.showOnSite !== undefined && { showOnSite: body.showOnSite }),
      },
      { new: true, runValidators: true }
    ).lean();

    if (!updatedCategory) {
      return errorResponse("Erreur lors de la mise à jour", "Catégorie introuvable", 404);
    }

    const formattedCategory: MenuCategoryType = {
      id: updatedCategory._id.toString(),
      name: updatedCategory.name,
      slug: updatedCategory.slug,
      description: updatedCategory.description,
      type: updatedCategory.type,
      order: updatedCategory.order,
      isActive: updatedCategory.isActive,
      showOnSite: updatedCategory.showOnSite,
      createdAt: updatedCategory.createdAt.toISOString(),
      updatedAt: updatedCategory.updatedAt.toISOString(),
    };

    return successResponse(formattedCategory, "Catégorie mise à jour avec succès");
  } catch (error) {
    console.error(`PUT /api/menu/categories/${params.id} error:`, error);
    return errorResponse(
      "Erreur lors de la mise à jour de la catégorie",
      (error as Error).message
    );
  }
}

/**
 * DELETE /api/menu/categories/[id]
 * Supprime une catégorie
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
    const category = await MenuCategory.findById(params.id);

    if (!category) {
      return errorResponse("Catégorie introuvable", "Aucune catégorie avec cet ID", 404);
    }

    // Vérifier s'il y a des items liés (optionnel - à décommenter si besoin)
    // const MenuItem = (await import("@coworking-cafe/database")).MenuItem;
    // const itemsCount = await MenuItem.countDocuments({ category: params.id });
    // if (itemsCount > 0) {
    //   return errorResponse(
    //     "Suppression impossible",
    //     `Cette catégorie contient ${itemsCount} item(s). Supprimez-les d'abord.`,
    //     400
    //   );
    // }

    await MenuCategory.findByIdAndDelete(params.id);

    return successResponse(undefined, "Catégorie supprimée avec succès");
  } catch (error) {
    console.error(`DELETE /api/menu/categories/${params.id} error:`, error);
    return errorResponse(
      "Erreur lors de la suppression de la catégorie",
      (error as Error).message
    );
  }
}
