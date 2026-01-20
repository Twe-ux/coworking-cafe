import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/api/auth"
import { successResponse, errorResponse } from "@/lib/api/response"
import { connectMongoose } from "@/lib/mongodb"
import { Conversation } from "@/models/conversation"
import type { ApiResponse } from "@/types/timeEntry"
import type { Conversation as ConversationType } from "@/types/messages"

// GET /api/conversations - Récupérer toutes les conversations de l'utilisateur
export async function GET(
  request: NextRequest
): Promise<NextResponse<ApiResponse<ConversationType[]>>> {
  const authResult = await requireAuth(["dev", "admin", "staff"])
  if (!authResult.authorized) {
    return authResult.response
  }

  const userId = authResult.session.user.id

  try {
    await connectMongoose()

    const conversations = await Conversation.find({
      "participants.user": userId,
      isDeleted: false,
    })
      .populate("participants.user", "name email avatar")
      .populate("lastMessage")
      .sort({ lastMessageAt: -1 })
      .lean()

    return successResponse(conversations as unknown as ConversationType[])
  } catch (error) {
    console.error("GET /api/conversations error:", error)
    return errorResponse(
      "Erreur lors de la récupération des conversations",
      error instanceof Error ? error.message : "Erreur inconnue"
    )
  }
}

// POST /api/conversations - Créer une nouvelle conversation
export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse<ConversationType>>> {
  const authResult = await requireAuth(["dev", "admin", "staff"])
  if (!authResult.authorized) {
    return authResult.response
  }

  const userId = authResult.session.user.id

  try {
    await connectMongoose()

    const body = await request.json()
    const { participantIds, type, name, description } = body

    // Validation
    if (!participantIds || !Array.isArray(participantIds)) {
      return errorResponse(
        "Données invalides",
        "participantIds est requis et doit être un tableau",
        400
      )
    }

    if (!type || !["direct", "group"].includes(type)) {
      return errorResponse(
        "Données invalides",
        "type est requis et doit être 'direct' ou 'group'",
        400
      )
    }

    // Ajouter l'utilisateur courant aux participants s'il n'y est pas
    const allParticipantIds = Array.from(
      new Set([userId, ...participantIds])
    )

    // Pour les conversations directes, vérifier si elle existe déjà
    if (type === "direct" && allParticipantIds.length === 2) {
      const existingConversation = await Conversation.findOne({
        type: "direct",
        "participants.user": { $all: allParticipantIds },
      })
        .populate("participants.user", "name email avatar")
        .populate("lastMessage")
        .lean()

      if (existingConversation) {
        return successResponse(
          existingConversation as unknown as ConversationType,
          "Conversation existante trouvée"
        )
      }
    }

    // Créer la nouvelle conversation
    const conversation = await Conversation.create({
      type,
      participants: allParticipantIds.map((id) => ({
        user: id,
        joinedAt: new Date(),
        unreadCount: 0,
      })),
      name: type === "group" ? name : undefined,
      description: type === "group" ? description : undefined,
      createdBy: userId,
    })

    const populatedConversation = await Conversation.findById(conversation._id)
      .populate("participants.user", "name email avatar")
      .populate("lastMessage")
      .lean()

    return successResponse(
      populatedConversation as unknown as ConversationType,
      "Conversation créée avec succès",
      201
    )
  } catch (error) {
    console.error("POST /api/conversations error:", error)
    return errorResponse(
      "Erreur lors de la création de la conversation",
      error instanceof Error ? error.message : "Erreur inconnue"
    )
  }
}
