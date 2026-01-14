import { NextResponse } from 'next/server';
import { promoService } from '@/lib/promo-service';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const token = await promoService.getCurrentToken();

    return NextResponse.json({ token }, { status: 200 });
  } catch (error) {    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
