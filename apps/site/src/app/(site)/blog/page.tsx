import BlogContent from "../../../components/site/blogs/BlogContent";
import PageTitle from "../../../components/site/PageTitle";
import { BreadcrumbSchema } from "../../../components/seo/BreadcrumbSchema";

export const revalidate = 3600; // ISR: revalidate every hour

async function getArticles() {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const res = await fetch(
      `${baseUrl}/api/articles?status=published&page=1&limit=6`,
      { next: { revalidate: 3600 } },
    );
    if (!res.ok) return { articles: [], pages: 1 };
    return await res.json();
  } catch {
    return { articles: [], pages: 1 };
  }
}

export default async function BlogPage() {
  const data = await getArticles();

  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "Accueil", url: "https://coworkingcafe.fr" },
          { name: "Le Mag'", url: "https://coworkingcafe.fr/blog" },
        ]}
      />
      <PageTitle title={"Le Mag'"} />
      <BlogContent
        initialArticles={data.articles || []}
        initialPages={data.pages || 1}
      />
    </>
  );
}
