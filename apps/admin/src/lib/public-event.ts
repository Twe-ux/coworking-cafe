// Forme publique d'un événement — API lecture seule consommée par les sites
// vitrines (fetch ISR). N'expose que des champs publics d'affichage.

// En-têtes CORS + cache CDN pour les endpoints publics de lecture (fetch cross-origin).
export const PUBLIC_CORS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
}

export interface PublicEvent {
  slug: string
  title: string
  description: string
  shortDescription: string | null
  date: string // YYYY-MM-DD
  startTime: string | null // HH:mm
  endTime: string | null // HH:mm
  category: string[]
  imgSrc: string | null
  imgAlt: string | null
  location: string | null
  priceType: 'free' | 'organizer' | 'fixed' | null
  price: number | null
  organizer: string | null
  externalLink: string | null
}

export interface LeanEvent {
  slug?: string
  title: string
  description: string
  shortDescription?: string
  date: string
  startTime?: string
  endTime?: string
  category?: string[]
  imgSrc?: string
  imgAlt?: string
  location?: string
  priceType?: 'free' | 'organizer' | 'fixed'
  price?: number
  organizer?: string
  externalLink?: string
}

export function toPublicEvent(e: LeanEvent): PublicEvent {
  return {
    slug: e.slug ?? '',
    title: e.title,
    description: e.description,
    shortDescription: e.shortDescription ?? null,
    date: e.date,
    startTime: e.startTime ?? null,
    endTime: e.endTime ?? null,
    category: e.category ?? [],
    imgSrc: e.imgSrc ?? null,
    imgAlt: e.imgAlt ?? null,
    location: e.location ?? null,
    priceType: e.priceType ?? null,
    price: typeof e.price === 'number' ? e.price : null,
    organizer: e.organizer ?? null,
    externalLink: e.externalLink ?? null,
  }
}
