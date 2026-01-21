import { NextRequest, NextResponse } from "next/server";
import connectDB from "../../../../../lib/db";
import Conversation from "../../../../../models/conversation";
import Message from "../../../../../models/message";
import { getAuthUser } from "../../../../../lib/api-helpers";

/**
 * GET /api/conversations/[id]/messages
 * Get all messages in a conversation (with pagination)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Check if user is participant
    const conversation = await Conversation.findOne({
      _id: params.id,
      "participants.user": user.id,
      isDeleted: false,
    });

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found or access denied" },
        { status: 404 },
      );
    }

    // Pagination
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const skip = (page - 1) * limit;

    const messages = await Message.find({
      conversation: params.id,
      isDeleted: false,
    })
      .populate("sender", "name email avatar")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Message.countDocuments({
      conversation: params.id,
      isDeleted: false,
    });

    return NextResponse.json({
      success: true,
      data: messages.reverse(), // Reverse to get chronological order
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/conversations/[id]/messages
 * Send a message in a conversation
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Check if user is participant
    const conversation = await Conversation.findOne({
      _id: params.id,
      "participants.user": user.id,
      isDeleted: false,
    });

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found or access denied" },
        { status: 404 },
      );
    }

    const body = await request.json();
    const { content, type = "text", attachments = [], replyTo } = body;

    // Validation
    if (!content || content.trim() === "") {
      return NextResponse.json(
        { error: "Message content is required" },
        { status: 400 },
      );
    }

    // Create message
    const message = await Message.create({
      conversation: params.id,
      sender: user.id,
      content: content.trim(),
      type,
      attachments,
      replyTo,
      status: "sent",
    });

    // Update conversation
    await Conversation.findByIdAndUpdate(
      params.id,
      {
        lastMessage: message._id,
        lastMessageAt: message.createdAt,
        // Increment unread count for all participants except sender
        $inc: {
          "participants.$[participant].unreadCount": 1,
        },
      },
      {
        arrayFilters: [{ "participant.user": { $ne: user.id } }],
      },
    );

    const populatedMessage = await Message.findById(message._id)
      .populate("sender", "name email avatar")
      .lean();

    return NextResponse.json(
      {
        success: true,
        data: populatedMessage,
        message: "Message sent successfully",
      },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 },
    );
  }
}
