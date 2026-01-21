/**
 * Article Detail Page - apps/site
 * Page détail d'un article de blog avec métadonnées SEO dynamiques
 */

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { apiClient } from '@/lib/utils/api-client';
import { formatDateFr } from '@/lib/utils/format-date';
import { CommentSection } from '@/components/blog/CommentSection';
import type { Article } from '@/types';

interface PageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const response = await apiClient.get<Article>(`/blog/articles/${params.slug}`);

    if (!response.success || !response.data) {
      return {
        title: 'Article introuvable',
        robots: { index: false, follow: false },
      };
    }

    const article = response.data;

    return {
      title: `${article.title} | Blog CoworKing Café`,
      description: article.excerpt,
      keywords: article.tags,
      authors: [{ name: 'CoworKing Café' }],
      openGraph: {
        title: article.title,
        description: article.excerpt,
        url: `https://coworkingcafe.fr/blog/${article.slug}`,
        siteName: 'CoworKing Café',
        images: [
          {
            url: article.coverImage,
            width: 1200,
            height: 630,
            alt: article.title,
          },
        ],
        locale: 'fr_FR',
        type: 'article',
        publishedTime: article.publishedAt.toISOString(),
        modifiedTime: article.updatedAt.toISOString(),
        authors: ['CoworKing Café'],
        tags: article.tags,
      },
      twitter: {
        card: 'summary_large_image',
        title: article.title,
        description: article.excerpt,
        images: [article.coverImage],
      },
      alternates: {
        canonical: `https://coworkingcafe.fr/blog/${article.slug}`,
      },
    };
  } catch (error) {
    return {
      title: 'Article introuvable',
      robots: { index: false, follow: false },
    };
  }
}

export default async function ArticlePage({ params }: PageProps) {
  const response = await apiClient.get<Article>(`/blog/articles/${params.slug}`);

  if (!response.success || !response.data) {
    notFound();
  }

  const article = response.data;

  // Schema.org JSON-LD pour SEO
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: article.title,
    description: article.excerpt,
    image: article.coverImage,
    datePublished: article.publishedAt.toISOString(),
    dateModified: article.updatedAt.toISOString(),
    author: {
      '@type': 'Organization',
      name: 'CoworKing Café',
    },
    publisher: {
      '@type': 'Organization',
      name: 'CoworKing Café',
      logo: {
        '@type': 'ImageObject',
        url: 'https://coworkingcafe.fr/images/logo.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://coworkingcafe.fr/blog/${article.slug}`,
    },
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Accueil',
        item: 'https://coworkingcafe.fr',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Blog',
        item: 'https://coworkingcafe.fr/blog',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: article.title,
        item: `https://coworkingcafe.fr/blog/${article.slug}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <article className="page-article">
        <div className="container">
          <header className="page-article__header">
            <div className="page-article__meta">
              <span className="page-article__category">{article.category.name}</span>
              <time
                className="page-article__date"
                dateTime={article.publishedAt.toISOString()}
              >
                {formatDateFr(article.publishedAt.toISOString().split('T')[0])}
              </time>
            </div>

            <h1 className="page-article__title">{article.title}</h1>
            <p className="page-article__excerpt">{article.excerpt}</p>

            <div className="page-article__cover-wrapper">
              <Image
                src={article.coverImage}
                alt={article.title}
                width={1200}
                height={600}
                priority
                quality={90}
                className="page-article__cover"
              />
            </div>
          </header>

          <div className="page-article__body">
            <div
              className="page-article__content"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />

            <footer className="page-article__footer">
              {article.tags.length > 0 && (
                <div className="page-article__tags">
                  <h3 className="page-article__tags-title">Tags</h3>
                  <div className="page-article__tags-list">
                    {article.tags.map((tag) => (
                      <span key={tag} className="page-article__tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="page-article__stats">
                <span className="page-article__stat">{article.views} vues</span>
                <span className="page-article__stat">{article.readTime} min de lecture</span>
              </div>
            </footer>
          </div>

          <CommentSection articleSlug={article.slug} />
        </div>
      </article>
    </>
  );
}
