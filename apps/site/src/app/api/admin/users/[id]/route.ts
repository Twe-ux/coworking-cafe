import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import dbConnect from "@/lib/mongodb";
import { User } from "@/models/user";
import { Newsletter } from "@/models/newsletter";
import { options } from "@/lib/auth-options";

export const dynamic = "force-dynamic";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(options);

    if (!session?.user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    // Check if user is admin or higher (level >= 80)
    if (session.user.role.level < 80) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    await dbConnect();

    const { id } = params;

    // Try to find and delete from User collection first
    const user = await User.findByIdAndDelete(id);

    if (user) {
      return NextResponse.json(
        { success: true, message: "Utilisateur supprimé avec succès" },
        { status: 200 }
      );
    }

    // If not found in User, try Newsletter collection
    const newsletter = await Newsletter.findByIdAndDelete(id);

    if (newsletter) {
      return NextResponse.json(
        { success: true, message: "Email newsletter supprimé avec succès" },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { error: "Utilisateur ou email non trouvé" },
      { status: 404 }
    );
  } catch (error) {    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Erreur lors de la suppression",
      },
      { status: 500 }
    );
  }
}
