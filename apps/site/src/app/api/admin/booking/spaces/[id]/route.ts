import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';
import { getServerSession } from "next-auth";
import { options as authOptions } from "@/lib/auth-options";
import { connectDB } from "@/lib/mongodb";
import SpaceConfiguration from "@/models/spaceConfiguration";
import { logger } from "@/lib/logger";

// GET - Get single space
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const space = await SpaceConfiguration.findById(id);

    if (!space) {
      return NextResponse.json({ error: "Espace non trouvé" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: space,
    });
  } catch (error) {
    logger.error("Error fetching space:", { data: error });
    return NextResponse.json(
      { error: "Erreur lors de la récupération de l'espace" },
      { status: 500 }
    );
  }
}

// PATCH - Update space
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const body = await request.json();

    const updatedSpace = await SpaceConfiguration.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

    if (!updatedSpace) {
      return NextResponse.json({ error: "Espace non trouvé" }, { status: 404 });
    }

    logger.info("Space updated:", { data: { spaceId: id, spaceType: updatedSpace.spaceType } });

    return NextResponse.json({
      success: true,
      data: updatedSpace,
    });
  } catch (error: any) {
    logger.error("Error updating space:", { data: error });

    // Handle duplicate key error
    if (error.code === 11000) {
      return NextResponse.json(
        { error: "Un espace avec ce type ou slug existe déjà" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Erreur lors de la mise à jour de l'espace" },
      { status: 500 }
    );
  }
}

// DELETE - Soft delete space
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    const deletedSpace = await SpaceConfiguration.findByIdAndUpdate(
      id,
      { isDeleted: true, isActive: false },
      { new: true }
    );

    if (!deletedSpace) {
      return NextResponse.json({ error: "Espace non trouvé" }, { status: 404 });
    }

    logger.info("Space deleted:", { data: { spaceId: id, spaceType: deletedSpace.spaceType } });

    return NextResponse.json({
      success: true,
      message: "Espace supprimé avec succès",
    });
  } catch (error) {
    logger.error("Error deleting space:", { data: error });
    return NextResponse.json(
      { error: "Erreur lors de la suppression de l'espace" },
      { status: 500 }
    );
  }
}
