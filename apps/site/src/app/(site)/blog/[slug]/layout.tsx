import type { Metadata } from "next";
import { headers } from "next/headers";
import RelatedArticles from "../../../../components/site/blogs/RelatedArticles";

// Fetch article data for metadata
async function getArticle(slug: string) {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/articles/${slug}`, {
      next: { revalidate: 3600 }, // Cache 1h
    });

    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const article = await getArticle(params.slug);

  if (!article) {
    return {
      title: "Article non trouvé | CoworKing Café Strasbourg",
      description: "Cet article n'existe pas ou n'est plus disponible.",
    };
  }

  const title = `${article.title} | Blog CoworKing Café Strasbourg`;
  const description =
    article.excerpt ||
    article.content?.substring(0, 155) ||
    "Découvrez nos conseils et actualités sur le coworking à Strasbourg.";

  return {
    title,
    description,
    keywords: [
      article.category?.name,
      "coworking strasbourg",
      "blog coworking",
      "anticafé",
      "espace coworking",
      ...(article.tags || []),
    ].filter(Boolean),
    openGraph: {
      title,
      description,
      url: `https://coworkingcafe.fr/blog/${params.slug}`,
      siteName: "CoworKing Café Strasbourg",
      locale: "fr_FR",
      type: "article",
      publishedTime: article.createdAt,
      modifiedTime: article.updatedAt,
      authors: ["CoworKing Café"],
      images: article.image
        ? [
            {
              url: article.image,
              width: 1200,
              height: 630,
              alt: article.title,
            },
          ]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: article.image ? [article.image] : undefined,
    },
    alternates: {
      canonical: `https://coworkingcafe.fr/blog/${params.slug}`,
    },
  };
}

export default function BlogArticleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { slug: string };
}) {
  return (
    <>
      {children}
      <RelatedArticles currentSlug={params.slug} />
      <BlogArticleSchema slug={params.slug} />
    </>
  );
}

// Schema.org Article JSON-LD
async function BlogArticleSchema({ slug }: { slug: string }) {
  const article = await getArticle(slug);

  if (!article) return null;

  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description:
      article.excerpt ||
      article.content?.substring(0, 200) ||
      "Article du blog CoworKing Café",
    image: article.image || "https://coworkingcafe.fr/images/og-image.png",
    datePublished: article.createdAt,
    dateModified: article.updatedAt || article.createdAt,
    author: {
      "@type": "Organization",
      name: "CoworKing Café Strasbourg",
      url: "https://coworkingcafe.fr",
    },
    publisher: {
      "@type": "Organization",
      name: "CoworKing Café by Anticafé",
      url: "https://coworkingcafe.fr",
      logo: {
        "@type": "ImageObject",
        url: "https://coworkingcafe.fr/images/logo-circle.webp",
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://coworkingcafe.fr/blog/${slug}`,
    },
    articleSection: article.category?.name || "Coworking",
    keywords: [
      article.category?.name,
      "coworking",
      "strasbourg",
      ...(article.tags || []),
    ]
      .filter(Boolean)
      .join(", "),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
