import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Conversation from "@/models/conversation";
import Message from "@/models/message";
import { getAuthUser } from "@/lib/api-helpers";

/**
 * POST /api/conversations/[id]/read
 * Mark all messages in a conversation as read
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

    const now = new Date();

    // Update all unread messages in conversation
    await Message.updateMany(
      {
        conversation: params.id,
        sender: { $ne: user.id }, // Don't mark own messages
        "readBy.user": { $ne: user.id }, // Only messages not already read
        isDeleted: false,
      },
      {
        $push: {
          readBy: {
            user: user.id,
            readAt: now,
          },
        },
        $set: {
          status: "read",
        },
      }
    );

    // Reset unread count for user in conversation
    await Conversation.updateOne(
      {
        _id: params.id,
        "participants.user": user.id,
      },
      {
        $set: {
          "participants.$.unreadCount": 0,
          "participants.$.lastReadAt": now,
        },
      }
    );

    return NextResponse.json({
      success: true,
      message: "Messages marked as read",
    });
  } catch (error) {    return NextResponse.json(
      { error: "Failed to mark messages as read" },
      { status: 500 }
    );
  }
}
