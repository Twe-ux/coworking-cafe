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
      <ol className="breadcrumb" style={{ fontSize: "14px" }}>
        <li className="breadcrumb-item">
          <Link href="/" style={{ color: "#142220", textDecoration: "none" }}>
            Accueil
          </Link>
        </li>
        <li
          className="breadcrumb-item active"
          aria-current="page"
          style={{ color: "#142220" }}
        >
          Article
        </li>
      </ol>
    </nav>
  );
};

export default BlogBreadcrumb;
