import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "../../../../../../../../lib/mongodb";
import { Article } from '@coworking-cafe/database';
import {
  requireAuth,
  getAuthUser,
  handleApiError,
} from "../../../../../../../../lib/api-helpers";
import {
  restoreArticleRevision,
  createArticleRevision,
} from "../../../../../../../../lib/article-revision-helpers";

// Force dynamic rendering
export const dynamic = "force-dynamic";

/**
 * POST /api/articles/id/[id]/revisions/[revisionNumber]/restore
 * Restore article from a specific revision
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; revisionNumber: string } },
) {
  try {
    // Check authentication
    await requireAuth(["admin", "staff", "dev"]);

    await connectDB();

    const { id, revisionNumber } = params;
    const revisionNum = parseInt(revisionNumber);

    // Find article
    const article = await Article.findOne({ _id: id, isDeleted: false });

    if (!article) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    // Create a revision of current state before restoring
    const currentUser = await getAuthUser();
    if (currentUser) {
      await createArticleRevision(
        article,
        currentUser.id as any,
        `Before restoring revision #${revisionNum}`,
      );
    }

    // Restore from revision
    const success = await restoreArticleRevision(article, revisionNum);

    if (!success) {
      return NextResponse.json(
        { error: "Revision not found" },
        { status: 404 },
      );
    }

    // Populate references
    await article.populate([
      { path: "author", select: "username name email" },
      { path: "category", select: "name slug" },
    ]);

    return NextResponse.json({
      message: `Article restored to revision #${revisionNum}`,
      article,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
