import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api/response";
import { connectMongoose } from "@/lib/mongodb";
import { Product } from "@/models/inventory/product";

export const dynamic = "force-dynamic";

/**
 * GET /api/inventory/products/search
 * Public endpoint for searching products (out-of-stock widget)
 * Query params: ?q=search_term
 * Returns only: _id, name, currentStock, category
 * No auth required
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query || query.length < 2) {
      return successResponse([]);
    }

    await connectMongoose();

    // Search only active products
    const products = await Product.find({
      name: { $regex: query, $options: "i" },
      isActive: true,
    })
      .select("_id name currentStock category")
      .sort({ name: 1 })
      .limit(20)
      .lean();

    // Transform to simple format
    const results = products.map((p) => ({
      _id: p._id.toString(),
      name: p.name,
      currentStock: p.currentStock,
      category: p.category,
    }));

    return successResponse(results);
  } catch (error) {
    console.error("[GET /api/inventory/products/search] Error:", error);
    return errorResponse(
      "Erreur lors de la recherche",
      error instanceof Error ? error.message : undefined,
      500
    );
  }
}
