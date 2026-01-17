import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { User, Newsletter } from "@coworking-cafe/database";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    // Validation
    if (!email) {
      return NextResponse.json(
        { error: "Email est requis" },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Email invalide" }, { status: 400 });
    }

    // Connect to MongoDB
    await dbConnect();

    // Check if user exists with this email
    const user = await User.findOne({ email: email.toLowerCase() });

    if (user) {
      // User exists, check if already subscribed
      if (user.newsletter) {
        return NextResponse.json(
          {
            error: "Tu es déjà inscrit(e) à la newsletter !",
            alreadySubscribed: true,
          },
          { status: 400 }
        );
      }

      // Update their newsletter preference
      user.newsletter = true;
      await user.save();

      // Also create/update newsletter entry linked to user
      await Newsletter.findOneAndUpdate(
        { email: email.toLowerCase() },
        {
          email: email.toLowerCase(),
          userId: user._id,
          isSubscribed: true,
          subscribedAt: new Date(),
          source: "form",
          $unset: { unsubscribedAt: "" },
        },
        { upsert: true, new: true }
      );

      return NextResponse.json(
        {
          message: "Inscription à la newsletter réussie",
          linked: true,
        },
        { status: 200 }
      );
    } else {
      // No user account, create standalone newsletter entry
      const existingNewsletter = await Newsletter.findOne({
        email: email.toLowerCase(),
      });

      if (existingNewsletter && existingNewsletter.isSubscribed) {
        // Already subscribed
        return NextResponse.json(
          {
            error: "Cet email est déjà inscrit à la newsletter !",
            alreadySubscribed: true,
          },
          { status: 400 }
        );
      }

      if (existingNewsletter) {
        // Was unsubscribed, re-subscribe
        existingNewsletter.isSubscribed = true;
        existingNewsletter.subscribedAt = new Date();
        existingNewsletter.unsubscribedAt = undefined;
        await existingNewsletter.save();

        return NextResponse.json(
          { message: "Réinscription à la newsletter réussie !" },
          { status: 200 }
        );
      }

      // Create new newsletter entry
      await Newsletter.create({
        email: email.toLowerCase(),
        isSubscribed: true,
        subscribedAt: new Date(),
        source: "form",
      });

      return NextResponse.json(
        { message: "Inscription à la newsletter réussie" },
        { status: 201 }
      );
    }
  } catch (error) {
    console.error("POST /api/newsletter/subscribe error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Erreur lors de l'inscription",
      },
      { status: 500 }
    );
  }
}
