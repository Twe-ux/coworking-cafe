import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Comment } from '@/models/comment';
import { getAuthUser } from '@/lib/api-helpers';

// GET /api/comments?article=xxx&status=xxx - Get comments
// If no article ID provided, returns all comments (admin only)
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const articleId = searchParams.get('article');
    const status = searchParams.get('status') || 'approved';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    const user = await getAuthUser();
    const isAdmin = user && ['admin', 'staff', 'dev'].includes(user.role?.slug || '');

    // If no articleId and user is not admin, return error
    if (!articleId && !isAdmin) {
      return NextResponse.json(
        { error: 'Article ID is required' },
        { status: 400 }
      );
    }

    const query: any = {
      deletedAt: null,
      parent: null, // Only top-level comments
    };

    // Add article filter if provided
    if (articleId) {
      query.article = articleId;
    }

    // Only show approved comments to non-admin users
    if (!isAdmin) {
      query.status = 'approved';
    } else if (status !== 'all') {
      query.status = status;
    }

    const skip = (page - 1) * limit;

    const [comments, total] = await Promise.all([
      Comment.find(query)
        .populate('user', 'username name email')
        .populate('article', 'title slug')
        .populate({
          path: 'parent',
          select: 'content user',
          populate: { path: 'user', select: 'username name' },
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Comment.countDocuments(query),
    ]);

    // Fetch replies for each comment
    const commentsWithReplies = await Promise.all(
      comments.map(async (comment) => {
        const replies = await Comment.find({
          parent: comment._id,
          deletedAt: null,
          status: query.status === 'approved' ? 'approved' : { $ne: 'spam' },
        })
          .populate('user', 'username name email')
          .sort({ createdAt: 1 })
          .lean();

        return {
          ...comment,
          replies,
        };
      })
    );

    return NextResponse.json({
      comments: commentsWithReplies,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    });
  } catch (error: any) {    return NextResponse.json(
      { error: 'Failed to fetch comments', details: error.message },
      { status: 500 }
    );
  }
}

// POST /api/comments - Create a new comment
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { content, articleId, parentId } = body;

    if (!content || !articleId) {
      return NextResponse.json(
        { error: 'Content and article ID are required' },
        { status: 400 }
      );
    }

    if (content.length > 2000) {
      return NextResponse.json(
        { error: 'Comment cannot exceed 2000 characters' },
        { status: 400 }
      );
    }

    // Create comment with pending status (requires approval)
    const comment = await Comment.create({
      content,
      article: articleId,
      user: user.id,
      parent: parentId || null,
      status: 'pending', // Requires admin approval
      likeCount: 0,
    });

    const populatedComment = await Comment.findById(comment._id)
      .populate('user', 'username name email')
      .populate('parent', 'content user')
      .lean();

    return NextResponse.json(populatedComment, { status: 201 });
  } catch (error: any) {    return NextResponse.json(
      { error: 'Failed to create comment', details: error.message },
      { status: 500 }
    );
  }
}
