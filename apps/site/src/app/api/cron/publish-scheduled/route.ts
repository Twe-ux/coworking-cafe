import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Article from '@/models/article';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

/**
 * GET /api/cron/publish-scheduled
 * Auto-publish scheduled articles
 * 
 * This endpoint should be called periodically by a cron job
 * to publish articles that have reached their scheduled time
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret for security (optional but recommended)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const now = new Date();

    // Find all articles that are scheduled and should be published
    const articlesToPublish = await Article.find({
      status: 'scheduled',
      scheduledFor: { $lte: now },
      isDeleted: false,
    });

    if (articlesToPublish.length === 0) {
      return NextResponse.json({
        message: 'No articles to publish',
        count: 0,
      });
    }

    // Update all matching articles
    const updatePromises = articlesToPublish.map(async (article) => {
      article.status = 'published';
      article.publishedAt = article.scheduledFor; // Use the scheduled date as publish date
      await article.save();
      return article._id;
    });

    const publishedIds = await Promise.all(updatePromises);

    return NextResponse.json({
      message: `Successfully published ${publishedIds.length} article(s)`,
      count: publishedIds.length,
      articleIds: publishedIds,
      timestamp: now.toISOString(),
    });
  } catch (error: any) {    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/cron/publish-scheduled
 * Alternative method for Vercel Cron Jobs (they use POST)
 */
export async function POST(request: NextRequest) {
  return GET(request);
}
