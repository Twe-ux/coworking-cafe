import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Drink, DrinkCategory } from '@/models/drink';

export const dynamic = 'force-dynamic';

// GET - Récupérer toutes les boissons actives groupées par catégorie
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Get type from query params (drink or food)
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'drink';

    const categories = await DrinkCategory.find({
      isActive: true,
      showOnSite: { $ne: false },
      type
    })
      .sort({ order: 1 })
      .lean();

    const drinks = await Drink.find({ isActive: true, type })
      .populate('category', 'name slug type')
      .sort({ order: 1 })
      .lean();

    // Grouper les boissons par catégorie (seulement celles visibles sur le site)
    const menu = categories.map(category => ({
      _id: category._id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      drinks: drinks.filter(
        (drink: any) => drink.category?._id?.toString() === category._id.toString()
      )
    }));

    return NextResponse.json({ menu }, { status: 200 });
  } catch (error) {    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
