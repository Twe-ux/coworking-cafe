import {
  migrateStaffFields,
  syncStaffFields,
} from "@/lib/mongodb/migrations/staff-fields-migration";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json();

    let result;

    switch (action) {
      case "migrate":
        result = await migrateStaffFields();
        break;
      case "sync":
        result = await syncStaffFields();
        break;
      default:
        return NextResponse.json(
          {
            success: false,
            error: "Action invalide. Utilisez 'migrate' ou 'sync'",
          },
          { status: 400 },
        );
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("❌ Erreur API migration:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Erreur serveur",
      },
      { status: 500 },
    );
  }
}
