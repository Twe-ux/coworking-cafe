import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { connectToDatabase } from "@/lib/mongodb";

/**
 * GET /api/shift-types
 * Récupère les types de créneaux personnalisés
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.role || !["dev", "admin"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const db = await connectToDatabase();
    const config = await db.collection("config").findOne({ key: "shiftTypes" });

    return NextResponse.json({
      success: true,
      data: config?.value || null,
    });
  } catch (error) {
    console.error("Error fetching shift types:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch shift types" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/shift-types
 * Sauvegarde les types de créneaux personnalisés
 */
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.role || !["dev", "admin"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const { shiftTypes } = body;

    if (!shiftTypes || typeof shiftTypes !== "object") {
      return NextResponse.json(
        { success: false, error: "Invalid shift types data" },
        { status: 400 }
      );
    }

    const db = await connectToDatabase();

    await db.collection("config").updateOne(
      { key: "shiftTypes" },
      {
        $set: {
          key: "shiftTypes",
          value: shiftTypes,
          updatedAt: new Date(),
          updatedBy: session.user.email,
        },
      },
      { upsert: true }
    );

    return NextResponse.json({
      success: true,
      message: "Shift types saved successfully",
    });
  } catch (error) {
    console.error("Error saving shift types:", error);
    return NextResponse.json(
      { success: false, error: "Failed to save shift types" },
      { status: 500 }
    );
  }
}
