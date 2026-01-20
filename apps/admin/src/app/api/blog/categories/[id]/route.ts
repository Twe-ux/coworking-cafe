import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/api/auth"
import { successResponse, errorResponse } from "@/lib/api/response"
import { connectMongoose } from "@/lib/mongodb"
import { Category } from "@/models/category"
import type { ApiResponse } from "@/types/timeEntry"
import type { Category as CategoryType } from "@/types/blog"

// GET /api/blog/categories/[id] - Récupérer une catégorie
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<ApiResponse<CategoryType>>> {
  const authResult = await requireAuth(["dev", "admin", "staff"])
  if (!authResult.authorized) {
    return authResult.response
  }

  try {
    await connectMongoose()

    const category = await Category.findById(params.id)
      .populate("parent", "name slug")
      .lean()

    if (!category) {
      return errorResponse("Catégorie non trouvée", "ID invalide", 404)
    }

    return successResponse(category as unknown as CategoryType)
  } catch (error) {
    console.error(`GET /api/blog/categories/${params.id} error:`, error)
    return errorResponse(
      "Erreur lors de la récupération de la catégorie",
      error instanceof Error ? error.message : "Erreur inconnue"
    )
  }
}

// PUT /api/blog/categories/[id] - Mettre à jour une catégorie
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<ApiResponse<CategoryType>>> {
  const authResult = await requireAuth(["dev", "admin"])
  if (!authResult.authorized) {
    return authResult.response
  }

  try {
    await connectMongoose()

    const existingCategory = await Category.findById(params.id)
    if (!existingCategory) {
      return errorResponse("Catégorie non trouvée", "ID invalide", 404)
    }

    const body = await request.json()
    const { name, description, parentId, color, isActive } = body

    // Vérifier que le parent existe si fourni
    if (parentId) {
      const parentExists = await Category.findById(parentId)
      if (!parentExists) {
        return errorResponse("Parent non trouvé", "parentId invalide", 404)
      }

      // Empêcher une catégorie d'être son propre parent
      if (parentId === params.id) {
        return errorResponse(
          "Parent invalide",
          "Une catégorie ne peut pas être son propre parent",
          400
        )
      }
    }

    // Mettre à jour la catégorie
    const updateData: Record<string, unknown> = {}
    if (name !== undefined) updateData.name = name
    if (description !== undefined) updateData.description = description
    if (parentId !== undefined) updateData.parent = parentId || null
    if (color !== undefined) updateData.color = color
    if (isActive !== undefined) updateData.isActive = isActive

    const updatedCategory = await Category.findByIdAndUpdate(
      params.id,
      { $set: updateData },
      { new: true }
    )
      .populate("parent", "name slug")
      .lean()

    return successResponse(
      updatedCategory as unknown as CategoryType,
      "Catégorie mise à jour avec succès"
    )
  } catch (error) {
    console.error(`PUT /api/blog/categories/${params.id} error:`, error)
    return errorResponse(
      "Erreur lors de la mise à jour de la catégorie",
      error instanceof Error ? error.message : "Erreur inconnue"
    )
  }
}

// DELETE /api/blog/categories/[id] - Supprimer une catégorie
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<ApiResponse<{ id: string }>>> {
  const authResult = await requireAuth(["dev", "admin"])
  if (!authResult.authorized) {
    return authResult.response
  }

  try {
    await connectMongoose()

    const category = await Category.findById(params.id)
    if (!category) {
      return errorResponse("Catégorie non trouvée", "ID invalide", 404)
    }

    // Vérifier s'il y a des articles dans cette catégorie
    if (category.articleCount > 0) {
      return errorResponse(
        "Suppression impossible",
        `Cette catégorie contient ${category.articleCount} article(s). Veuillez d'abord déplacer ou supprimer ces articles.`,
        400
      )
    }

    // Supprimer la catégorie
    await Category.findByIdAndDelete(params.id)

    return successResponse({ id: params.id }, "Catégorie supprimée avec succès")
  } catch (error) {
    console.error(`DELETE /api/blog/categories/${params.id} error:`, error)
    return errorResponse(
      "Erreur lors de la suppression de la catégorie",
      error instanceof Error ? error.message : "Erreur inconnue"
    )
  }
}
