import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { options } from '@/lib/auth-options';
import connectDB from '@/lib/db';
import { DrinkCategory, Drink } from '@/models/drink';

export const dynamic = 'force-dynamic';

// PUT - Mettre à jour une catégorie
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(options);

    if (!session?.user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    if (session.user.role.level < 80) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    await connectDB();

    const { id } = params;
    const body = await request.json();
    const { name, description, order, isActive, showOnSite } = body;

    const updateData: any = {};

    if (name !== undefined) {
      updateData.name = name;
      // Mettre à jour le slug aussi
      updateData.slug = name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }

    if (description !== undefined) updateData.description = description;
    if (order !== undefined) updateData.order = order;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (showOnSite !== undefined) updateData.showOnSite = showOnSite;

    const category = await DrinkCategory.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!category) {
      return NextResponse.json({ error: 'Catégorie non trouvée' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Catégorie mise à jour',
      category
    }, { status: 200 });
  } catch (error) {    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// DELETE - Supprimer une catégorie
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(options);

    if (!session?.user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    if (session.user.role.level < 80) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    await connectDB();

    const { id } = params;

    // Vérifier si des boissons utilisent cette catégorie
    const drinksCount = await Drink.countDocuments({ category: id });
    if (drinksCount > 0) {
      return NextResponse.json(
        { error: `Impossible de supprimer : ${drinksCount} boisson(s) dans cette catégorie` },
        { status: 400 }
      );
    }

    const category = await DrinkCategory.findByIdAndDelete(id);

    if (!category) {
      return NextResponse.json({ error: 'Catégorie non trouvée' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Catégorie supprimée'
    }, { status: 200 });
  } catch (error) {    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
