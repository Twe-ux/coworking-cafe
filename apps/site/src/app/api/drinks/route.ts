import { NextRequest, NextResponse } from "next/server";
import connectDB from "../../../lib/db";
import { MenuItem, MenuCategory } from "@coworking-cafe/database";

// GET - Récupérer toutes les boissons actives groupées par catégorie

// Revalidate cache every hour (more stable than unstable_cache on Vercel)
export const revalidate = 3600; // 1 hour
export async function GET(request: NextRequest) {
  try {
    // Get type from query params (drink or food)
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "drink";

    await connectDB();

    const categories = await MenuCategory.find({
      isActive: true,
      showOnSite: { $ne: false },
      type,
    })
      .sort({ order: 1 })
      .lean();

    const drinks = await MenuItem.find({ isActive: true, type })
      .populate("category", "name slug type")
      .sort({ order: 1 })
      .lean();

    // Grouper les boissons par catégorie (seulement celles visibles sur le site)
    const menu = categories.map((category) => ({
      _id: category._id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      drinks: drinks.filter(
        (drink: any) =>
          drink.category?._id?.toString() === category._id.toString(),
      ),
    }));

    return NextResponse.json({ menu }, { status: 200 });
  } catch (error) {
    console.error("Error in /api/drinks:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
