import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Category } from '@/models/category';
import { requireAuth, generateSlug } from '@/lib/api-helpers';

// GET /api/categories/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const category = await Category.findById(params.id)
      .populate('parent', 'name slug')
      .lean();

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(category);
  } catch (error: any) {    return NextResponse.json(
      { error: 'Failed to fetch category', details: error.message },
      { status: 500 }
    );
  }
}

// PATCH /api/categories/[id] - Update category (admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    await requireAuth(['admin', 'staff', 'dev']);

    const body = await request.json();
    const category = await Category.findById(params.id);

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

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

    // Update slug if name changed
    if (name !== undefined && name !== category.name) {
      let newSlug = generateSlug(name);
      let slugExists = await Category.findOne({
        slug: newSlug,
        _id: { $ne: params.id },
      });
      let counter = 1;
      while (slugExists) {
        newSlug = `${generateSlug(name)}-${counter}`;
        slugExists = await Category.findOne({
          slug: newSlug,
          _id: { $ne: params.id },
        });
        counter++;
      }
      category.slug = newSlug;
      category.name = name;
    }

    if (description !== undefined) category.description = description;
    if (parentId !== undefined) category.parent = parentId || null;
    if (image !== undefined) category.image = image;
    if (icon !== undefined) category.icon = icon;
    if (color !== undefined) category.color = color;
    if (metaTitle !== undefined) category.metaTitle = metaTitle;
    if (metaDescription !== undefined) category.metaDescription = metaDescription;
    if (order !== undefined) category.order = order;
    if (isVisible !== undefined) category.isVisible = isVisible;

    await category.save();

    const updatedCategory = await Category.findById(category._id)
      .populate('parent', 'name slug')
      .lean();

    return NextResponse.json(updatedCategory);
  } catch (error: any) {    return NextResponse.json(
      { error: 'Failed to update category', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/categories/[id] - Delete category (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    await requireAuth(['admin', 'staff', 'dev']);

    const category = await Category.findById(params.id);

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    // Check if category has articles
    if (category.articleCount > 0) {
      return NextResponse.json(
        {
          error: 'Cannot delete category with articles',
          articleCount: category.articleCount,
        },
        { status: 400 }
      );
    }

    await category.deleteOne();

    return NextResponse.json({ message: 'Category deleted successfully' });
  } catch (error: any) {    return NextResponse.json(
      { error: 'Failed to delete category', details: error.message },
      { status: 500 }
    );
  }
}
