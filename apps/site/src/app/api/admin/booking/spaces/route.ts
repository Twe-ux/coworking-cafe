import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';
import { getServerSession } from "next-auth";
import { options as authOptions } from "@/lib/auth-options";
import { connectDB } from "@/lib/mongodb";
import SpaceConfiguration from "@/models/spaceConfiguration";
import { logger } from "@/lib/logger";

// GET - List all spaces
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Check if user is staff or higher (level >= 60)
    if (session.user.role.level < 60) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const includeDeleted = searchParams.get("includeDeleted") === "true";

    const query = includeDeleted ? {} : { isDeleted: false };

    const spaces = await SpaceConfiguration.find(query).sort({ displayOrder: 1, createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: spaces,
    });
  } catch (error) {
    logger.error("Error fetching spaces:", { data: error });
    return NextResponse.json(
      { error: "Erreur lors de la récupération des espaces" },
      { status: 500 }
    );
  }
}

// POST - Create new space
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Check if user is admin or higher (level >= 80)
    if (session.user.role.level < 80) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    await connectDB();

    const body = await request.json();

    // Create new space
    const newSpace = new SpaceConfiguration(body);
    await newSpace.save();

    logger.info("Space created:", { data: { spaceId: newSpace._id, spaceType: newSpace.spaceType } });

    return NextResponse.json({
      success: true,
      data: newSpace,
    });
  } catch (error: any) {
    logger.error("Error creating space:", { data: error });

    // Handle duplicate key error
    if (error.code === 11000) {
      return NextResponse.json(
        { error: "Un espace avec ce type ou slug existe déjà" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Erreur lors de la création de l'espace" },
      { status: 500 }
    );
  }
}
