import { NextRequest, NextResponse } from "next/server";
import connectDB from "../../../lib/db";
import { MenuItem, MenuCategory } from "@coworking-cafe/database";
import { cache24h } from "../../../lib/cache-helpers";

// GET - Récupérer toutes les boissons actives groupées par catégorie
export async function GET(request: NextRequest) {
  try {
    // Get type from query params (drink or food)
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "drink";

    // Utiliser le cache avec une clé unique par type
    const getCachedMenu = cache24h(
      async () => {
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

        return menu;
      },
      ['menu', type],
      { tags: ['menu', `menu-${type}`] }
    );

    const menu = await getCachedMenu();

    return NextResponse.json({ menu }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
