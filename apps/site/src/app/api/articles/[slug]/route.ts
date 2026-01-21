import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "../../../../lib/mongodb";
import { Article } from '@coworking-cafe/database';
import { Category } from '@coworking-cafe/database';
import { getAuthUser, handleApiError } from "../../../../lib/api-helpers";

// Force dynamic rendering
export const dynamic = "force-dynamic";

// Force model registration - prevents MissingSchemaError
const _ensureModelsRegistered = [Category];

/**
 * GET /api/articles/[slug]
 * Get article by slug (public)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } },
) {
  try {
    await connectDB();

    const { slug } = params;

    const query: any = { slug, isDeleted: false };

    // Only show published articles to non-authenticated users
    const user = await getAuthUser();
    if (!user || !["admin", "staff", "dev"].includes(user.role?.slug || "")) {
      query.status = "published";
      query.publishedAt = { $lte: new Date() };
    }

    const article = await Article.findOne(query)
      .populate("author", "username name email")
      .populate("category", "name slug description")
      .lean();

    if (!article) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    return NextResponse.json(article);
  } catch (error) {
    return handleApiError(error);
  }
}
