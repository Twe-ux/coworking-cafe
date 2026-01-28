"use client";

import Link from "next/link";

interface BlogBreadcrumbProps {
  categoryName?: string;
  categorySlug?: string;
  articleTitle: string;
}

const BlogBreadcrumb = ({
  categoryName,
  categorySlug,
  articleTitle,
}: BlogBreadcrumbProps) => {
  return (
    <nav aria-label="breadcrumb" className="mb-4">
      <ol className="breadcrumb">
        <li className="breadcrumb-item">
          <Link href="/">Accueil</Link>
        </li>
        <li className="breadcrumb-item">
          <Link href="/blog">Blog</Link>
        </li>
        {categoryName && categorySlug && (
          <li className="breadcrumb-item">
            <Link href={`/blog/category/${categorySlug}`}>{categoryName}</Link>
          </li>
        )}
        <li className="breadcrumb-item active" aria-current="page">
          {articleTitle.length > 50
            ? `${articleTitle.substring(0, 50)}...`
            : articleTitle}
        </li>
      </ol>
    </nav>
  );
};

export default BlogBreadcrumb;
