import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { Event } from '@coworking-cafe/database'
import { toPublicEvent, PUBLIC_CORS, type LeanEvent } from '@/lib/public-event'

export const dynamic = 'force-dynamic'

export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, { status: 204, headers: PUBLIC_CORS })
}

/**
 * GET /api/public/events
 * Liste PUBLIQUE des événements publiés À VENIR (date >= aujourd'hui), pour les
 * sites vitrines. `?past=1` inclut aussi les événements passés. `?limit=`.
 * Aucune authentification. CORS ouvert (lecture seule).
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const limit = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get('limit') || '100'))
    )
    const includePast = searchParams.get('past') === '1'

    const query: Record<string, unknown> = { status: 'published' }
    if (!includePast) {
      // `date` est stocké en "YYYY-MM-DD" → comparaison lexicographique valide.
      query.date = { $gte: new Date().toISOString().slice(0, 10) }
    }

    const docs = await Event.find(query).sort({ date: 1 }).limit(limit).lean()
    const events = (docs as unknown as LeanEvent[]).map(toPublicEvent)

    return NextResponse.json(
      { events, total: events.length },
      { headers: PUBLIC_CORS }
    )
  } catch (error) {
    console.error('[GET /api/public/events] Error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des événements' },
      { status: 500, headers: PUBLIC_CORS }
    )
  }
}
