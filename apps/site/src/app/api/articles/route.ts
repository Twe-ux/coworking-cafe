import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "../../../lib/mongodb";
import { Article } from '@coworking-cafe/database';
import { Category } from '@coworking-cafe/database';
import {
  getAuthUser,
  requireAuth,
  handleApiError,
  generateSlug,
  calculateReadingTime,
} from "../../../lib/api-helpers";

// Force dynamic rendering
export const dynamic = "force-dynamic";

// Force model registration - prevents MissingSchemaError
// Reference models to ensure they're registered before populate() is called
const _ensureModelsRegistered = [Category];

/**
 * GET /api/articles
 * Get paginated list of articles with filters
 */
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);

    // Pagination
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    // Filters
    const status = searchParams.get("status");
    const category = searchParams.get("category");
    const tag = searchParams.get("tag");
    const search = searchParams.get("search");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") === "asc" ? 1 : -1;

    // Build query
    const query: any = { isDeleted: false };

    // Only show published articles to non-authenticated users
    const user = await getAuthUser();
    if (!user || !["admin", "staff", "dev"].includes(user.role?.slug || "")) {
      query.status = "published";
      query.publishedAt = { $lte: new Date() };
    } else if (status) {
      query.status = status;
    }

    if (category) {
      query.category = category;
    }

    if (tag) {
      query.tags = tag;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
        { excerpt: { $regex: search, $options: "i" } },
      ];
    }

    // Execute query
    const [articles, total] = await Promise.all([
      Article.find(query)
        .populate("author", "username name email")
        .populate("category", "name slug")
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit)
        .lean(),
      Article.countDocuments(query),
    ]);

    const pages = Math.ceil(total / limit);

    return NextResponse.json({
      articles,
      total,
      page,
      limit,
      pages,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST /api/articles
 * Create new article (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    await requireAuth(["admin", "staff", "dev"]);

    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    await connectDB();

    const body = await request.json();
    const {
      title,
      content,
      excerpt,
      featuredImage,
      categoryId,
      status = "draft",
      scheduledFor,
      metaTitle,
      metaDescription,
      metaKeywords,
    } = body;

    // Validate required fields
    if (!title || !content) {
      return NextResponse.json(
        { error: "Title and content are required" },
        { status: 400 },
      );
    }

    // Generate slug from title
    let slug = generateSlug(title);

    // Ensure slug is unique
    let slugExists = await Article.findOne({ slug, isDeleted: false });
    let counter = 1;
    while (slugExists) {
      slug = `${generateSlug(title)}-${counter}`;
      slugExists = await Article.findOne({ slug, isDeleted: false });
      counter++;
    }

    // Create article
    const article = await Article.create({
      title,
      slug,
      content,
      excerpt: excerpt || content.substring(0, 200) + "...",
      featuredImage,
      author: user.id,
      category: categoryId || undefined,
      status,
      publishedAt: status === "published" ? new Date() : undefined,
      scheduledFor: scheduledFor ? new Date(scheduledFor) : undefined,
      // SEO fields as separate properties
      metaTitle: metaTitle || undefined,
      metaDescription: metaDescription || undefined,
      metaKeywords: metaKeywords || [],
      // readingTime is a virtual property, calculated automatically from content
      viewCount: 0,
      likeCount: 0,
    });

    // Populate references
    await article.populate([
      { path: "author", select: "username name email" },
      { path: "category", select: "name slug" },
    ]);

    return NextResponse.json(article, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
