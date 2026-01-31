import { NextRequest, NextResponse } from "next/server";
import connectDB from "../../../lib/db";
import { MenuItem, MenuCategory } from "@coworking-cafe/database";
import { cache24h } from "../../../lib/cache-helpers";

// GET - Récupérer toutes les boissons actives groupées par catégorie

// Force dynamic rendering (no static analysis at build time)
export const dynamic = 'force-dynamic';
export async function GET(request: NextRequest) {
  try {
    // Get type from query params (drink or food)
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "drink";

    // Connexion directe sans cache (temporaire pour debug)
    await connectDB();

    // DEBUG: Vérifier toutes les catégories sans filtre
    const allCategories = await MenuCategory.find({}).lean();
    console.log(`[DEBUG] Total categories in DB: ${allCategories.length}`);
    console.log('[DEBUG] All categories:', JSON.stringify(allCategories.map(c => ({
      name: c.name,
      type: c.type,
      isActive: c.isActive,
      showOnSite: c.showOnSite
    })), null, 2));

    // Chercher catégories avec filtres
    const categories = await MenuCategory.find({
      isActive: true,
      showOnSite: { $ne: false },
      type,
    })
      .sort({ order: 1 })
      .lean();

    console.log(`[DEBUG] Categories found with filters (type=${type}): ${categories.length}`);

    // DEBUG: Vérifier tous les items sans filtre
    const allItems = await MenuItem.find({}).lean();
    console.log(`[DEBUG] Total menu items in DB: ${allItems.length}`);
    console.log('[DEBUG] All items:', JSON.stringify(allItems.map(i => ({
      name: i.name,
      type: i.type,
      isActive: i.isActive,
      categoryId: i.category
    })), null, 2));

    const drinks = await MenuItem.find({ isActive: true, type })
      .populate("category", "name slug type")
      .sort({ order: 1 })
      .lean();

    console.log(`[DEBUG] Items found with filters (type=${type}): ${drinks.length}`);

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

    console.log(`[DEBUG] Final menu structure: ${JSON.stringify(menu.map(m => ({
      name: m.name,
      drinksCount: m.drinks.length
    })))}`);

    return NextResponse.json({ menu }, { status: 200 });
  } catch (error) {
    console.error("Error in /api/drinks:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
