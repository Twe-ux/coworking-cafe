import { NextRequest, NextResponse } from "next/server";
import { promoService } from "@/lib/promo-service";

interface RevealRequest {
  session_id: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: RevealRequest = await request.json();
    const { session_id } = body;

    if (!session_id) {
      return NextResponse.json(
        { success: false, error: "session_id requis" },
        { status: 400 }
      );
    }

    await promoService.trackReveal(session_id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error tracking reveal:", error);
    return NextResponse.json(
      { success: false, error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
