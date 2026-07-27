import { NextRequest, NextResponse } from 'next/server'
import { connectMongoose } from '@/lib/mongodb'
import { Article } from '@/models/article'
import { Category } from '@/models/category'
import { toPublicArticle, PUBLIC_CORS, type LeanArticle } from '@/lib/public-article'

export const dynamic = 'force-dynamic'

// Force l'enregistrement du modèle Category avant .populate() (évite MissingSchemaError).
const _ensureModels = [Category]

export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, { status: 204, headers: PUBLIC_CORS })
}

/**
 * GET /api/public/articles
 * Liste PUBLIQUE des articles publiés (sans le corps), pour les sites vitrines.
 * Aucune authentification. CORS ouvert (lecture seule).
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    await connectMongoose()

    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get('limit') || '100'))
    )
    const skip = (page - 1) * limit

    const filter = {
      isDeleted: false,
      status: 'published',
      publishedAt: { $lte: new Date() },
    }

    const [docs, total] = await Promise.all([
      Article.find(filter)
        .select('-content')
        .populate('author', 'username name')
        .populate('category', 'name slug')
        .sort({ publishedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Article.countDocuments(filter),
    ])

    const articles = (docs as unknown as LeanArticle[]).map((d) =>
      toPublicArticle(d)
    )

    return NextResponse.json(
      { articles, total, page, pages: Math.ceil(total / limit) },
      { headers: PUBLIC_CORS }
    )
  } catch (error) {
    console.error('[GET /api/public/articles] Error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des articles' },
      { status: 500, headers: PUBLIC_CORS }
    )
  }
}
