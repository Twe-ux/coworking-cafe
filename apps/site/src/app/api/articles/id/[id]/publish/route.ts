import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "../../../../../../lib/mongodb";
import Article from "../../../../../../models/article";
import { requireAuth, handleApiError } from "../../../../../../lib/api-helpers";

// Force dynamic rendering
export const dynamic = "force-dynamic";

/**
 * POST /api/articles/id/[id]/publish
 * Toggle publish status (admin only)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    // Check authentication (throws ApiError if not authorized)
    await requireAuth(["admin", "staff", "dev"]);

    await connectDB();

    const { id } = params;

    const article = await Article.findOne({ _id: id, isDeleted: false });

    if (!article) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    // Toggle status
    if (article.status === "published") {
      article.status = "draft";
    } else {
      article.status = "published";
      if (!article.publishedAt) {
        article.publishedAt = new Date();
      }
    }

    await article.save();

    // Populate references
    await article.populate([
      { path: "author", select: "username name email" },
      { path: "category", select: "name slug" },
      { path: "tags", select: "name slug" },
    ]);

    return NextResponse.json(article);
  } catch (error) {
    return handleApiError(error);
  }
}
