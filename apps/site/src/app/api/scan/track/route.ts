import { NextRequest, NextResponse } from "next/server";
import { promoService } from "../../../../lib/promo-service";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { session_id } = body;

    if (!session_id) {
      return NextResponse.json({ error: "session_id requis" }, { status: 400 });
    }

    await promoService.trackScan(session_id);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
