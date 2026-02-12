import type { Metadata } from "next";

interface CategoryData {
  name: string;
  slug: string;
  description?: string;
  metaTitle?: string;
  metaDescription?: string;
}

async function getCategory(slug: string): Promise<CategoryData | null> {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/categories?limit=100`, {
      next: { revalidate: 3600 },
    });

    if (!res.ok) return null;
    const data = await res.json();

    return (
      data.categories?.find(
        (cat: CategoryData) => cat.slug === slug
      ) || null
    );
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const category = await getCategory(params.slug);

  if (!category) {
    return {
      title: "Catégorie introuvable | CoworKing Café Strasbourg",
      description:
        "Cette catégorie n'existe pas ou n'est plus disponible sur le blog du CoworKing Café.",
    };
  }

  const title =
    category.metaTitle ||
    `${category.name} | Le Mag' CoworKing Café Strasbourg`;
  const description =
    category.metaDescription ||
    category.description ||
    `Articles sur ${category.name} : conseils, actualités et astuces coworking au CoworKing Café Strasbourg.`;

  return {
    title,
    description,
    keywords: [
      category.name.toLowerCase(),
      "blog coworking strasbourg",
      "coworking strasbourg",
      "anticafé blog",
      "articles coworking",
    ],
    openGraph: {
      title,
      description,
      url: `https://coworkingcafe.fr/blog/category/${params.slug}`,
      siteName: "CoworKing Café Strasbourg",
      locale: "fr_FR",
      type: "website",
      images: [
        {
          url: "/images/og-image.webp",
          width: 1200,
          height: 630,
          alt: `CoworKing Café - ${category.name}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/images/og-image.webp"],
    },
    alternates: {
      canonical: `https://coworkingcafe.fr/blog/category/${params.slug}`,
    },
  };
}

export default async function BlogCategoryLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { slug: string };
}) {
  return (
    <>
      {children}
      <BreadcrumbSchema slug={params.slug} />
    </>
  );
}

async function BreadcrumbSchema({ slug }: { slug: string }) {
  const category = await getCategory(slug);
  if (!category) return null;

  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Accueil",
        item: "https://coworkingcafe.fr",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Le Mag'",
        item: "https://coworkingcafe.fr/blog",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: category.name,
        item: `https://coworkingcafe.fr/blog/category/${slug}`,
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
