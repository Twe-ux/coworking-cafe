/**
 * API Route: GET /api/blog/articles
 * Liste des articles publiés avec filtres et pagination
 */

import { NextRequest, NextResponse } from 'next/server';
import { Article, Category } from '@coworking-cafe/database';
import type { ApiResponse, PaginatedResult, ArticlePreview } from '@/types';

/**
 * GET /api/blog/articles
 * Récupérer la liste des articles publiés avec filtres
 *
 * Query params:
 * - category: string (slug de catégorie)
 * - tag: string (tag à rechercher)
 * - search: string (recherche dans titre/contenu)
 * - page: number (défaut: 1)
 * - pageSize: number (défaut: 10)
 */
export async function GET(
  request: NextRequest
): Promise<NextResponse<ApiResponse<PaginatedResult<ArticlePreview>>>> {
  try {
    const { searchParams } = new URL(request.url);

    // Récupérer les paramètres
    const categorySlug = searchParams.get('category');
    const tag = searchParams.get('tag');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = Math.min(parseInt(searchParams.get('pageSize') || '10'), 50); // Max 50

    // Validation pagination
    if (page < 1 || pageSize < 1) {
      return NextResponse.json(
        {
          success: false,
          error: 'Les paramètres de pagination doivent être positifs.',
        },
        { status: 400 }
      );
    }

    // Construire la query MongoDB
    const query: Record<string, unknown> = {
      status: 'published',
      isDeleted: false,
      publishedAt: { $lte: new Date() },
    };

    // Filtre par catégorie
    if (categorySlug) {
      const category = await Category.findOne({ slug: categorySlug }).lean();
      if (!category) {
        return NextResponse.json(
          {
            success: false,
            error: 'Catégorie introuvable.',
          },
          { status: 404 }
        );
      }
      query.category = category._id;
    }

    // Filtre par tag
    if (tag) {
      query.metaKeywords = { $in: [tag] };
    }

    // Recherche textuelle
    if (search) {
      query.$text = { $search: search };
    }

    // Compter le total
    const total = await Article.countDocuments(query);

    // Calculer la pagination
    const skip = (page - 1) * pageSize;
    const totalPages = Math.ceil(total / pageSize);

    // Récupérer les articles
    const articles = await Article.find(query)
      .populate('category', 'name slug')
      .populate('author', 'firstName lastName')
      .select('title slug excerpt featuredImage metaKeywords publishedAt viewCount')
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(pageSize)
      .lean();

    // Transformer en ArticlePreview
    const items: ArticlePreview[] = articles.map((article) => ({
      id: article._id.toString(),
      slug: article.slug,
      title: article.title,
      excerpt: article.excerpt || '',
      coverImage: article.featuredImage || '',
      category: {
        id: article.category?._id?.toString() || '',
        name: article.category?.name || 'Non catégorisé',
        slug: article.category?.slug || '',
      },
      tags: article.metaKeywords || [],
      publishedAt: article.publishedAt || new Date(),
      views: article.viewCount || 0,
      readTime: Math.ceil((article.excerpt?.length || 0) / 200), // Estimation
    }));

    // Construire la réponse paginée
    const paginatedResult: PaginatedResult<ArticlePreview> = {
      items,
      total,
      page,
      pageSize,
      totalPages,
      hasNext: page < totalPages,
      hasPrevious: page > 1,
    };

    return NextResponse.json({
      success: true,
      data: paginatedResult,
    });
  } catch (error) {
    console.error('Error fetching articles:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Une erreur est survenue lors de la récupération des articles.',
      },
      { status: 500 }
    );
  }
}
