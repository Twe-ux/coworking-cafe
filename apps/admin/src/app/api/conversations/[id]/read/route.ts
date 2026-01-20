import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/api/auth"
import { successResponse, errorResponse } from "@/lib/api/response"
import { connectMongoose } from "@/lib/mongodb"
import { Conversation } from "@/models/conversation"
import { Message } from "@/models/message"
import type { ApiResponse } from "@/types/timeEntry"

interface RouteParams {
  params: {
    id: string
  }
}

// POST /api/conversations/[id]/read - Marquer tous les messages comme lus
export async function POST(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<ApiResponse<{ success: boolean }>>> {
  const authResult = await requireAuth(["dev", "admin", "staff"])
  if (!authResult.authorized) {
    return authResult.response
  }

  const userId = authResult.session.user.id
  const { id: conversationId } = params

  try {
    await connectMongoose()

    // Vérifier que l'utilisateur est participant de la conversation
    const conversation = await Conversation.findOne({
      _id: conversationId,
      "participants.user": userId,
      isDeleted: false,
    })

    if (!conversation) {
      return errorResponse("Conversation non trouvée", "Accès refusé", 404)
    }

    // Mettre à jour tous les messages non lus
    await Message.updateMany(
      {
        conversation: conversationId,
        "readBy.user": { $ne: userId },
        isDeleted: false,
      },
      {
        $push: {
          readBy: {
            user: userId,
            readAt: new Date(),
          },
        },
      }
    )

    // Mettre à jour le unreadCount du participant
    await Conversation.updateOne(
      {
        _id: conversationId,
        "participants.user": userId,
      },
      {
        $set: {
          "participants.$.unreadCount": 0,
          "participants.$.lastReadAt": new Date(),
        },
      }
    )

    return successResponse(
      { success: true },
      "Messages marqués comme lus"
    )
  } catch (error) {
    console.error(`POST /api/conversations/${params.id}/read error:`, error)
    return errorResponse(
      "Erreur lors du marquage comme lu",
      error instanceof Error ? error.message : "Erreur inconnue"
    )
  }
}
