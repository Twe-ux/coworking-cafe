"use client";

import BlogCard from "../../../components/site/blogs/blogCard";
import BlogSidebar from "../../../components/site/blogs/blogSidebar";
import PageTitle from "../../../components/site/PageTitle";
import { useGetArticlesQuery } from "../../../store/api/blogApi";
import SlideDown from "../../../utils/animations/slideDown";
import { useState } from "react";

const Blog = () => {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const { data, isLoading, error } = useGetArticlesQuery({
    page,
    limit: 6,
    search: searchQuery || undefined,
    category: selectedCategory || undefined,
    status: "published",
  });

  // Reset page when filters change
  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setPage(1);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPage(1);
  };

  return (
    <>
      <PageTitle title={"Le Mag'"} />
      <section className="all__blog py__130">
        <div className="container">
          <div className="row">
            <div className="col-lg-8">
              {isLoading ? (
                <div className="text-center py-5">
                  <div className="spinner-border" role="status" style={{ color: '#142220', borderRightColor: 'transparent' }}>
                    <span className="visually-hidden">Chargement...</span>
                  </div>
                  <p className="mt-3">Chargement des articles...</p>
                </div>
              ) : error ? (
                <div className="alert alert-danger">
                  <h5>Erreur de chargement</h5>
                  <p>
                    Impossible de charger les articles. Veuillez réessayer plus
                    tard.
                  </p>
                </div>
              ) : !data?.articles || data.articles.length === 0 ? (
                <div className="text-center py-5">
                  <h5>Aucun article disponible</h5>
                  <p>Revenez plus tard pour découvrir nos nouveaux contenus.</p>
                </div>
              ) : (
                <>
                  <div className="row">
                    {data.articles.map((article, index) => (
                      <SlideDown
                        key={article._id}
                        className="col-md-6"
                        delay={index + 1}
                      >
                        <BlogCard
                          slug={article.slug}
                          // author={
                          //   article.author.name || article.author.username
                          // }
                          // comments={0} // À remplacer quand les commentaires seront implémentés
                          imgSrc={
                            article.featuredImage || "/images/blogs/blog-1.webp"
                          }
                          title={article.title}
                        />
                      </SlideDown>
                    ))}
                  </div>

                  {/* Pagination */}
                  {data.pages > 1 && (
                    <div className="d-flex justify-content-center gap-2 mt-5">
                      <button
                        className="btn btn-outline-dark"
                        disabled={page === 1}
                        onClick={() => setPage(page - 1)}
                      >
                        Précédent
                      </button>
                      <span className="align-self-center px-3">
                        Page {page} sur {data.pages}
                      </span>
                      <button
                        className="btn btn-outline-dark"
                        disabled={page === data.pages}
                        onClick={() => setPage(page + 1)}
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
    </>
  );
};

export default Blog;
