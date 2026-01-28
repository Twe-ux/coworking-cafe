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

  return (
    <div className="mt-5 pt-4 border-top">
      <div className="row g-3 mb-4">
        {/* Article précédent */}
        <div className="col-md-6">
          {prevArticle ? (
            <Link
              href={`/blog/${prevArticle.slug}`}
              className="d-block p-3 border rounded text-decoration-none"
              style={{
                transition: "box-shadow 0.2s, border-color 0.2s",
                borderColor: "#e3ece7"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.1)";
                e.currentTarget.style.borderColor = "#417972";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "none";
                e.currentTarget.style.borderColor = "#e3ece7";
              }}
            >
              <div className="d-flex align-items-center">
                <i
                  className="fa-solid fa-chevron-left me-3"
                  style={{ color: "#142220", fontSize: "20px" }}
                ></i>
                <div>
                  <small className="d-block" style={{ color: "#6e6f75" }}>
                    Article précédent
                  </small>
                  <strong style={{ color: "#142220" }}>
                    {prevArticle.title.length > 60
                      ? `${prevArticle.title.substring(0, 60)}...`
                      : prevArticle.title}
                  </strong>
                </div>
              </div>
            </Link>
          ) : (
            <div className="p-3 border rounded" style={{ borderColor: "#e3ece7" }}>
              <small style={{ color: "#6e6f75" }}>Aucun article précédent</small>
            </div>
          )}
        </div>

        {/* Article suivant */}
        <div className="col-md-6">
          {nextArticle ? (
            <Link
              href={`/blog/${nextArticle.slug}`}
              className="d-block p-3 border rounded text-decoration-none text-end"
              style={{
                transition: "box-shadow 0.2s, border-color 0.2s",
                borderColor: "#e3ece7"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.1)";
                e.currentTarget.style.borderColor = "#417972";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "none";
                e.currentTarget.style.borderColor = "#e3ece7";
              }}
            >
              <div className="d-flex align-items-center justify-content-end">
                <div>
                  <small className="d-block" style={{ color: "#6e6f75" }}>
                    Article suivant
                  </small>
                  <strong style={{ color: "#142220" }}>
                    {nextArticle.title.length > 60
                      ? `${nextArticle.title.substring(0, 60)}...`
                      : nextArticle.title}
                  </strong>
                </div>
                <i
                  className="fa-solid fa-chevron-right ms-3"
                  style={{ color: "#142220", fontSize: "20px" }}
                ></i>
              </div>
            </Link>
          ) : (
            <div className="p-3 border rounded text-end" style={{ borderColor: "#e3ece7" }}>
              <small style={{ color: "#6e6f75" }}>Aucun article suivant</small>
            </div>
          )}
        </div>
      </div>

      {/* Bouton retour au blog - en dessous */}
      <div className="col-12">
        <Link
          href="/blog"
          className="btn d-inline-flex align-items-center"
          style={{
            backgroundColor: "transparent",
            border: "2px solid #142220",
            color: "#142220",
            padding: "10px 20px",
            borderRadius: "4px",
            fontWeight: "500",
            transition: "all 0.3s ease"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#142220";
            e.currentTarget.style.color = "#ffffff";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.color = "#142220";
          }}
        >
          <i className="fa-solid fa-arrow-left me-2"></i>
          Retour au blog
        </Link>
      </div>
    </div>
  );
};

export default ArticleNavigation;
