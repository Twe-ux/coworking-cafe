import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "../../../../../lib/mongodb";
import { Article } from '@coworking-cafe/database';
import { Category } from '@coworking-cafe/database';
import {
  requireAuth,
  getAuthUser,
  handleApiError,
  generateSlug,
  calculateReadingTime,
} from "../../../../../lib/api-helpers";
import { createArticleRevision } from "../../../../../lib/article-revision-helpers";

// Force dynamic rendering
export const dynamic = "force-dynamic";

// Force model registration - prevents MissingSchemaError
const _ensureModelsRegistered = [Category];

/**
 * GET /api/articles/id/[id]
 * Get article by ID (for editing in admin)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    // Check authentication
    await requireAuth(["admin", "staff", "dev"]);

    await connectDB();

    const { id } = params;

    const article = await Article.findOne({ _id: id, isDeleted: false })
      .populate("author", "username name email")
      .populate("category", "name slug")
      .lean();

    if (!article) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    return NextResponse.json(article);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * PATCH /api/articles/id/[id]
 * Update article (admin only)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    // Check authentication
    await requireAuth(["admin", "staff", "dev"]);

    await connectDB();

    const { id } = params;
    const body = await request.json();

    const {
      title,
      content,
      excerpt,
      featuredImage,
      categoryId,
      status,
      metaTitle,
      metaDescription,
      metaKeywords,
    } = body;

    // Find article
    const article = await Article.findOne({ _id: id, isDeleted: false });

    if (!article) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    // Update fields
    if (title !== undefined) {
      article.title = title;

      // Regenerate slug if title changed
      if (title !== article.title) {
        let newSlug = generateSlug(title);
        let slugExists = await Article.findOne({
          slug: newSlug,
          isDeleted: false,
          _id: { $ne: id },
        });

        let counter = 1;
        while (slugExists) {
          newSlug = `${generateSlug(title)}-${counter}`;
          slugExists = await Article.findOne({
            slug: newSlug,
            isDeleted: false,
            _id: { $ne: id },
          });
          counter++;
        }

        article.slug = newSlug;
      }
    }

    if (content !== undefined) {
      article.content = content;
      // readingTime is a virtual property, calculated automatically from content
    }

    if (excerpt !== undefined) article.excerpt = excerpt;
    if (featuredImage !== undefined) article.featuredImage = featuredImage;
    if (categoryId !== undefined) article.category = categoryId || undefined;

    // Handle SEO fields as separate properties
    if (metaTitle !== undefined) article.metaTitle = metaTitle;
    if (metaDescription !== undefined)
      article.metaDescription = metaDescription;
    if (metaKeywords !== undefined) article.metaKeywords = metaKeywords;

    // Handle status change
    if (status !== undefined && status !== article.status) {
      article.status = status;

      if (status === "published" && !article.publishedAt) {
        article.publishedAt = new Date();
      }
    }

    // Create revision before saving changes
    const currentUser = await getAuthUser();
    if (currentUser) {
      await createArticleRevision(
        article,
        currentUser.id as any,
        "Article updated",
      );
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

/**
 * DELETE /api/articles/id/[id]
 * Delete article permanently and update category count (admin only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    // Check authentication
    await requireAuth(["admin", "staff", "dev"]);

    await connectDB();

    const { id } = params;

    // Find article first to get category
    const article = await Article.findOne({ _id: id, isDeleted: false });

    if (!article) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    // Decrement category count if article is published and has a category
    if (article.status === "published" && article.category) {
      await Category.findByIdAndUpdate(article.category, {
        $inc: { articleCount: -1 },
      });
    }

    // Permanently delete the article
    await Article.deleteOne({ _id: id });

    return NextResponse.json({ message: "Article deleted successfully" });
  } catch (error) {
    return handleApiError(error);
  }
}
