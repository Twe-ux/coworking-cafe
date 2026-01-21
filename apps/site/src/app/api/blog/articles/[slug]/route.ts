/**
 * API Route: GET /api/blog/articles/[slug]
 * Récupérer un article par son slug
 */

import { NextRequest, NextResponse } from 'next/server';
import { Article } from '@coworking-cafe/database';
import type { ApiResponse, ArticleFull } from '@/types';

/**
 * GET /api/blog/articles/[slug]
 * Récupérer un article complet par son slug et incrémenter le compteur de vues
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
): Promise<NextResponse<ApiResponse<ArticleFull>>> {
  try {
    const { slug } = params;

    // Validation du slug
    if (!slug) {
      return NextResponse.json(
        {
          success: false,
          error: 'Le slug de l\'article est requis.',
        },
        { status: 400 }
      );
    }

    // Récupérer l'article avec populate
    const article = await Article.findOne({
      slug,
      status: 'published',
      isDeleted: false,
    })
      .populate('category', 'name slug description')
      .populate('author', 'firstName lastName email')
      .lean();

    if (!article) {
      return NextResponse.json(
        {
          success: false,
          error: 'Article introuvable ou non publié.',
        },
        { status: 404 }
      );
    }

    // Incrémenter le compteur de vues (fire and forget)
    Article.findByIdAndUpdate(article._id, { $inc: { viewCount: 1 } }).exec();

    // Récupérer les articles similaires (même catégorie)
    const relatedArticles = await Article.find({
      category: article.category?._id,
      _id: { $ne: article._id },
      status: 'published',
      isDeleted: false,
    })
      .populate('category', 'name slug')
      .select('title slug excerpt featuredImage publishedAt viewCount metaKeywords')
      .sort({ publishedAt: -1 })
      .limit(3)
      .lean();

    // Transformer en ArticleFull
    const articleFull: ArticleFull = {
      id: article._id.toString(),
      slug: article.slug,
      title: article.title,
      excerpt: article.excerpt || '',
      coverImage: article.featuredImage || '',
      content: article.content,
      category: {
        id: article.category?._id?.toString() || '',
        name: article.category?.name || 'Non catégorisé',
        slug: article.category?.slug || '',
      },
      tags: article.metaKeywords || [],
      publishedAt: article.publishedAt || new Date(),
      views: article.viewCount || 0,
      readTime: Math.ceil(article.content.length / 1000), // Estimation: 1000 chars = 1 min
      author: {
        name: `${article.author?.firstName || ''} ${article.author?.lastName || ''}`.trim() || 'Auteur inconnu',
        avatar: undefined,
        bio: undefined,
      },
      seo: {
        title: article.metaTitle || article.title,
        description: article.metaDescription || article.excerpt || '',
        keywords: article.metaKeywords || [],
        ogImage: article.featuredImage || '',
      },
      relatedArticles: relatedArticles.map((rel) => ({
        id: rel._id.toString(),
        slug: rel.slug,
        title: rel.title,
        excerpt: rel.excerpt || '',
        coverImage: rel.featuredImage || '',
        category: {
          id: rel.category?._id?.toString() || '',
          name: rel.category?.name || 'Non catégorisé',
          slug: rel.category?.slug || '',
        },
        tags: rel.metaKeywords || [],
        publishedAt: rel.publishedAt || new Date(),
        views: rel.viewCount || 0,
        readTime: Math.ceil((rel.excerpt?.length || 0) / 200),
      })),
    };

    return NextResponse.json({
      success: true,
      data: articleFull,
    });
  } catch (error) {
    console.error('Error fetching article:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Une erreur est survenue lors de la récupération de l\'article.',
      },
      { status: 500 }
    );
  }
}
