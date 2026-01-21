import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "../../../lib/api-helpers";
import connectDB from "../../../lib/db";
import AdditionalService from "../../../models/additionalService";

// GET /api/additional-services - Liste des services supplémentaires
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get("category");
    const spaceType = searchParams.get("spaceType");
    const isActive = searchParams.get("isActive");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const skip = (page - 1) * limit;

    // Build query
    const query: Record<string, unknown> = {
      isDeleted: false,
    };

    if (category) {
      query.category = category;
    }

    if (isActive !== null && isActive !== undefined) {
      query.isActive = isActive === "true";
    }

    // Filter by space type if provided
    if (spaceType) {
      query.$or = [
        { availableForSpaceTypes: spaceType },
        { availableForSpaceTypes: { $size: 0 } }, // Disponible pour tous
        { availableForSpaceTypes: null },
      ];
    }

    const services = await AdditionalService.find(query)
      .sort({ order: 1, name: 1 })
      .limit(limit)
      .skip(skip);

    const total = await AdditionalService.countDocuments(query);

    return NextResponse.json({
      success: true,
      data: services,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch additional services" },
      { status: 500 },
    );
  }
}

// POST /api/additional-services - Créer un service (admin only)
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();

    // Vérifier que l'utilisateur est admin
    if (!user || !["admin", "dev"].includes(user.role?.slug || "")) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin access required." },
        { status: 403 },
      );
    }

    await connectDB();

    const body = await request.json();
    const {
      name,
      description,
      category,
      price,
      dailyPrice,
      priceUnit,
      vatRate,
      availableForSpaceTypes,
      icon,
      order,
    } = body;

    // Validation
    if (!name || name.trim() === "") {
      return NextResponse.json(
        { success: false, error: "Service name is required" },
        { status: 400 },
      );
    }

    if (
      !category ||
      !["food", "beverage", "equipment", "other"].includes(category)
    ) {
      return NextResponse.json(
        { success: false, error: "Valid category is required" },
        { status: 400 },
      );
    }

    if (price === undefined || price === null || price < 0) {
      return NextResponse.json(
        { success: false, error: "Valid price is required (>= 0)" },
        { status: 400 },
      );
    }

    if (!priceUnit || !["per-person", "flat-rate"].includes(priceUnit)) {
      return NextResponse.json(
        { success: false, error: "Valid price unit is required" },
        { status: 400 },
      );
    }
    const service = await AdditionalService.create({
      name,
      description,
      category,
      price,
      dailyPrice,
      priceUnit,
      vatRate: vatRate || 20,
      availableForSpaceTypes: availableForSpaceTypes || [],
      icon,
      order: order || 0,
    });
    return NextResponse.json(
      {
        success: true,
        data: service,
        message: "Additional service created successfully",
      },
      { status: 201 },
    );
  } catch (error: any) {
    // Mongoose validation errors
    if (error?.name === "ValidationError") {
      const validationErrors = Object.values(error.errors || {}).map(
        (err: any) => err.message,
      );
      return NextResponse.json(
        {
          success: false,
          error: "Validation error",
          details: validationErrors,
        },
        { status: 400 },
      );
    }

    // Duplicate key error
    if (error?.code === 11000) {
      return NextResponse.json(
        {
          success: false,
          error: "Un service avec ce nom existe déjà",
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to create additional service",
        details: error?.message || "Unknown error",
      },
      { status: 500 },
    );
  }
}
