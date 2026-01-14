import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import ArticleRevision from '@/models/articleRevision';
import { requireAuth, handleApiError } from '@/lib/api-helpers';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

/**
 * GET /api/articles/id/[id]/revisions
 * Get all revisions for an article
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    await requireAuth(['admin', 'staff', 'dev']);

    await connectDB();

    const { id } = params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const [revisions, total] = await Promise.all([
      ArticleRevision.find({ article: id })
        .sort({ revisionNumber: -1 })
        .skip(skip)
        .limit(limit)
        .populate('author', 'username name email')
        .populate('category', 'name slug')
        .lean(),
      ArticleRevision.countDocuments({ article: id }),
    ]);

    return NextResponse.json({
      revisions,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
