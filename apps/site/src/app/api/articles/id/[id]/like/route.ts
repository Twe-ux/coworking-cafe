import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Article from '@/models/article';
import ArticleLike from '@/models/articleLike';
import { getAuthUser, handleApiError } from '@/lib/api-helpers';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

/**
 * GET /api/articles/id/[id]/like
 * Check if current user liked this article
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const { id } = params;
    const user = await getAuthUser();

    if (!user) {
      return NextResponse.json({ liked: false });
    }

    const like = await ArticleLike.findOne({
      user: user.id,
      article: id,
    }).lean();

    return NextResponse.json({ liked: !!like });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST /api/articles/id/[id]/like
 * Like an article (authenticated users only)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const { id } = params;
    const user = await getAuthUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if article exists and is published
    const article = await Article.findOne({
      _id: id,
      status: 'published',
      isDeleted: false,
    });

    if (!article) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }

    // Check if already liked
    const existingLike = await ArticleLike.findOne({
      user: user.id,
      article: id,
    });

    if (existingLike) {
      return NextResponse.json(
        { error: 'Article already liked' },
        { status: 400 }
      );
    }

    // Create like
    await ArticleLike.create({
      user: user.id,
      article: id,
    });

    // Increment like count
    await Article.findByIdAndUpdate(id, {
      $inc: { likeCount: 1 },
    });

    // Get updated like count
    const updatedArticle = await Article.findById(id).select('likeCount').lean();

    return NextResponse.json({
      success: true,
      liked: true,
      likeCount: updatedArticle?.likeCount || 0,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * DELETE /api/articles/id/[id]/like
 * Unlike an article
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const { id } = params;
    const user = await getAuthUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Delete like
    const result = await ArticleLike.findOneAndDelete({
      user: user.id,
      article: id,
    });

    if (!result) {
      return NextResponse.json(
        { error: 'Like not found' },
        { status: 404 }
      );
    }

    // Decrement like count
    await Article.findByIdAndUpdate(id, {
      $inc: { likeCount: -1 },
    });

    // Get updated like count
    const updatedArticle = await Article.findById(id).select('likeCount').lean();

    return NextResponse.json({
      success: true,
      liked: false,
      likeCount: updatedArticle?.likeCount || 0,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
