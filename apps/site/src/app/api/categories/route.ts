import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "../../../lib/db";
import { Category } from '@coworking-cafe/database';
import { requireAuth, generateSlug } from "../../../lib/api-helpers";

// GET /api/categories - Get all categories

// Force dynamic rendering (no static analysis at build time)
export const dynamic = 'force-dynamic';
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const visible = searchParams.get("visible");

    const query: any = {};
    if (visible === "true") {
      query.isVisible = true;
    }

    const skip = (page - 1) * limit;

    const [categories, total] = await Promise.all([
      Category.find(query)
        .populate("parent", "name slug")
        .sort({ order: 1, name: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Category.countDocuments(query),
    ]);

    return NextResponse.json({
      categories,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to fetch categories", details: error.message },
      { status: 500 },
    );
  }
}

// POST /api/categories - Create a category (admin only)
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    await requireAuth(["admin", "staff", "dev"]);

    const body = await request.json();
    const {
      name,
      description,
      parentId,
      image,
      icon,
      color,
      metaTitle,
      metaDescription,
      order,
      isVisible,
    } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Category name is required" },
        { status: 400 },
      );
    }

    // Generate unique slug
    let slug = generateSlug(name);
    let slugExists = await Category.findOne({ slug });
    let counter = 1;
    while (slugExists) {
      slug = `${generateSlug(name)}-${counter}`;
      slugExists = await Category.findOne({ slug });
      counter++;
    }

    const category = await Category.create({
      name,
      slug,
      description,
      parent: parentId || null,
      image,
      icon,
      color,
      metaTitle,
      metaDescription,
      order: order || 0,
      isVisible: isVisible !== undefined ? isVisible : true,
      articleCount: 0,
    });

    const populatedCategory = await Category.findById(category._id)
      .populate("parent", "name slug")
      .lean();

    return NextResponse.json(populatedCategory, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to create category", details: error.message },
      { status: 500 },
    );
  }
}
