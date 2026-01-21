/**
 * ArticleList Component - apps/site
 * Grid responsive pour afficher une liste d'articles
 */

'use client';

import type { ArticlePreview } from '@/types';
import { ArticleCard } from './ArticleCard';

interface ArticleListProps {
  articles: ArticlePreview[];
}

export function ArticleList({ articles }: ArticleListProps) {
  if (articles.length === 0) {
    return (
      <div className="article-list--empty">
        <p className="article-list__empty-message">Aucun article disponible pour le moment.</p>
      </div>
    );
  }

  return (
    <div className="article-list">
      <div className="article-list__grid">
        {articles.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
    </div>
  );
}
