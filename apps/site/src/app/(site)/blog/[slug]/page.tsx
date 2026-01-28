"use client";

import BlogArticleDetail from "../../../../components/site/blogs/blogArticleDetail";
import BlogBreadcrumb from "../../../../components/site/blogs/BlogBreadcrumb";
import BlogSidebar from "../../../../components/site/blogs/blogSidebar";
import PageTitle from "../../../../components/site/pageTitle";
import { useGetArticleBySlugQuery } from "../../../../store/api/blogApi";
import { useParams } from "next/navigation";
import { useEffect } from "react";

const BlogDetails = () => {
  const params = useParams();
  const slug = params.slug as string;

  const { data: article, isLoading, error } = useGetArticleBySlugQuery(slug);

  // Increment view count when article is loaded
  useEffect(() => {
    if (article?._id) {
      // Call the view endpoint
      fetch(`/api/articles/${slug}/view`, {
        method: "POST",
      }).catch((err) => {
        // Error incrementing view count silently handled
      });
    }
  }, [article?._id, slug]);

  if (isLoading) {
    return (
      <>
        <PageTitle title={"Chargement..."} />
        <section className="blog__details py__130">
          <div className="container">
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Chargement...</span>
              </div>
              <p className="mt-3">Chargement de l'article...</p>
            </div>
          </div>
        </section>
      </>
    );
  }

  if (error || !article) {
    return (
      <>
        <PageTitle title={"Article introuvable"} />
        <section className="blog__details py__130">
          <div className="container">
            <div className="alert alert-danger">
              <h5>Article introuvable</h5>
              <p>Cet article n'existe pas ou n'est plus disponible.</p>
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
      <PageTitle title={`Le Mag' - ${article?.category?.name}`} />
      <section className="blog__details py__130">
        <div className="container">
          <div className="row">
            <div className="col-lg-8">
              <BlogBreadcrumb
                categoryName={article.category?.name}
                categorySlug={article.category?.slug}
                articleTitle={article.title}
              />
              <BlogArticleDetail article={article} />
            </div>
            <div className="col-lg-4 mt-5 mt-lg-0">
              <BlogSidebar hideSearch={true} />
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default BlogDetails;
