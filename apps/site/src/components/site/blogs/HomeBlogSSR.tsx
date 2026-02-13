import Image from "next/image";
import Link from "next/link";
import { connectDB } from "../../../lib/mongodb";
import { Article } from '@coworking-cafe/database';

interface ArticleData {
  _id: string;
  title: string;
  slug: string;
  featuredImage?: string;
}

async function getRecentArticles(): Promise<ArticleData[]> {
  try {
    await connectDB();

    const articles = await Article.find({
      isDeleted: false,
      status: "published",
      publishedAt: { $lte: new Date() }
    })
      .select('title slug featuredImage')
      .sort({ publishedAt: -1 })
      .limit(3)
      .lean<ArticleData[]>();

    return articles.map(article => ({
      _id: article._id.toString(),
      title: article.title,
      slug: article.slug,
      featuredImage: article.featuredImage
    }));
  } catch (error) {
    console.error('Error fetching articles:', error);
    return [];
  }
}

interface HomeBlogSSRProps {
  className?: string;
}

export default async function HomeBlogSSR({ className = "" }: HomeBlogSSRProps) {
  const articles = await getRecentArticles();

  if (articles.length === 0) {
    return null; // Don't render section if no articles
  }

  return (
    <section className={`blogs ${className}`}>
      <div className="container">
        {/* Title */}
        <div className="">
          <h2 className="title text-center">Entre projets et cappuccinos :</h2>
          <p className="d-flex justify-content-center mt-4 subtitle">
            nos actus, nos conseils et la worklife des sans bureau fixe.
          </p>
        </div>

        {/* Articles Grid */}
        <div className="blogs__wapper">
          <div className="row">
            {articles.map((article) => (
              <div key={article._id} className="col-lg-4 col-md-6 mb-lg-0 mb-5">
                <div className="blogs__wapper_card">
                  <Link href={`/blog/${article.slug}`}>
                    <Image
                      src={article.featuredImage || "/images/blogs/blog-1.webp"}
                      alt={`${article.title} - CoworKing Café Anticafé Strasbourg`}
                      width={600}
                      height={400}
                      loading="lazy"
                      quality={85}
                      className="card__thumb"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </Link>
                  <div>
                    <Link href={`/blog/${article.slug}`} className="card__title t__28">
                      {article.title}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Links to blog */}
        <div className="text-center mt-3 mt-md-5 mb-5">
          <Link href="/blog" className="common__btn me-md-3 mb-3 mb-md-0 d-block d-md-inline-block">
            <span>Voir tous les articles</span>
          </Link>
          <Link href="/blog/archive" className="common__btn d-block d-md-inline-block">
            <span>Archives complètes</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
