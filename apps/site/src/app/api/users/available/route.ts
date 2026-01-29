import { NextRequest, NextResponse } from "next/server";
import connectDB from "../../../../lib/db";
import { User } from "@coworking-cafe/database";
import { getAuthUser } from "../../../../lib/api-helpers";

/**
 * GET /api/users/available
 * Get list of users available for messaging (excluding current user)
 */

// Force dynamic rendering (no static analysis at build time)
export const dynamic = 'force-dynamic';
export async function GET(request: NextRequest) {
  try {
    const currentUser = await getAuthUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const limit = parseInt(searchParams.get("limit") || "20");

    // Build search query
    const searchQuery: any = {
      _id: { $ne: currentUser.id }, // Exclude current user
      isDeleted: { $ne: true },
    };

    if (search) {
      searchQuery.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const users = await User.find(searchQuery)
      .select("name email avatar role createdAt")
      .limit(limit)
      .sort({ name: 1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: users,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 },
    );
  }
}
