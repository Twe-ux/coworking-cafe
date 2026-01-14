import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { options } from '@/lib/auth-options';
import dbConnect from '@/lib/mongodb';
import { User } from '@/models/user';
import { Reservation } from '@/models/reservation';

export async function DELETE() {
  try {
    const session = await getServerSession(options);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    await dbConnect();

    // Find user
    const user = await User.findOne({ email: session.user.email });

    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur introuvable' },
        { status: 404 }
      );
    }

    // Check for active reservations
    const activeReservations = await Reservation.find({
      client: user._id,
      status: { $in: ['confirmed', 'pending'] },
    });

    if (activeReservations.length > 0) {
      return NextResponse.json(
        {
          error:
            'Impossible de supprimer le compte. Vous avez des réservations actives.',
        },
        { status: 400 }
      );
    }

    // Delete all user's reservations (only completed/cancelled ones at this point)
    await Reservation.deleteMany({ client: user._id });

    // Delete user
    await User.deleteOne({ _id: user._id });

    return NextResponse.json(
      { message: 'Compte supprimé avec succès' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting account:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du compte' },
      { status: 500 }
    );
  }
}
