"use client";

import BlogCard from "./blogCard";
import BlogSidebar from "./blogSidebar";
import { useGetArticlesQuery } from "../../../store/api/blogApi";
import SlideDown from "../../../utils/animations/slideDown";
import { useState } from "react";

interface BlogArticle {
  _id: string;
  title: string;
  slug: string;
  featuredImage?: string;
}

interface BlogContentProps {
  initialArticles: BlogArticle[];
  initialPages: number;
}

export default function BlogContent({
  initialArticles,
  initialPages,
}: BlogContentProps) {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [hasUserInteracted, setHasUserInteracted] = useState(false);

  const { data, isLoading, error } = useGetArticlesQuery(
    {
      page,
      limit: 6,
      search: searchQuery || undefined,
      category: selectedCategory || undefined,
      status: "published",
    },
    { skip: !hasUserInteracted },
  );

  // Use SSR data until user interacts, then switch to client-side data
  const articles = hasUserInteracted
    ? (data?.articles || [])
    : initialArticles;
  const totalPages = hasUserInteracted
    ? (data?.pages || 1)
    : initialPages;
  const loading = hasUserInteracted && isLoading;

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setPage(1);
    setHasUserInteracted(true);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPage(1);
    setHasUserInteracted(true);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    setHasUserInteracted(true);
  };

  return (
    <section className="all__blog py__130">
      <div className="container">
        <div className="row">
          <div className="col-lg-8">
            {loading ? (
              <div className="text-center py-5">
                <div
                  className="spinner-border"
                  role="status"
                  style={{
                    color: "#142220",
                    borderRightColor: "transparent",
                  }}
                >
                  <span className="visually-hidden">Chargement...</span>
                </div>
                <p className="mt-3">Chargement des articles...</p>
              </div>
            ) : hasUserInteracted && error ? (
              <div className="alert alert-danger">
                <h5>Erreur de chargement</h5>
                <p>
                  Impossible de charger les articles. Veuillez réessayer plus
                  tard.
                </p>
              </div>
            ) : !articles || articles.length === 0 ? (
              <div className="text-center py-5">
                <h5>Aucun article disponible</h5>
                <p>Revenez plus tard pour découvrir nos nouveaux contenus.</p>
              </div>
            ) : (
              <>
                <div className="row">
                  {articles.map((article, index) => (
                    <SlideDown
                      key={article._id}
                      className="col-md-6"
                      delay={index + 1}
                    >
                      <BlogCard
                        slug={article.slug}
                        imgSrc={
                          article.featuredImage || "/images/blogs/blog-1.webp"
                        }
                        title={article.title}
                        priority={index < 3}
                      />
                    </SlideDown>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="d-flex justify-content-center gap-2 mt-5">
                    <button
                      className="btn btn-outline-dark"
                      disabled={page === 1}
                      onClick={() => handlePageChange(page - 1)}
                    >
                      Précédent
                    </button>
                    <span className="align-self-center px-3">
                      Page {page} sur {totalPages}
                    </span>
                    <button
                      className="btn btn-outline-dark"
                      disabled={page === totalPages}
                      onClick={() => handlePageChange(page + 1)}
                    >
                      Suivant
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
          <div className="col-lg-4 mt-5 mt-lg-0">
            <BlogSidebar
              onSearch={handleSearch}
              onCategorySelect={handleCategorySelect}
              selectedCategory={selectedCategory}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
