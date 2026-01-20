import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/api/auth"
import { successResponse, errorResponse } from "@/lib/api/response"
import { connectMongoose } from "@/lib/mongodb"
import { Category } from "@/models/category"
import type { ApiResponse } from "@/types/timeEntry"
import type { Category as CategoryType } from "@/types/blog"

// GET /api/blog/categories - Récupérer toutes les catégories
export async function GET(
  request: NextRequest
): Promise<NextResponse<ApiResponse<CategoryType[]>>> {
  const authResult = await requireAuth(["dev", "admin", "staff"])
  if (!authResult.authorized) {
    return authResult.response
  }

  try {
    await connectMongoose()

    const searchParams = request.nextUrl.searchParams
    const includeInactive = searchParams.get("includeInactive") === "true"

    const filter = includeInactive ? {} : { isActive: true }

    const categories = await Category.find(filter)
      .populate("parent", "name slug")
      .sort({ name: 1 })
      .lean()

    return successResponse(categories as unknown as CategoryType[])
  } catch (error) {
    console.error("GET /api/blog/categories error:", error)
    return errorResponse(
      "Erreur lors de la récupération des catégories",
      error instanceof Error ? error.message : "Erreur inconnue"
    )
  }
}

// POST /api/blog/categories - Créer une catégorie
export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse<CategoryType>>> {
  const authResult = await requireAuth(["dev", "admin"])
  if (!authResult.authorized) {
    return authResult.response
  }

  try {
    await connectMongoose()

    const body = await request.json()
    const { name, description, parentId, color } = body

    // Validation
    if (!name) {
      return errorResponse("Données invalides", "name est requis", 400)
    }

    // Vérifier que le parent existe si fourni
    if (parentId) {
      const parentExists = await Category.findById(parentId)
      if (!parentExists) {
        return errorResponse("Parent non trouvé", "parentId invalide", 404)
      }
    }

    // Créer la catégorie
    const category = await Category.create({
      name,
      description,
      parent: parentId || null,
      color,
    })

    // Populate et retourner
    const populatedCategory = await Category.findById(category._id)
      .populate("parent", "name slug")
      .lean()

    return successResponse(
      populatedCategory as unknown as CategoryType,
      "Catégorie créée avec succès",
      201
    )
  } catch (error) {
    console.error("POST /api/blog/categories error:", error)
    return errorResponse(
      "Erreur lors de la création de la catégorie",
      error instanceof Error ? error.message : "Erreur inconnue"
    )
  }
}
