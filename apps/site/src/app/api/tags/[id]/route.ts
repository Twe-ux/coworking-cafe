import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "../../../../lib/db";
import { requireAuth, generateSlug } from "../../../../lib/api-helpers";

// GET /api/tags/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    await connectDB();

    const tag = await Tag.findById(params.id).lean();

    if (!tag) {
      return NextResponse.json({ error: "Tag not found" }, { status: 404 });
    }

    return NextResponse.json(tag);
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to fetch tag", details: error.message },
      { status: 500 },
    );
  }
}

// PATCH /api/tags/[id] - Update tag (admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    await connectDB();

    await requireAuth(["admin", "staff", "dev"]);

    const body = await request.json();
    const tag = await Tag.findById(params.id);

    if (!tag) {
      return NextResponse.json({ error: "Tag not found" }, { status: 404 });
    }

    const { name, description, color } = body;

    // Update slug if name changed
    if (name !== undefined && name !== tag.name) {
      let newSlug = generateSlug(name);
      let slugExists = await Tag.findOne({
        slug: newSlug,
        _id: { $ne: params.id },
      });
      let counter = 1;
      while (slugExists) {
        newSlug = `${generateSlug(name)}-${counter}`;
        slugExists = await Tag.findOne({
          slug: newSlug,
          _id: { $ne: params.id },
        });
        counter++;
      }
      tag.slug = newSlug;
      tag.name = name;
    }

    if (description !== undefined) tag.description = description;
    if (color !== undefined) tag.color = color;

    await tag.save();

    return NextResponse.json(tag);
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to update tag", details: error.message },
      { status: 500 },
    );
  }
}

// DELETE /api/tags/[id] - Delete tag (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    await connectDB();

    await requireAuth(["admin", "staff", "dev"]);

    const tag = await Tag.findById(params.id);

    if (!tag) {
      return NextResponse.json({ error: "Tag not found" }, { status: 404 });
    }

    // Check if tag has articles
    if (tag.articleCount > 0) {
      return NextResponse.json(
        {
          error: "Cannot delete tag with articles",
          articleCount: tag.articleCount,
        },
        { status: 400 },
      );
    }

    await tag.deleteOne();

    return NextResponse.json({ message: "Tag deleted successfully" });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to delete tag", details: error.message },
      { status: 500 },
    );
  }
}
