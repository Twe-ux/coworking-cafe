import { NextRequest, NextResponse } from "next/server";
import connectDB from "../../../lib/db";
import Conversation from "../../../models/conversation";
import { getAuthUser } from "../../../lib/api-helpers";

/**
 * GET /api/conversations
 * Get all conversations for current user
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const conversations = await Conversation.find({
      "participants.user": user.id,
      isDeleted: false,
    })
      .populate("participants.user", "name email avatar")
      .populate("lastMessage")
      .sort({ lastMessageAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: conversations,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch conversations" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/conversations
 * Create a new conversation
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();
    const { participantIds, type = "direct", name, description } = body;

    // Validation
    if (
      !participantIds ||
      !Array.isArray(participantIds) ||
      participantIds.length === 0
    ) {
      return NextResponse.json(
        { error: "Participant IDs are required" },
        { status: 400 },
      );
    }

    // For direct conversations, check if one already exists
    if (type === "direct" && participantIds.length === 1) {
      const existingConversation = await Conversation.findOne({
        type: "direct",
        isDeleted: false,
        $and: [
          { "participants.user": user.id },
          { "participants.user": participantIds[0] },
        ],
      });

      if (existingConversation) {
        return NextResponse.json({
          success: true,
          data: existingConversation,
          message: "Conversation already exists",
        });
      }
    }

    // Create participants array
    const participants = [
      { user: user.id, joinedAt: new Date(), unreadCount: 0 },
      ...participantIds.map((id: string) => ({
        user: id,
        joinedAt: new Date(),
        unreadCount: 0,
      })),
    ];

    // Create conversation
    const conversation = await Conversation.create({
      type,
      participants,
      name: type === "group" ? name : undefined,
      description: type === "group" ? description : undefined,
      createdBy: type === "group" ? user.id : undefined,
    });

    const populatedConversation = await Conversation.findById(conversation._id)
      .populate("participants.user", "name email avatar")
      .lean();

    return NextResponse.json(
      {
        success: true,
        data: populatedConversation,
        message: "Conversation created successfully",
      },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create conversation" },
      { status: 500 },
    );
  }
}
