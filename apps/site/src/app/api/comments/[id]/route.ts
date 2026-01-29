import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "../../../../lib/db";
import { Comment } from '@coworking-cafe/database';
import { requireAuth, getAuthUser } from "../../../../lib/api-helpers";

// GET /api/comments/[id] - Get a single comment

// Force dynamic rendering (no static analysis at build time)
export const dynamic = 'force-dynamic';
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    await connectDB();

    const comment = await Comment.findOne({
      _id: params.id,
      deletedAt: null,
    })
      .populate("user", "username name email")
      .populate("parent", "content user")
      .lean();

    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    return NextResponse.json(comment);
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to fetch comment", details: error.message },
      { status: 500 },
    );
  }
}

// PATCH /api/comments/[id] - Update a comment (user can edit their own)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    await connectDB();

    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    const comment = await Comment.findOne({
      _id: params.id,
      deletedAt: null,
    });

    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    const isAdmin = ["admin", "staff", "dev"].includes(user.role?.slug || "");
    const isOwner = comment.user.toString() === user.id;

    // Only owner can edit their comment (within limits)
    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: "You can only edit your own comments" },
        { status: 403 },
      );
    }

    const body = await request.json();
    const { content } = body;

    if (content !== undefined) {
      if (!content.trim()) {
        return NextResponse.json(
          { error: "Comment content cannot be empty" },
          { status: 400 },
        );
      }
      if (content.length > 2000) {
        return NextResponse.json(
          { error: "Comment cannot exceed 2000 characters" },
          { status: 400 },
        );
      }
      comment.content = content;
      // Reset to pending if edited
      if (!isAdmin) {
        comment.status = "pending";
      }
    }

    await comment.save();

    const updatedComment = await Comment.findById(comment._id)
      .populate("user", "username name email")
      .populate("parent", "content user")
      .lean();

    return NextResponse.json(updatedComment);
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to update comment", details: error.message },
      { status: 500 },
    );
  }
}

// DELETE /api/comments/[id] - Delete a comment (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    await connectDB();

    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    const comment = await Comment.findOne({
      _id: params.id,
      deletedAt: null,
    });

    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    const isAdmin = ["admin", "staff", "dev"].includes(user.role?.slug || "");
    const isOwner = comment.user.toString() === user.id;

    // Owner or admin can delete
    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: "You can only delete your own comments" },
        { status: 403 },
      );
    }

    comment.deletedAt = new Date();
    await comment.save();

    return NextResponse.json({
      message: "Comment deleted successfully",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to delete comment", details: error.message },
      { status: 500 },
    );
  }
}
