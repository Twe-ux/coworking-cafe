import type { Metadata } from "next";
import Link from "next/link";
import { connectDB } from "../../../../lib/mongodb";
import { Article } from '@coworking-cafe/database';
import PageTitle from "../../../../components/site/PageTitle";

export const metadata: Metadata = {
  title: "Archive des articles | Blog CoworKing Café",
  description: "Retrouvez tous nos articles sur le coworking, la productivité et le télétravail à Strasbourg.",
  openGraph: {
    title: "Archive des articles - Blog CoworKing Café",
    description: "Tous nos articles sur le coworking, la productivité et le télétravail à Strasbourg.",
    url: "https://coworkingcafe.fr/blog/archive",
    type: "website",
    images: [
      {
        url: "/images/og-image.png",
        width: 1200,
        height: 630,
        alt: "CoworKing Café - Archive Blog",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Archive des articles - Blog CoworKing Café",
    description: "Tous nos articles sur le coworking, la productivité et le télétravail à Strasbourg.",
    images: ["/images/og-image.png"],
  },
  alternates: {
    canonical: "https://coworkingcafe.fr/blog/archive",
  },
  robots: {
    index: true,
    follow: true,
  },
};

interface ArticleArchiveItem {
  _id: string;
  title: string;
  slug: string;
  publishedAt: string;
  category?: {
    _id: string;
    name: string;
  };
}

async function getAllPublishedArticles(): Promise<ArticleArchiveItem[]> {
  try {
    await connectDB();

    const articles = await Article.find({
      isDeleted: false,
      status: "published",
      publishedAt: { $lte: new Date() }
    })
      .select('title slug publishedAt category')
      .populate('category', 'name')
      .sort({ publishedAt: -1 })
      .lean<ArticleArchiveItem[]>();

    return articles.map(article => ({
      _id: article._id.toString(),
      title: article.title,
      slug: article.slug,
      publishedAt: new Date(article.publishedAt).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      category: article.category ? {
        _id: article.category._id.toString(),
        name: article.category.name
      } : undefined
    }));
  } catch (error) {
    console.error('Error fetching articles archive:', error);
    return [];
  }
}

export default async function BlogArchivePage() {
  const articles = await getAllPublishedArticles();

  // Group articles by year
  const articlesByYear = articles.reduce((acc, article) => {
    const year = new Date(article.publishedAt).getFullYear().toString();
    if (!acc[year]) {
      acc[year] = [];
    }
    acc[year].push(article);
    return acc;
  }, {} as Record<string, ArticleArchiveItem[]>);

  const years = Object.keys(articlesByYear).sort((a, b) => parseInt(b) - parseInt(a));

  return (
    <>
      <PageTitle title="Archive des articles" />
      <section className="blog-archive py__130">
        <div className="container">
          <div className="row">
            <div className="col-12">
              <div className="text-center mb-5">
                <h1 className="mb-3">Archive du blog</h1>
                <p className="text-muted">
                  Tous nos articles sur le coworking, la productivité et le télétravail ({articles.length} articles)
                </p>
                <Link href="/blog" className="btn btn-outline-dark mt-3">
                  ← Retour au blog
                </Link>
              </div>

              {years.length === 0 ? (
                <div className="alert alert-info text-center">
                  Aucun article publié pour le moment.
                </div>
              ) : (
                years.map(year => (
                  <div key={year} className="mb-5">
                    <h2 className="h3 mb-4 pb-2 border-bottom">{year}</h2>
                    <ul className="list-unstyled">
                      {articlesByYear[year].map(article => (
                        <li key={article._id} className="mb-3 pb-3 border-bottom">
                          <div className="row align-items-center">
                            <div className="col-md-2 text-muted small">
                              {article.publishedAt}
                            </div>
                            <div className="col-md-7">
                              <Link
                                href={`/blog/${article.slug}`}
                                className="h5 mb-0 d-block text-dark text-decoration-none archive-article-link"
                              >
                                {article.title}
                              </Link>
                            </div>
                            <div className="col-md-3 text-end">
                              {article.category && (
                                <span className="badge bg-success">
                                  {article.category.name}
                                </span>
                              )}
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
