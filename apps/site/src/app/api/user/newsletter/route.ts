import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import mongoose from "mongoose";
import dbConnect from "@/lib/mongodb";

import { options } from "@/lib/auth-options";

export const dynamic = "force-dynamic";

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(options);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { newsletter } = body;

    if (typeof newsletter !== "boolean") {
      return NextResponse.json(
        { error: "Valeur newsletter invalide" },
        { status: 400 }
      );
    }

    // Connect FIRST
    await dbConnect();

    // Import schemas to register them
    await import("@coworking-cafe/database");

    // Get models using mongoose.model()
    const User = mongoose.model("User");
    const Newsletter = mongoose.model("Newsletter");

    // Update user's newsletter preference
    const user = await User.findOneAndUpdate(
      { email: session.user.email },
      { newsletter },
      { new: true }
    );

    if (!user) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    // Update or create newsletter entry
    if (newsletter) {
      await Newsletter.findOneAndUpdate(
        { email: session.user.email.toLowerCase() },
        {
          email: session.user.email.toLowerCase(),
          userId: user._id,
          isSubscribed: true,
          subscribedAt: new Date(),
          source: "registration",
          $unset: { unsubscribedAt: "" },
        },
        { upsert: true, new: true }
      );
    } else {
      await Newsletter.findOneAndUpdate(
        { email: session.user.email.toLowerCase() },
        {
          isSubscribed: false,
          unsubscribedAt: new Date(),
        }
      );
    }

    return NextResponse.json(
      {
        message: newsletter
          ? "Inscrit à la newsletter"
          : "Désinscrit de la newsletter",
        newsletter,
      },
      { status: 200 }
    );
  } catch (error) {    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Erreur lors de la mise à jour",
      },
      { status: 500 }
    );
  }
}
