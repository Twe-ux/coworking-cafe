/**
 * ArticleCard Component - apps/site
 * Card pour afficher un aperçu d'article dans une liste
 */

'use client';

import Link from 'next/link';
import Image from 'next/image';
import type { ArticlePreview } from '@/types';
import { formatDateFr } from '@/lib/utils/format-date';

interface ArticleCardProps {
  article: ArticlePreview;
}

export function ArticleCard({ article }: ArticleCardProps) {
  return (
    <article className="article-card">
      <Link href={`/blog/${article.slug}`} className="article-card__link">
        <div className="article-card__image-wrapper">
          <Image
            src={article.coverImage}
            alt={article.title}
            width={600}
            height={400}
            className="article-card__image"
            loading="lazy"
            quality={85}
          />
          <span className="article-card__category">{article.category.name}</span>
        </div>

        <div className="article-card__content">
          <h3 className="article-card__title">{article.title}</h3>

          <p className="article-card__excerpt">{article.excerpt}</p>

          <div className="article-card__meta">
            <time
              dateTime={article.publishedAt.toISOString()}
              className="article-card__meta-date"
            >
              {formatDateFr(article.publishedAt.toISOString().split('T')[0])}
            </time>

            <div className="article-card__meta-stats">
              {article.views > 0 && (
                <span className="article-card__meta-views">{article.views} vues</span>
              )}
              <span className="article-card__meta-read-time">{article.readTime} min</span>
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
}
