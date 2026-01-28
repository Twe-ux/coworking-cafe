import { NextRequest, NextResponse } from "next/server";
import { Article } from "@coworking-cafe/database";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Get current article
    const currentArticle = await Article.findById(id)
      .select("publishedAt")
      .lean();

    if (!currentArticle) {
      return NextResponse.json(
        { success: false, error: "Article not found" },
        { status: 404 }
      );
    }

    // Get previous article (older)
    const previousArticle = await Article.findOne({
      status: "published",
      publishedAt: { $lt: currentArticle.publishedAt },
      isDeleted: false,
    })
      .select("_id title slug")
      .sort({ publishedAt: -1 })
      .lean();

    // Get next article (newer)
    const nextArticle = await Article.findOne({
      status: "published",
      publishedAt: { $gt: currentArticle.publishedAt },
      isDeleted: false,
    })
      .select("_id title slug")
      .sort({ publishedAt: 1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: {
        previous: previousArticle,
        next: nextArticle,
      },
    });
  } catch (error) {
    console.error("Error fetching adjacent articles:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
