import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "../../../lib/db";
import { Tag } from "../../../models/tag";
import { requireAuth, generateSlug } from "../../../lib/api-helpers";

// GET /api/tags - Get all tags
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "100");
    const search = searchParams.get("search");

    const query: any = {};
    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    const skip = (page - 1) * limit;

    const [tags, total] = await Promise.all([
      Tag.find(query).sort({ name: 1 }).skip(skip).limit(limit).lean(),
      Tag.countDocuments(query),
    ]);

    return NextResponse.json({
      tags,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to fetch tags", details: error.message },
      { status: 500 },
    );
  }
}

// POST /api/tags - Create a tag (admin only)
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    await requireAuth(["admin", "staff", "dev"]);

    const body = await request.json();
    const { name, description, color } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Tag name is required" },
        { status: 400 },
      );
    }

    // Generate unique slug
    let slug = generateSlug(name);
    let slugExists = await Tag.findOne({ slug });
    let counter = 1;
    while (slugExists) {
      slug = `${generateSlug(name)}-${counter}`;
      slugExists = await Tag.findOne({ slug });
      counter++;
    }

    const tag = await Tag.create({
      name,
      slug,
      description,
      color,
      articleCount: 0,
    });

    return NextResponse.json(tag, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to create tag", details: error.message },
      { status: 500 },
    );
  }
}
