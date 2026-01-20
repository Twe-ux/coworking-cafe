import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/api/auth"
import { successResponse, errorResponse } from "@/lib/api/response"
import { connectMongoose } from "@/lib/mongodb"
import { Comment } from "@/models/comment"
import type { ApiResponse } from "@/types/timeEntry"
import type { Comment as CommentType } from "@/types/blog"

// GET /api/blog/comments/[id] - Récupérer un commentaire
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<ApiResponse<CommentType>>> {
  const authResult = await requireAuth(["dev", "admin", "staff"])
  if (!authResult.authorized) {
    return authResult.response
  }

  try {
    await connectMongoose()

    const comment = await Comment.findById(params.id)
      .populate("user", "username name email avatar")
      .populate("article", "title slug")
      .populate("parent", "content user")
      .lean()

    if (!comment) {
      return errorResponse("Commentaire non trouvé", "ID invalide", 404)
    }

    return successResponse(comment as unknown as CommentType)
  } catch (error) {
    console.error(`GET /api/blog/comments/${params.id} error:`, error)
    return errorResponse(
      "Erreur lors de la récupération du commentaire",
      error instanceof Error ? error.message : "Erreur inconnue"
    )
  }
}

// PUT /api/blog/comments/[id] - Mettre à jour un commentaire (modération)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<ApiResponse<CommentType>>> {
  const authResult = await requireAuth(["dev", "admin"])
  if (!authResult.authorized) {
    return authResult.response
  }

  try {
    await connectMongoose()

    const existingComment = await Comment.findById(params.id)
    if (!existingComment) {
      return errorResponse("Commentaire non trouvé", "ID invalide", 404)
    }

    const body = await request.json()
    const { status, content } = body

    // Mettre à jour le commentaire
    const updateData: Record<string, unknown> = {}
    if (status !== undefined) updateData.status = status
    if (content !== undefined) updateData.content = content

    const updatedComment = await Comment.findByIdAndUpdate(
      params.id,
      { $set: updateData },
      { new: true }
    )
      .populate("user", "username name email avatar")
      .populate("article", "title slug")
      .populate("parent", "content user")
      .lean()

    return successResponse(
      updatedComment as unknown as CommentType,
      "Commentaire mis à jour avec succès"
    )
  } catch (error) {
    console.error(`PUT /api/blog/comments/${params.id} error:`, error)
    return errorResponse(
      "Erreur lors de la mise à jour du commentaire",
      error instanceof Error ? error.message : "Erreur inconnue"
    )
  }
}

// DELETE /api/blog/comments/[id] - Supprimer un commentaire
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

    const comment = await Comment.findById(params.id)
    if (!comment) {
      return errorResponse("Commentaire non trouvé", "ID invalide", 404)
    }

    // Supprimer aussi les réponses (comments enfants)
    await Comment.deleteMany({ parent: params.id })

    // Supprimer le commentaire
    await Comment.findByIdAndDelete(params.id)

    return successResponse({ id: params.id }, "Commentaire supprimé avec succès")
  } catch (error) {
    console.error(`DELETE /api/blog/comments/${params.id} error:`, error)
    return errorResponse(
      "Erreur lors de la suppression du commentaire",
      error instanceof Error ? error.message : "Erreur inconnue"
    )
  }
}
