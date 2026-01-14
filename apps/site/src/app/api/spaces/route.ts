import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Space from '@/models/space';
import { getAuthUser, requireAuth, handleApiError, generateSlug } from '@/lib/api-helpers';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

/**
 * GET /api/spaces
 * Get paginated list of spaces with filters
 */
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);

    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Filters
    const type = searchParams.get('type');
    const minCapacity = searchParams.get('minCapacity');
    const maxCapacity = searchParams.get('maxCapacity');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const amenities = searchParams.get('amenities')?.split(',').filter(Boolean);
    const search = searchParams.get('search');
    const isActive = searchParams.get('isActive');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 1 : -1;

    // Build query
    const query: Record<string, unknown> = { isDeleted: false };

    // Check if user is admin/staff to see inactive spaces
    const user = await getAuthUser();
    const isAdminOrStaff = user && ['admin', 'staff', 'dev'].includes(user.role?.slug || '');

    // Only show active spaces to non-admin users
    if (!isAdminOrStaff) {
      query.isActive = true;
    } else if (isActive !== null && isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    if (type) {
      query.type = type;
    }

    if (minCapacity || maxCapacity) {
      query.capacity = {};
      if (minCapacity) {
        (query.capacity as Record<string, unknown>).$gte = parseInt(minCapacity);
      }
      if (maxCapacity) {
        (query.capacity as Record<string, unknown>).$lte = parseInt(maxCapacity);
      }
    }

    if (minPrice || maxPrice) {
      const priceQuery: Record<string, unknown> = {};
      if (minPrice) {
        priceQuery.$gte = parseFloat(minPrice);
      }
      if (maxPrice) {
        priceQuery.$lte = parseFloat(maxPrice);
      }
      query.$or = [
        { 'pricing.hourly': priceQuery },
        { 'pricing.daily': priceQuery },
        { 'pricing.weekly': priceQuery },
        { 'pricing.monthly': priceQuery },
      ];
    }

    if (amenities && amenities.length > 0) {
      query.amenities = { $all: amenities };
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    // Execute query
    const [spaces, total] = await Promise.all([
      Space.find(query)
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit)
        .lean(),
      Space.countDocuments(query),
    ]);

    const pages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: spaces,
      pagination: {
        page,
        limit,
        total,
        pages,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST /api/spaces
 * Create a new space (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Check authentication and admin role
    const user = await requireAuth();
    if (!user || !['admin', 'dev'].includes(user.role?.slug || '')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Validate required fields
    const { name, description, type, capacity, pricing } = body;

    if (!name || !description || !type || !capacity) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: name, description, type, capacity' },
        { status: 400 }
      );
    }

    // Validate type
    const validTypes = ['desk', 'meeting-room', 'private-office', 'event-space'];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { success: false, error: `Invalid type. Must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate capacity
    if (capacity < 1 || capacity > 100) {
      return NextResponse.json(
        { success: false, error: 'Capacity must be between 1 and 100' },
        { status: 400 }
      );
    }

    // Validate pricing (at least one pricing option must be provided)
    if (!pricing || (!pricing.hourly && !pricing.daily && !pricing.weekly && !pricing.monthly)) {
      return NextResponse.json(
        { success: false, error: 'At least one pricing option (hourly, daily, weekly, or monthly) is required' },
        { status: 400 }
      );
    }

    // Generate slug if not provided
    const slug = body.slug || generateSlug(name);

    // Check if slug already exists
    const existingSpace = await Space.findOne({ slug });
    if (existingSpace) {
      return NextResponse.json(
        { success: false, error: 'A space with this slug already exists' },
        { status: 409 }
      );
    }

    // Create space
    const space = await Space.create({
      name,
      slug,
      description,
      type,
      capacity,
      pricing,
      floor: body.floor,
      building: body.building,
      amenities: body.amenities || [],
      images: body.images || [],
      featuredImage: body.featuredImage,
      availability: body.availability || [],
      isActive: body.isActive !== undefined ? body.isActive : true,
    });

    return NextResponse.json({
      success: true,
      data: space,
      message: 'Space created successfully',
    }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
