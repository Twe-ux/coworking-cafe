import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/api/auth"
import { successResponse, errorResponse } from "@/lib/api/response"
import { connectMongoose } from "@/lib/mongodb"
import { Article } from "@/models/article"
import { Category } from "@/models/category"
import type { ApiResponse } from "@/types/timeEntry"
import type { Article as ArticleType } from "@/types/blog"

// GET /api/blog/articles/[id] - Récupérer un article
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<ApiResponse<ArticleType>>> {
  const authResult = await requireAuth(["dev", "admin", "staff"])
  if (!authResult.authorized) {
    return authResult.response
  }

  try {
    await connectMongoose()

    const article = await Article.findById(params.id)
      .populate("author", "username name email avatar")
      .populate("category", "name slug")
      .lean()

    if (!article) {
      return errorResponse("Article non trouvé", "ID invalide", 404)
    }

    return successResponse(article as unknown as ArticleType)
  } catch (error) {
    console.error(`GET /api/blog/articles/${params.id} error:`, error)
    return errorResponse(
      "Erreur lors de la récupération de l'article",
      error instanceof Error ? error.message : "Erreur inconnue"
    )
  }
}

// PUT /api/blog/articles/[id] - Mettre à jour un article
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<ApiResponse<ArticleType>>> {
  const authResult = await requireAuth(["dev", "admin"])
  if (!authResult.authorized) {
    return authResult.response
  }

  try {
    await connectMongoose()

    const existingArticle = await Article.findById(params.id)
    if (!existingArticle) {
      return errorResponse("Article non trouvé", "ID invalide", 404)
    }

    const body = await request.json()
    const {
      title,
      content,
      excerpt,
      featuredImage,
      categoryId,
      status,
      metaTitle,
      metaDescription,
      metaKeywords,
      ogImage,
    } = body

    // Vérifier que la catégorie existe si fournie
    if (categoryId) {
      const categoryExists = await Category.findById(categoryId)
      if (!categoryExists) {
        return errorResponse("Catégorie non trouvée", "categoryId invalide", 404)
      }
    }

    // Gérer les changements de catégorie
    const oldCategoryId = existingArticle.category?.toString()
    const newCategoryId = categoryId || null

    if (oldCategoryId !== newCategoryId) {
      // Décrémenter l'ancienne catégorie
      if (oldCategoryId) {
        await Category.findByIdAndUpdate(oldCategoryId, { $inc: { articleCount: -1 } })
      }
      // Incrémenter la nouvelle catégorie
      if (newCategoryId) {
        await Category.findByIdAndUpdate(newCategoryId, { $inc: { articleCount: 1 } })
      }
    }

    // Mettre à jour l'article
    const updateData: Record<string, unknown> = {}
    if (title !== undefined) updateData.title = title
    if (content !== undefined) updateData.content = content
    if (excerpt !== undefined) updateData.excerpt = excerpt
    if (featuredImage !== undefined) updateData.featuredImage = featuredImage
    if (categoryId !== undefined) updateData.category = categoryId || null
    if (status !== undefined) {
      updateData.status = status
      // Si on publie l'article et qu'il n'a pas de publishedAt, on le définit
      if (status === "published" && !existingArticle.publishedAt) {
        updateData.publishedAt = new Date()
      }
    }
    if (metaTitle !== undefined) updateData.metaTitle = metaTitle
    if (metaDescription !== undefined) updateData.metaDescription = metaDescription
    if (metaKeywords !== undefined) updateData.metaKeywords = metaKeywords
    if (ogImage !== undefined) updateData.ogImage = ogImage

    const updatedArticle = await Article.findByIdAndUpdate(
      params.id,
      { $set: updateData },
      { new: true }
    )
      .populate("author", "username name email avatar")
      .populate("category", "name slug")
      .lean()

    return successResponse(updatedArticle as unknown as ArticleType, "Article mis à jour avec succès")
  } catch (error) {
    console.error(`PUT /api/blog/articles/${params.id} error:`, error)
    return errorResponse(
      "Erreur lors de la mise à jour de l'article",
      error instanceof Error ? error.message : "Erreur inconnue"
    )
  }
}

// DELETE /api/blog/articles/[id] - Supprimer un article
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

    const article = await Article.findById(params.id)
    if (!article) {
      return errorResponse("Article non trouvé", "ID invalide", 404)
    }

    // Décrémenter articleCount de la catégorie
    if (article.category) {
      await Category.findByIdAndUpdate(article.category, { $inc: { articleCount: -1 } })
    }

    // Supprimer l'article
    await Article.findByIdAndDelete(params.id)

    return successResponse({ id: params.id }, "Article supprimé avec succès")
  } catch (error) {
    console.error(`DELETE /api/blog/articles/${params.id} error:`, error)
    return errorResponse(
      "Erreur lors de la suppression de l'article",
      error instanceof Error ? error.message : "Erreur inconnue"
    )
  }
}
