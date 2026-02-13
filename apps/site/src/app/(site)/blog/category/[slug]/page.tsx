"use client";

import BlogCard from "../../../../../components/site/blogs/blogCard";
import BlogSidebar from "../../../../../components/site/blogs/blogSidebar";
import PageTitle from "../../../../../components/site/PageTitle";
import { useGetArticlesQuery, useGetCategoriesQuery } from "../../../../../store/api/blogApi";
import SlideDown from "../../../../../utils/animations/slideDown";
import { useState } from "react";
import { useParams } from "next/navigation";

const BlogCategory = () => {
  const params = useParams();
  const categorySlug = params.slug as string;

  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch category details
  const { data: categoriesData } = useGetCategoriesQuery({ limit: 100 });
  const category = categoriesData?.categories?.find(
    (cat) => cat.slug === categorySlug
  );

  // Fetch articles by category
  const { data, isLoading, error } = useGetArticlesQuery({
    page,
    limit: 6,
    search: searchQuery || undefined,
    category: category?._id || undefined,
    status: "published",
  });

  // Reset page when search changes
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPage(1);
  };

  if (!category && !isLoading) {
    return (
      <>
        <PageTitle title={"Catégorie introuvable"} />
        <section className="all__blog py__130">
          <div className="container">
            <div className="alert alert-danger">
              <h5>Catégorie introuvable</h5>
              <p>Cette catégorie n'existe pas ou n'est plus disponible.</p>
              <a href="/blog" className="btn btn-primary mt-3">
                Retour au blog
              </a>
            </div>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <PageTitle title={`Le Mag' - ${category?.name || "Catégorie"}`} />
      <section className="all__blog py__130">
        <div className="container">
          <div className="row">
            <div className="col-lg-8">
              {/* Category Header */}
              {category && (
                <div className="mb-4">
                  <h1 className="mb-2">{category.name}</h1>
                  {category.description && (
                    <p className="text-muted">{category.description}</p>
                  )}
                </div>
              )}

              {isLoading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
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
                  <h5>Aucun article dans cette catégorie</h5>
                  <p>Revenez plus tard pour découvrir nos nouveaux contenus.</p>
                  <a href="/blog" className="btn btn-primary mt-3">
                    Voir tous les articles
                  </a>
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
                selectedCategory={category?._id}
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default BlogCategory;
