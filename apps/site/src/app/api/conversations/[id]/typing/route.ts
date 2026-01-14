import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Conversation from "@/models/conversation";
import { getAuthUser } from "@/lib/api-helpers";

// In-memory store for typing indicators (in production, use Redis)
const typingUsers = new Map<string, Map<string, number>>();

// Clean up old typing indicators (older than 5 seconds)
setInterval(() => {
  const now = Date.now();
  for (const [conversationId, users] of typingUsers.entries()) {
    for (const [userId, timestamp] of users.entries()) {
      if (now - timestamp > 5000) {
        users.delete(userId);
      }
    }
    if (users.size === 0) {
      typingUsers.delete(conversationId);
    }
  }
}, 1000);

/**
 * POST /api/conversations/[id]/typing
 * Set typing indicator for current user in conversation
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
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
        { status: 404 }
      );
    }

    const { isTyping } = await request.json();

    if (isTyping) {
      // Set typing indicator
      if (!typingUsers.has(params.id)) {
        typingUsers.set(params.id, new Map());
      }
      typingUsers.get(params.id)!.set(user.id, Date.now());
    } else {
      // Remove typing indicator
      typingUsers.get(params.id)?.delete(user.id);
    }

    return NextResponse.json({
      success: true,
      message: "Typing status updated",
    });
  } catch (error) {    return NextResponse.json(
      { error: "Failed to update typing status" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/conversations/[id]/typing
 * Get typing indicators for a conversation
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
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
        { status: 404 }
      );
    }

    const conversationTyping = typingUsers.get(params.id);
    const typingUserIds: string[] = [];

    if (conversationTyping) {
      const now = Date.now();
      for (const [userId, timestamp] of conversationTyping.entries()) {
        // Only include users who have typed in the last 5 seconds and are not the current user
        if (now - timestamp <= 5000 && userId !== user.id) {
          typingUserIds.push(userId);
        }
      }
    }

    return NextResponse.json({
      success: true,
      typingUsers: typingUserIds,
    });
  } catch (error) {    return NextResponse.json(
      { error: "Failed to get typing status" },
      { status: 500 }
    );
  }
}
