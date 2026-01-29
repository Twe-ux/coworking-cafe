import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { options } from "../../../../lib/auth-options";
import dbConnect from "../../../../lib/mongodb";
import { User } from "@coworking-cafe/database";
import { Booking } from "@coworking-cafe/database";


// Force dynamic rendering (no static analysis at build time)
export const dynamic = 'force-dynamic';
export async function DELETE() {
  try {
    const session = await getServerSession(options);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    await dbConnect();

    // Find user
    const user = await User.findOne({ email: session.user.email });

    if (!user) {
      return NextResponse.json(
        { error: "Utilisateur introuvable" },
        { status: 404 },
      );
    }

    // Check for active reservations
    const activeReservations = await Booking.find({
      user: user._id,
      status: { $in: ["confirmed", "pending"] },
    });

    if (activeReservations.length > 0) {
      return NextResponse.json(
        {
          error:
            "Impossible de supprimer le compte. Vous avez des réservations actives.",
        },
        { status: 400 },
      );
    }

    // Delete all user's bookings (only completed/cancelled ones at this point)
    await Booking.deleteMany({ user: user._id });

    // Delete user
    await User.deleteOne({ _id: user._id });

    return NextResponse.json(
      { message: "Compte supprimé avec succès" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error deleting account:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression du compte" },
      { status: 500 },
    );
  }
}
