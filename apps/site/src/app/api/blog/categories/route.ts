/**
 * API Route: GET /api/blog/categories
 * Liste des catégories avec compteur d'articles
 */

import { NextRequest, NextResponse } from 'next/server';
import { Category, Article } from '@coworking-cafe/database';
import type { ApiResponse, CategoryWithCount } from '@/types';

/**
 * GET /api/blog/categories
 * Récupérer la liste des catégories visibles avec compteur d'articles
 */
export async function GET(
  request: NextRequest
): Promise<NextResponse<ApiResponse<CategoryWithCount[]>>> {
  try {
    // Récupérer toutes les catégories visibles
    const categories = await Category.find({ isVisible: true })
      .sort({ order: 1, name: 1 })
      .lean();

    // Pour chaque catégorie, compter les articles publiés
    const categoriesWithCount: CategoryWithCount[] = await Promise.all(
      categories.map(async (category) => {
        const articleCount = await Article.countDocuments({
          category: category._id,
          status: 'published',
          isDeleted: false,
          publishedAt: { $lte: new Date() },
        });

        return {
          id: category._id.toString(),
          name: category.name,
          slug: category.slug,
          articleCount,
          description: category.description,
        };
      })
    );

    // Filtrer les catégories sans articles (optionnel - garder toutes)
    // const filteredCategories = categoriesWithCount.filter(cat => cat.articleCount > 0);

    return NextResponse.json({
      success: true,
      data: categoriesWithCount,
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Une erreur est survenue lors de la récupération des catégories.',
      },
      { status: 500 }
    );
  }
}
