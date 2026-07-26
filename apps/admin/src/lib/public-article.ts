// Forme publique d'un article — API lecture seule consommée par les sites vitrines
// (ex. coworkingcafe.fr en fetch ISR). N'expose QUE les champs publics, jamais
// les métadonnées internes (isDeleted, viewCount, author.email…).

export interface PublicArticle {
  slug: string
  title: string
  excerpt: string
  featuredImage: string | null
  imgAlt: string | null
  category: { name: string; slug: string } | null
  author: { name: string | null; username: string | null } | null
  publishedAt: string | null
  createdAt: string | null
  readingTime: number
  isFeatured: boolean
  metaKeywords: string[]
  content?: string // présent uniquement sur le détail
}

// Forme "lean" attendue en entrée (sous-ensemble du document Mongo peuplé).
export interface LeanArticle {
  slug: string
  title: string
  excerpt?: string
  content?: string
  featuredImage?: string
  imgAlt?: string
  readingTime?: number
  isFeatured?: boolean
  metaKeywords?: string[]
  publishedAt?: Date | string
  createdAt?: Date | string
  category?: { name?: string; slug?: string } | null
  author?: { name?: string; username?: string } | null
}

function toIso(d?: Date | string): string | null {
  return d ? new Date(d).toISOString() : null
}

export function toPublicArticle(
  a: LeanArticle,
  opts: { includeContent?: boolean } = {}
): PublicArticle {
  return {
    slug: a.slug,
    title: a.title,
    excerpt: a.excerpt ?? '',
    featuredImage: a.featuredImage ?? null,
    imgAlt: a.imgAlt ?? null,
    category: a.category
      ? { name: a.category.name ?? '', slug: a.category.slug ?? '' }
      : null,
    author: a.author
      ? { name: a.author.name ?? null, username: a.author.username ?? null }
      : null,
    publishedAt: toIso(a.publishedAt),
    createdAt: toIso(a.createdAt),
    readingTime: a.readingTime ?? 0,
    isFeatured: Boolean(a.isFeatured),
    metaKeywords: a.metaKeywords ?? [],
    ...(opts.includeContent ? { content: a.content ?? '' } : {}),
  }
}

// En-têtes CORS + cache CDN pour les endpoints publics de lecture (fetch cross-origin
// depuis les sites vitrines). successResponse() n'accepte pas de headers custom, d'où
// l'usage direct de NextResponse.json dans les routes publiques.
export const PUBLIC_CORS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
}
