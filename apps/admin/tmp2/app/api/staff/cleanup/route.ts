import {
  checkFieldsStatus,
  cleanupLegacyFields,
} from "@/lib/mongodb/migrations/cleanup-legacy-fields";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json();

    let result;

    switch (action) {
      case "cleanup":
        result = await cleanupLegacyFields();
        break;
      case "check":
        result = await checkFieldsStatus();
        break;
      default:
        return NextResponse.json(
          {
            success: false,
            error: "Action invalide. Utilisez 'cleanup' ou 'check'",
          },
          { status: 400 },
        );
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("❌ Erreur API cleanup:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Erreur serveur",
      },
      { status: 500 },
    );
  }
}
