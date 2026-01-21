import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "../../../../../lib/db";
import { Comment } from '@coworking-cafe/database';
import { requireAuth } from "../../../../../lib/api-helpers";

// POST /api/comments/[id]/approve - Approve or reject a comment (admin only)
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    await connectDB();

    await requireAuth(["admin", "staff", "dev"]);

    const body = await request.json();
    const { status } = body;

    if (!status || !["approved", "rejected", "spam"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status. Must be: approved, rejected, or spam" },
        { status: 400 },
      );
    }

    const comment = await Comment.findOne({
      _id: params.id,
      deletedAt: null,
    });

    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    comment.status = status;
    await comment.save();

    const updatedComment = await Comment.findById(comment._id)
      .populate("user", "username name email")
      .populate("parent", "content user")
      .lean();

    return NextResponse.json(updatedComment);
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to update comment status", details: error.message },
      { status: 500 },
    );
  }
}
