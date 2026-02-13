import Image from "next/image";
import Link from "next/link";
import { connectDB } from "../../../lib/mongodb";
import { Article } from '@coworking-cafe/database';

interface ArticleData {
  _id: string;
  title: string;
  slug: string;
  featuredImage?: string;
  category?: {
    _id: string;
    name: string;
  };
}

async function getRelatedArticles(currentSlug: string): Promise<ArticleData[]> {
  try {
    await connectDB();

    // Get current article to find its category
    const currentArticle = await Article.findOne({
      slug: currentSlug,
      isDeleted: false
    })
      .select('category')
      .lean();

    if (!currentArticle) {
      return [];
    }

    // Find other articles in the same category
    const query: any = {
      isDeleted: false,
      status: "published",
      publishedAt: { $lte: new Date() },
      slug: { $ne: currentSlug } // Exclude current article
    };

    // If article has a category, prioritize same category
    if (currentArticle.category) {
      query.category = currentArticle.category;
    }

    let articles = await Article.find(query)
      .select('title slug featuredImage category')
      .populate('category', 'name')
      .sort({ publishedAt: -1 })
      .limit(3)
      .lean<ArticleData[]>();

    // If less than 3 articles in same category, get recent articles
    if (articles.length < 3) {
      const additionalArticles = await Article.find({
        isDeleted: false,
        status: "published",
        publishedAt: { $lte: new Date() },
        slug: { $ne: currentSlug },
        _id: { $nin: articles.map(a => a._id) } // Exclude already found articles
      })
        .select('title slug featuredImage category')
        .populate('category', 'name')
        .sort({ publishedAt: -1 })
        .limit(3 - articles.length)
        .lean<ArticleData[]>();

      articles = [...articles, ...additionalArticles];
    }

    return articles.map(article => ({
      _id: article._id.toString(),
      title: article.title,
      slug: article.slug,
      featuredImage: article.featuredImage,
      category: article.category ? {
        _id: article.category._id.toString(),
        name: article.category.name
      } : undefined
    }));
  } catch (error) {
    console.error('Error fetching related articles:', error);
    return [];
  }
}

interface RelatedArticlesProps {
  currentSlug: string;
}

export default async function RelatedArticles({ currentSlug }: RelatedArticlesProps) {
  const articles = await getRelatedArticles(currentSlug);

  if (articles.length === 0) {
    return null;
  }

  return (
    <section className="related-articles py-5" style={{ backgroundColor: '#f8f9fa' }}>
      <div className="container">
        <h3 className="text-center mb-5">Articles similaires</h3>
        <div className="row">
          {articles.map((article) => (
            <div key={article._id} className="col-lg-4 col-md-6 mb-4">
              <div className="blogs__wapper_card">
                <Link href={`/blog/${article.slug}`}>
                  <Image
                    src={article.featuredImage || "/images/blogs/blog-1.webp"}
                    alt={`${article.title} - CoworKing Café`}
                    width={600}
                    height={400}
                    loading="lazy"
                    quality={85}
                    className="card__thumb"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </Link>
                <div>
                  {article.category && (
                    <span className="badge bg-success mb-2">
                      {article.category.name}
                    </span>
                  )}
                  <Link href={`/blog/${article.slug}`} className="card__title t__28">
                    {article.title}
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="text-center mt-4 mb-5">
          <Link href="/blog" className="common__btn">
            <span>Voir tous les articles</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
