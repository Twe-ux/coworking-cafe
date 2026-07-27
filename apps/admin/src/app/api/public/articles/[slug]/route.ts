import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { Article, Category } from '@coworking-cafe/database'
import { toPublicArticle, PUBLIC_CORS, type LeanArticle } from '@/lib/public-article'

export const dynamic = 'force-dynamic'

// Force l'enregistrement du modèle Category avant .populate().
const _ensureModels = [Category]

export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, { status: 204, headers: PUBLIC_CORS })
}

/**
 * GET /api/public/articles/[slug]
 * Détail PUBLIC d'un article publié, AVEC le corps (markdown), pour les sites vitrines.
 * Aucune authentification. CORS ouvert (lecture seule).
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: { slug: string } }
): Promise<NextResponse> {
  try {
    await connectDB()

    const doc = await Article.findOne({
      slug: params.slug,
      isDeleted: false,
      status: 'published',
      publishedAt: { $lte: new Date() },
    })
      .populate('author', 'username name')
      .populate('category', 'name slug')
      .lean()

    if (!doc) {
      return NextResponse.json(
        { error: 'Article introuvable' },
        { status: 404, headers: PUBLIC_CORS }
      )
    }

    const article = toPublicArticle(doc as unknown as LeanArticle, {
      includeContent: true,
    })

    return NextResponse.json({ article }, { headers: PUBLIC_CORS })
  } catch (error) {
    console.error('[GET /api/public/articles/[slug]] Error:', error)
    return NextResponse.json(
      { error: "Erreur lors de la récupération de l'article" },
      { status: 500, headers: PUBLIC_CORS }
    )
  }
}
