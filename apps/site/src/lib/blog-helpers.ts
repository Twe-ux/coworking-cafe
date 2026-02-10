import { connectToDatabase, Article } from '@coworking-cafe/database';

export interface ArticleForSitemap {
  slug: string;
  updatedAt: Date;
}

/**
 * Fetch all published articles for sitemap generation
 * Only returns slug and updatedAt to minimize data transfer
 */
export async function fetchAllPublishedArticles(): Promise<ArticleForSitemap[]> {
  try {
    await connectToDatabase();

    const articles = await Article.find({
      status: 'published',
      isDeleted: false,
    })
      .select('slug updatedAt')
      .sort({ updatedAt: -1 })
      .lean<ArticleForSitemap[]>();

    return articles.map(article => ({
      slug: article.slug,
      updatedAt: article.updatedAt || new Date(),
    }));
  } catch (error) {
    console.error('Error fetching articles for sitemap:', error);
    // Return empty array to avoid breaking sitemap generation
    return [];
  }
}
