/**
 * Category Page - apps/site
 * Liste des articles filtrés par catégorie
 */

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { apiClient } from '@/lib/utils/api-client';
import { ArticleList } from '@/components/blog/ArticleList';
import type { ArticlePreview, Category } from '@/types';

interface PageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const response = await apiClient.get<Category>(`/blog/categories/${params.slug}`);

    if (!response.success || !response.data) {
      return {
        title: 'Catégorie introuvable',
        robots: { index: false, follow: false },
      };
    }

    const category = response.data;

    return {
      title: `${category.name} | Blog CoworKing Café`,
      description: category.description || `Tous les articles de la catégorie ${category.name}`,
      openGraph: {
        title: `${category.name} - Blog CoworKing Café`,
        description: category.description || `Tous les articles de la catégorie ${category.name}`,
        url: `https://coworkingcafe.fr/blog/category/${category.slug}`,
        siteName: 'CoworKing Café',
        type: 'website',
      },
      alternates: {
        canonical: `https://coworkingcafe.fr/blog/category/${category.slug}`,
      },
    };
  } catch (error) {
    return {
      title: 'Catégorie introuvable',
      robots: { index: false, follow: false },
    };
  }
}

export default async function CategoryPage({ params }: PageProps) {
  const categoryResponse = await apiClient.get<Category>(`/blog/categories/${params.slug}`);

  if (!categoryResponse.success || !categoryResponse.data) {
    notFound();
  }

  const category = categoryResponse.data;

  const articlesResponse = await apiClient.get<{
    articles: ArticlePreview[];
    pages: number;
    total: number;
  }>(`/blog/articles?category=${category.id}&status=published&limit=20`);

  const articles =
    articlesResponse.success && articlesResponse.data
      ? articlesResponse.data.articles
      : [];

  return (
    <main className="page-category">
      <section className="page-category__hero">
        <div className="container">
          <div className="page-category__breadcrumb">
            <a href="/blog" className="page-category__breadcrumb-link">
              Blog
            </a>
            <span className="page-category__breadcrumb-separator">/</span>
            <span className="page-category__breadcrumb-current">{category.name}</span>
          </div>

          <h1 className="page-category__title">{category.name}</h1>
          {category.description && (
            <p className="page-category__description">{category.description}</p>
          )}

          <div className="page-category__meta">
            <span className="page-category__count">
              {articles.length} article{articles.length > 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </section>

      <section className="page-category__content py__130">
        <div className="container">
          {articles.length === 0 ? (
            <div className="page-category__empty">
              <p className="page-category__empty-message">
                Aucun article disponible dans cette catégorie pour le moment.
              </p>
              <a href="/blog" className="btn btn-primary mt-3">
                Retour au blog
              </a>
            </div>
          ) : (
            <ArticleList articles={articles} />
          )}
        </div>
      </section>
    </main>
  );
}
