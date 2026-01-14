"use client";

import { useGetArticlesQuery } from "@/store/api/blogApi";
import SlideDown from "@/utils/animations/slideDown";
import SlideUp from "@/utils/animations/slideUp";
import React from "react";
import BlogCard from "./blogCard";

interface HomeBlogProps {
  className?: string;
}

const HomeBlog: React.FC<HomeBlogProps> = ({ className = "" }) => {
  const { data, isLoading, error } = useGetArticlesQuery({
    limit: 3,
    sortBy: "publishedAt",
    sortOrder: "desc",
    status: "published",
  });

  return (
    <section className={`blogs ${className}`}>
      <div className="container">
        {/* title Start */}
        <SlideDown className="">
          <h1 className="title text-center">Entre projets et cappuccinos :</h1>
          <p className="d-flex justify-content-center mt-4 subtitle">
            nos actus, nos conseils et la worklife des sans bureau fixe.
          </p>
        </SlideDown>
        {/* title End */}
        <div className="blogs__wapper">
          <div className="row">
            {isLoading ? (
              <div className="col-12 text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Chargement...</span>
                </div>
              </div>
            ) : error ? (
              <div className="col-12 text-center py-5">
                <p>Erreur lors du chargement des articles.</p>
              </div>
            ) : !data?.articles || data.articles.length === 0 ? (
              <div className="col-12 text-center py-5">
                <p>Aucun article disponible pour le moment.</p>
              </div>
            ) : (
              data.articles.map((article, index) => (
                <SlideUp
                  key={article._id}
                  className="col-lg-4 col-md-6 mb-lg-0 mb-5"
                  delay={index + 1}
                >
                  <BlogCard
                    imgSrc={article.featuredImage || "/images/blogs/blog-1.png"}
                    title={article.title}
                    slug={article.slug}
                  />
                </SlideUp>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomeBlog;
