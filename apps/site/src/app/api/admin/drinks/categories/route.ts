import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { options } from '@/lib/auth-options';
import connectDB from '@/lib/db';
import { DrinkCategory, Drink } from '@/models/drink';

export const dynamic = 'force-dynamic';

// GET - Récupérer toutes les catégories
export async function GET() {
  try {
    const session = await getServerSession(options);

    if (!session?.user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    if (session.user.role.level < 50) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    await connectDB();

    const categories = await DrinkCategory.find()
      .sort({ order: 1 })
      .lean();

    return NextResponse.json({ categories }, { status: 200 });
  } catch (error) {    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// POST - Créer une nouvelle catégorie
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
    const { name, description, type = 'drink' } = body;

    if (!name) {
      return NextResponse.json({ error: 'Nom requis' }, { status: 400 });
    }

    // Générer le slug
    const slug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Vérifier si le slug existe déjà pour ce type
    const existing = await DrinkCategory.findOne({ slug, type });
    if (existing) {
      return NextResponse.json(
        { error: 'Une catégorie avec ce nom existe déjà' },
        { status: 400 }
      );
    }

    // Obtenir le prochain ordre
    const lastCategory = await DrinkCategory.findOne({ type }).sort({ order: -1 });
    const order = lastCategory ? lastCategory.order + 1 : 0;

    const category = await DrinkCategory.create({
      name,
      slug,
      description,
      type,
      order,
      isActive: true
    });

    return NextResponse.json({
      message: 'Catégorie créée avec succès',
      category
    }, { status: 201 });
  } catch (error) {    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
