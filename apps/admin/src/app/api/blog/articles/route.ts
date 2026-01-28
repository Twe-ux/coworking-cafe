import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/api/auth"
import { successResponse, errorResponse } from "@/lib/api/response"
import { connectMongoose } from "@/lib/mongodb"
import { Article } from "@/models/article"
import { Category } from "@/models/category"
import type { ApiResponse } from "@/types/timeEntry"
import type { Article as ArticleType, ArticlesFilter } from "@/types/blog"

// GET /api/blog/articles - Récupérer tous les articles avec filtres
export async function GET(
  request: NextRequest
): Promise<NextResponse<ApiResponse<{ articles: ArticleType[]; total: number; page: number; pages: number }>>> {
  const authResult = await requireAuth(["dev", "admin", "staff"])
  if (!authResult.authorized) {
    return authResult.response
  }

  try {
    await connectMongoose()

    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const status = searchParams.get("status") || "all"
    const category = searchParams.get("category")
    const search = searchParams.get("search")
    const sortBy = searchParams.get("sortBy") || "createdAt"
    const sortOrder = searchParams.get("sortOrder") || "desc"

    const skip = (page - 1) * limit

    // Construire le filtre
    const filter: Record<string, unknown> = {}

    if (status !== "all") {
      filter.status = status
    }

    if (category) {
      filter.category = category
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
      ]
    }

    // Récupérer les articles
    const [articles, total] = await Promise.all([
      Article.find(filter)
        .populate("author", "username name email avatar")
        .populate("category", "name slug")
        .sort({ [sortBy]: sortOrder === "asc" ? 1 : -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Article.countDocuments(filter),
    ])

    const pages = Math.ceil(total / limit)

    return successResponse({
      articles: articles as unknown as ArticleType[],
      total,
      page,
      pages,
    })
  } catch (error) {
    console.error("GET /api/blog/articles error:", error)
    return errorResponse(
      "Erreur lors de la récupération des articles",
      error instanceof Error ? error.message : "Erreur inconnue"
    )
  }
}

// POST /api/blog/articles - Créer un article
export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse<ArticleType>>> {
  const authResult = await requireAuth(["dev", "admin"])
  if (!authResult.authorized) {
    return authResult.response
  }

  const userId = authResult.session.user.id

  try {
    await connectMongoose()

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

    // Validation
    if (!title || !content) {
      return errorResponse(
        "Données invalides",
        "title et content sont requis",
        400
      )
    }

    // Vérifier que la catégorie existe
    if (categoryId) {
      const categoryExists = await Category.findById(categoryId)
      if (!categoryExists) {
        return errorResponse("Catégorie non trouvée", "categoryId invalide", 404)
      }
    }

    // Générer le slug depuis le titre
    const baseSlug = title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Enlever les accents
      .replace(/[^a-z0-9]+/g, "-") // Remplacer caractères spéciaux par -
      .replace(/^-+|-+$/g, "") // Enlever - au début/fin

    // Vérifier l'unicité du slug
    let slug = baseSlug
    let counter = 1
    while (await Article.findOne({ slug })) {
      slug = `${baseSlug}-${counter}`
      counter++
    }

    // Créer l'article
    const article = await Article.create({
      title,
      slug,
      content,
      excerpt,
      featuredImage,
      author: userId,
      category: categoryId || null,
      status: status || "draft",
      publishedAt: status === "published" ? new Date() : null,
      metaTitle,
      metaDescription,
      metaKeywords: metaKeywords || [],
      ogImage,
    })

    // Incrémenter articleCount de la catégorie
    if (categoryId) {
      await Category.findByIdAndUpdate(categoryId, { $inc: { articleCount: 1 } })
    }

    // Populate et retourner
    const populatedArticle = await Article.findById(article._id)
      .populate("author", "username name email avatar")
      .populate("category", "name slug")
      .lean()

    return successResponse(
      populatedArticle as unknown as ArticleType,
      "Article créé avec succès",
      201
    )
  } catch (error) {
    console.error("POST /api/blog/articles error:", error)
    return errorResponse(
      "Erreur lors de la création de l'article",
      error instanceof Error ? error.message : "Erreur inconnue"
    )
  }
}
