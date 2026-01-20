import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/api/auth"
import { successResponse, errorResponse } from "@/lib/api/response"
import { connectMongoose } from "@/lib/mongodb"
import { Comment } from "@/models/comment"
import type { ApiResponse } from "@/types/timeEntry"
import type { Comment as CommentType } from "@/types/blog"

// GET /api/blog/comments - Récupérer tous les commentaires avec filtres
export async function GET(
  request: NextRequest
): Promise<NextResponse<ApiResponse<{ comments: CommentType[]; total: number; page: number; pages: number }>>> {
  const authResult = await requireAuth(["dev", "admin", "staff"])
  if (!authResult.authorized) {
    return authResult.response
  }

  try {
    await connectMongoose()

    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const status = searchParams.get("status") || "all"
    const articleId = searchParams.get("articleId")

    const skip = (page - 1) * limit

    // Construire le filtre
    const filter: Record<string, unknown> = {}

    if (status !== "all") {
      filter.status = status
    }

    if (articleId) {
      filter.article = articleId
    }

    // Récupérer les commentaires
    const [comments, total] = await Promise.all([
      Comment.find(filter)
        .populate("user", "username name email avatar")
        .populate("article", "title slug")
        .populate("parent", "content user")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Comment.countDocuments(filter),
    ])

    const pages = Math.ceil(total / limit)

    return successResponse({
      comments: comments as unknown as CommentType[],
      total,
      page,
      pages,
    })
  } catch (error) {
    console.error("GET /api/blog/comments error:", error)
    return errorResponse(
      "Erreur lors de la récupération des commentaires",
      error instanceof Error ? error.message : "Erreur inconnue"
    )
  }
}
