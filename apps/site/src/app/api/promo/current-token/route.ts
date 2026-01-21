import { NextResponse } from "next/server";
import { promoService } from "@/lib/promo-service";

export async function GET() {
  try {
    const token = await promoService.getCurrentToken();

    return NextResponse.json({ token });
  } catch (error) {
    console.error("Error getting current token:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
