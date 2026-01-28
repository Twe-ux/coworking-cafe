"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface AdjacentArticle {
  _id: string;
  title: string;
  slug: string;
}

interface ArticleNavigationProps {
  currentArticleId: string;
}

const ArticleNavigation = ({ currentArticleId }: ArticleNavigationProps) => {
  const [prevArticle, setPrevArticle] = useState<AdjacentArticle | null>(null);
  const [nextArticle, setNextArticle] = useState<AdjacentArticle | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdjacentArticles = async () => {
      try {
        const response = await fetch(
          `/api/articles/id/${currentArticleId}/adjacent`
        );
        const data = await response.json();

        if (data.success) {
          setPrevArticle(data.data.previous);
          setNextArticle(data.data.next);
        }
      } catch (error) {
        console.error("Error fetching adjacent articles:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAdjacentArticles();
  }, [currentArticleId]);

  if (loading) {
    return null;
  }

  if (!prevArticle && !nextArticle) {
    return (
      <div className="mt-5 pt-4 border-top">
        <Link href="/blog" className="btn btn-outline-primary">
          <i className="fa-solid fa-arrow-left me-2"></i>
          Retour au blog
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-5 pt-4 border-top">
      <div className="row g-3">
        {/* Bouton retour au blog */}
        <div className="col-12 mb-3">
          <Link href="/blog" className="btn btn-outline-primary">
            <i className="fa-solid fa-arrow-left me-2"></i>
            Retour au blog
          </Link>
        </div>

        {/* Article précédent */}
        <div className="col-md-6">
          {prevArticle ? (
            <Link
              href={`/blog/${prevArticle.slug}`}
              className="d-block p-3 border rounded text-decoration-none hover-shadow"
              style={{ transition: "box-shadow 0.2s" }}
            >
              <div className="d-flex align-items-center">
                <i className="fa-solid fa-chevron-left me-3 text-primary"></i>
                <div>
                  <small className="text-muted d-block">Article précédent</small>
                  <strong className="text-dark">
                    {prevArticle.title.length > 60
                      ? `${prevArticle.title.substring(0, 60)}...`
                      : prevArticle.title}
                  </strong>
                </div>
              </div>
            </Link>
          ) : (
            <div className="p-3 border rounded text-muted">
              <small>Aucun article précédent</small>
            </div>
          )}
        </div>

        {/* Article suivant */}
        <div className="col-md-6">
          {nextArticle ? (
            <Link
              href={`/blog/${nextArticle.slug}`}
              className="d-block p-3 border rounded text-decoration-none hover-shadow text-end"
              style={{ transition: "box-shadow 0.2s" }}
            >
              <div className="d-flex align-items-center justify-content-end">
                <div>
                  <small className="text-muted d-block">Article suivant</small>
                  <strong className="text-dark">
                    {nextArticle.title.length > 60
                      ? `${nextArticle.title.substring(0, 60)}...`
                      : nextArticle.title}
                  </strong>
                </div>
                <i className="fa-solid fa-chevron-right ms-3 text-primary"></i>
              </div>
            </Link>
          ) : (
            <div className="p-3 border rounded text-muted text-end">
              <small>Aucun article suivant</small>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArticleNavigation;
