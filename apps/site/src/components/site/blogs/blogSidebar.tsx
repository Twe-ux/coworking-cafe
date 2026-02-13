"use client";

import {
  useGetArticlesQuery,
  useGetCategoriesQuery,
} from "../../../store/api/blogApi";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";

interface BlogSidebarProps {
  onSearch?: (query: string) => void;
  onCategorySelect?: (categoryId: string) => void;
  selectedCategory?: string;
  hideSearch?: boolean;
}

const BlogSidebar = ({
  onSearch,
  onCategorySelect,
  selectedCategory,
  hideSearch = false,
}: BlogSidebarProps) => {
  const [searchValue, setSearchValue] = useState("");

  // Fetch latest posts for sidebar
  const { data: latestPosts } = useGetArticlesQuery({
    page: 1,
    limit: 3,
    sortBy: "createdAt",
    sortOrder: "desc",
    status: "published",
  });

  // Fetch categories with article count
  const { data: categoriesData } = useGetCategoriesQuery({ limit: 100 });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    if (onSearch) {
      onSearch(value);
    }
  };

  const handleCategoryClick = (e: React.MouseEvent, categoryId: string) => {
    e.preventDefault();
    if (onCategorySelect) {
      onCategorySelect(categoryId);
    }
  };

  return (
    <aside className="sidebar">
      {!hideSearch && (
        <div className="search__box pb__60">
          {/* <label htmlFor="search" className="t__22">
            Recherche
          </label> */}
          <form onSubmit={handleSearch} className="position-relative">
            <input
              id="search"
              type="text"
              placeholder="Recherche"
              value={searchValue}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
            <span
              style={{
                position: "absolute",
                right: "15px",
                top: "50%",
                transform: "translateY(-50%)",
                pointerEvents: "none",
              }}
            >
              <i className="fa-solid fa-magnifying-glass" />
            </span>
          </form>
        </div>
      )}

      {/* -- Categories */}
      <div className={`categories ${!hideSearch ? "pt__60" : ""}`}>
        <h5 className="t__22">Thèmes</h5>
        <ul>
          {/* "All" option */}
          <li>
            <Link
              href="/blog"
              style={{
                fontWeight: !selectedCategory ? "bold" : "normal",
                color: !selectedCategory ? "#588983" : "inherit",
              }}
            >
              Tous les articles
            </Link>
          </li>

          {categoriesData?.categories &&
          categoriesData.categories.length > 0 ? (
            categoriesData.categories
              .filter((cat) => cat.isVisible !== false)
              .map((category) => (
                <li key={category._id}>
                  <Link
                    href={`/blog/category/${category.slug}`}
                    style={{
                      fontWeight:
                        selectedCategory === category._id ? "bold" : "normal",
                      color:
                        selectedCategory === category._id
                          ? "#588983"
                          : "inherit",
                    }}
                  >
                    {category.name}
                  </Link>
                  <p>({category.articleCount || 0})</p>
                </li>
              ))
          ) : (
            <li>
              <p className="text-muted">Aucune catégorie</p>
            </li>
          )}
        </ul>
      </div>
      {/* -- Categories */}

      {/* -- latest post */}
      <div className="latest__post pt__60">
        <h5 className="t__22">Derniers articles</h5>
        <ul>
          {latestPosts?.articles && latestPosts.articles.length > 0 ? (
            latestPosts.articles.map((article) => (
              <li key={article._id}>
                <Link href={`/blog/${article.slug}`}>
                  <Image
                    src={article.featuredImage || "/images/blogs/blog-1.webp"}
                    alt={article.title}
                    width={120}
                    height={80}
                    loading="lazy"
                    quality={85}
                    className="thumb__img"
                    sizes="120px"
                  />
                </Link>
                <div>
                  <Link href={`/blog/${article.slug}`}>
                    {article.title.length > 50
                      ? `${article.title.substring(0, 50)}...`
                      : article.title}
                  </Link>
                  <p className="d-flex gap-2">
                    <Image src="/icons/clender.svg" alt="Icône calendrier" width={16} height={16} />
                    <span>
                      {new Date(
                        article.publishedAt || article.createdAt,
                      ).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </p>
                </div>
              </li>
            ))
          ) : (
            <li>
              <p className="text-muted">Aucun article récent</p>
            </li>
          )}
        </ul>
      </div>
      {/* -- latest post */}

      {/* -- Archives */}
      <div className="archives pt__60">
        <h5 className="t__22">Archives</h5>
        <Link href="/blog/archive" className="btn btn-outline-dark w-100 mt-3">
          <i className="bi bi-archive me-2"></i>
          Voir toutes les archives
        </Link>
      </div>
      {/* -- Archives */}
    </aside>
  );
};

export default BlogSidebar;
