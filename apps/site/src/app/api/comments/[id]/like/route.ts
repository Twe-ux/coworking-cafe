import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "../../../../../lib/mongodb";
import { Comment } from "../../../../../models/comment";
import CommentLike from "../../../../../models/commentLike";
import { getAuthUser, handleApiError } from "../../../../../lib/api-helpers";

// Force dynamic rendering
export const dynamic = "force-dynamic";

/**
 * GET /api/comments/[id]/like
 * Check if current user liked this comment
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    await connectDB();

    const { id } = params;
    const user = await getAuthUser();

    if (!user) {
      return NextResponse.json({ liked: false });
    }

    const like = await CommentLike.findOne({
      user: user.id,
      comment: id,
    }).lean();

    return NextResponse.json({ liked: !!like });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST /api/comments/[id]/like
 * Like a comment (authenticated users only)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    await connectDB();

    const { id } = params;
    const user = await getAuthUser();

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    // Check if comment exists and is approved
    const comment = await Comment.findOne({
      _id: id,
      status: "approved",
      deletedAt: null,
    });

    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    // Check if already liked
    const existingLike = await CommentLike.findOne({
      user: user.id,
      comment: id,
    });

    if (existingLike) {
      return NextResponse.json(
        { error: "Comment already liked" },
        { status: 400 },
      );
    }

    // Create like
    await CommentLike.create({
      user: user.id,
      comment: id,
    });

    // Increment like count
    await Comment.findByIdAndUpdate(id, {
      $inc: { likeCount: 1 },
    });

    // Get updated like count
    const updatedComment = await Comment.findById(id)
      .select("likeCount")
      .lean();

    return NextResponse.json({
      success: true,
      liked: true,
      likeCount: updatedComment?.likeCount || 0,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * DELETE /api/comments/[id]/like
 * Unlike a comment
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    await connectDB();

    const { id } = params;
    const user = await getAuthUser();

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    // Delete like
    const result = await CommentLike.findOneAndDelete({
      user: user.id,
      comment: id,
    });

    if (!result) {
      return NextResponse.json({ error: "Like not found" }, { status: 404 });
    }

    // Decrement like count
    await Comment.findByIdAndUpdate(id, {
      $inc: { likeCount: -1 },
    });

    // Get updated like count
    const updatedComment = await Comment.findById(id)
      .select("likeCount")
      .lean();

    return NextResponse.json({
      success: true,
      liked: false,
      likeCount: updatedComment?.likeCount || 0,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
