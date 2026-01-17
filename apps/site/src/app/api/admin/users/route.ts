import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import mongoose, { Types } from "mongoose";
import dbConnect from "@/lib/mongodb";

import { options } from "@/lib/auth-options";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(options);

    if (!session?.user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    // Check if user is admin or higher (level >= 80)
    if (session.user.role.level < 80) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    // Connect FIRST
    await dbConnect();

    // Import schemas to register them
    await import("@coworking-cafe/database");

    // Get models using mongoose.model()
    const User = mongoose.model("User");
    const Newsletter = mongoose.model("Newsletter");

    // Get all users with their roles
    const users = await User.find()
      .select("email username givenName newsletter emailVerifiedAt lastLoginAt createdAt deletedAt")
      .populate("role", "name slug level")
      .sort({ createdAt: -1 });

    // Get all newsletter entries
    const newsletters = await Newsletter.find();

    // Create a map of all entries
    const usersMap = new Map();

    // Add all users
    users.forEach((user) => {
      usersMap.set(user.email.toLowerCase(), {
        id: (user._id as Types.ObjectId).toString(),
        email: user.email,
        username: user.username || "-",
        givenName: user.givenName || "-",
        role: {
          name: (user as any).role?.name || "Client",
          slug: (user as any).role?.slug || "client",
          level: (user as any).role?.level || 10,
        },
        hasAccount: true,
        newsletter: user.newsletter,
        emailVerifiedAt: user.emailVerifiedAt,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
        deletedAt: user.deletedAt,
        isActive: !user.deletedAt,
      });
    });

    // Add standalone newsletter entries (emails without account)
    newsletters.forEach((newsletter) => {
      const email = newsletter.email.toLowerCase();
      if (!usersMap.has(email)) {
        usersMap.set(email, {
          id: (newsletter._id as Types.ObjectId).toString(),
          email: newsletter.email,
          username: "-",
          givenName: "-",
          role: {
            name: "-",
            slug: "-",
            level: 0,
          },
          hasAccount: false,
          newsletter: newsletter.isSubscribed,
          emailVerifiedAt: null,
          lastLoginAt: null,
          createdAt: newsletter.createdAt,
          deletedAt: null,
          isActive: true,
        });
      }
    });

    const allUsers = Array.from(usersMap.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json(
      {
        users: allUsers,
        total: allUsers.length,
        withAccount: allUsers.filter((u) => u.hasAccount).length,
        active: allUsers.filter((u) => u.isActive && u.hasAccount).length,
        newsletter: allUsers.filter((u) => u.newsletter).length,
      },
      { status: 200 }
    );
  } catch (error) {    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Erreur lors de la récupération des utilisateurs",
      },
      { status: 500 }
    );
  }
}
