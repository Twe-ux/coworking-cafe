import { NextRequest, NextResponse } from "next/server";
import { promoService } from "@/lib/promo-service";

interface CopyRequest {
  session_id: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: CopyRequest = await request.json();
    const { session_id } = body;

    if (!session_id) {
      return NextResponse.json(
        { success: false, error: "session_id requis" },
        { status: 400 }
      );
    }

    await promoService.trackCopy(session_id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error tracking copy:", error);
    return NextResponse.json(
      { success: false, error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
