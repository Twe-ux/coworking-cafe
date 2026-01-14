import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Article from '@/models/article';
import { handleApiError } from '@/lib/api-helpers';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

/**
 * POST /api/articles/[slug]/view
 * Increment view count
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    await connectDB();

    const { slug } = params;

    const article = await Article.findOneAndUpdate(
      { slug, status: 'published', isDeleted: false },
      { $inc: { viewCount: 1 } },
      { new: true }
    ).select('viewCount');

    if (!article) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ viewCount: article.viewCount });
  } catch (error) {
    return handleApiError(error);
  }
}
