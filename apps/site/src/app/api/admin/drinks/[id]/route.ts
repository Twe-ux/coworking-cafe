import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { options } from '@/lib/auth-options';
import connectDB from '@/lib/db';
import { Drink } from '@/models/drink';

export const dynamic = 'force-dynamic';

// PUT - Mettre à jour une boisson
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
    const { name, description, recipe, image, category, order, isActive } = body;

    const drink = await Drink.findByIdAndUpdate(
      id,
      {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(recipe !== undefined && { recipe }),
        ...(image !== undefined && { image }),
        ...(category !== undefined && { category }),
        ...(order !== undefined && { order }),
        ...(isActive !== undefined && { isActive })
      },
      { new: true }
    ).populate('category', 'name slug');

    if (!drink) {
      return NextResponse.json({ error: 'Boisson non trouvée' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Boisson mise à jour',
      drink
    }, { status: 200 });
  } catch (error) {    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// DELETE - Supprimer une boisson
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
    const drink = await Drink.findByIdAndDelete(id);

    if (!drink) {
      return NextResponse.json({ error: 'Boisson non trouvée' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Boisson supprimée'
    }, { status: 200 });
  } catch (error) {    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
