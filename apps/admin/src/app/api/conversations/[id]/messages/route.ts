import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/api/auth"
import { successResponse, errorResponse } from "@/lib/api/response"
import { connectMongoose } from "@/lib/mongodb"
import { Conversation } from "@/models/conversation"
import { Message } from "@/models/message"
import type { ApiResponse } from "@/types/timeEntry"
import type { Message as MessageType } from "@/types/messages"

interface RouteParams {
  params: {
    id: string
  }
}

// GET /api/conversations/[id]/messages - Récupérer les messages d'une conversation
// Force dynamic rendering (no static analysis at build time)
export const dynamic = 'force-dynamic';
export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<ApiResponse<MessageType[]>>> {
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

    // Récupérer les paramètres de pagination
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "50")
    const skip = (page - 1) * limit

    // Récupérer les messages
    const messages = await Message.find({
      conversation: conversationId,
      isDeleted: false,
    })
      .populate("sender", "name email avatar")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()

    return successResponse(messages as unknown as MessageType[])
  } catch (error) {
    console.error(`GET /api/conversations/${params.id}/messages error:`, error)
    return errorResponse(
      "Erreur lors de la récupération des messages",
      error instanceof Error ? error.message : "Erreur inconnue"
    )
  }
}

// POST /api/conversations/[id]/messages - Envoyer un message
export async function POST(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<ApiResponse<MessageType>>> {
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

    const body = await request.json()
    const { content, type = "text", attachments = [], replyTo } = body

    // Validation
    if (!content || content.trim() === "") {
      return errorResponse(
        "Données invalides",
        "content est requis et ne peut pas être vide",
        400
      )
    }

    // Créer le message
    const message = await Message.create({
      conversation: conversationId,
      sender: userId,
      content: content.trim(),
      type,
      attachments,
      replyTo,
      status: "sent",
      readBy: [{ user: userId, readAt: new Date() }],
    })

    // Mettre à jour la conversation
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: message._id,
      lastMessageAt: new Date(),
      $inc: {
        "participants.$[elem].unreadCount": 1,
      },
    }, {
      arrayFilters: [{ "elem.user": { $ne: userId } }],
    })

    // Populate le sender
    const populatedMessage = await Message.findById(message._id)
      .populate("sender", "name email avatar")
      .lean()

    return successResponse(
      populatedMessage as unknown as MessageType,
      "Message envoyé avec succès",
      201
    )
  } catch (error) {
    console.error(`POST /api/conversations/${params.id}/messages error:`, error)
    return errorResponse(
      "Erreur lors de l'envoi du message",
      error instanceof Error ? error.message : "Erreur inconnue"
    )
  }
}
