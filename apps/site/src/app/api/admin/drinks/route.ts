import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { options } from '@/lib/auth-options';
import connectDB from '@/lib/db';
import { Drink, DrinkCategory } from '@/models/drink';

export const dynamic = 'force-dynamic';

// GET - Récupérer toutes les boissons avec leurs catégories
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(options);

    if (!session?.user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    if (session.user.role.level < 50) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    await connectDB();

    // Get type from query params (drink or food)
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'drink';

    const categories = await DrinkCategory.find({ type })
      .sort({ order: 1 })
      .lean();

    const drinks = await Drink.find({ type })
      .populate('category', 'name slug type')
      .sort({ order: 1 })
      .lean();

    return NextResponse.json({ categories, drinks }, { status: 200 });
  } catch (error) {    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// POST - Créer une nouvelle boisson
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(options);

    if (!session?.user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    if (session.user.role.level < 80) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    await connectDB();

    const body = await request.json();
    const { name, description, recipe, image, category, type = 'drink' } = body;

    if (!name || !category) {
      return NextResponse.json(
        { error: 'Nom et catégorie requis' },
        { status: 400 }
      );
    }

    // Obtenir le prochain ordre
    const lastDrink = await Drink.findOne({ category }).sort({ order: -1 });
    const order = lastDrink ? lastDrink.order + 1 : 0;

    const drink = await Drink.create({
      name,
      description,
      recipe,
      image,
      category,
      type,
      order,
      isActive: true
    });

    const populatedDrink = await Drink.findById(drink._id)
      .populate('category', 'name slug')
      .lean();

    return NextResponse.json({
      message: 'Boisson créée avec succès',
      drink: populatedDrink
    }, { status: 201 });
  } catch (error) {    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
