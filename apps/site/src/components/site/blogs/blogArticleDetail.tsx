"use client";

import MarkdownRenderer from "./MarkdownRenderer";
import type { Article } from "../../../store/api/blogApi";
import {
  useIsArticleLikedQuery,
  useLikeArticleMutation,
  useUnlikeArticleMutation,
} from "../../../store/api/blogApi";
import SlideUp from "../../../utils/animations/slideUp";
import ArticleNavigation from "./ArticleNavigation";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface BlogArticleDetailProps {
  article: Article;
}

const BlogArticleDetail = ({ article }: BlogArticleDetailProps) => {
  const { data: session } = useSession();
  const router = useRouter();

  // Check if article is liked by current user (only if authenticated)
  const { data: likeData } = useIsArticleLikedQuery(article._id, {
    skip: !session,
  });
  const [likeArticle, { isLoading: isLiking }] = useLikeArticleMutation();
  const [unlikeArticle, { isLoading: isUnliking }] = useUnlikeArticleMutation();

  // Local state for optimistic UI update
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(article.likeCount);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Sync with query data
  useEffect(() => {
    if (likeData) {
      setIsLiked(likeData.liked);
    }
  }, [likeData]);

  // Sync with article prop changes
  useEffect(() => {
    setLikeCount(article.likeCount);
  }, [article.likeCount]);

  const isLoading = isLiking || isUnliking;

  const handleLikeToggle = async () => {
    // Si pas connecté, afficher le modal
    if (!session) {
      setShowAuthModal(true);
      return;
    }

    if (isLoading) return;

    // Optimistic update
    const wasLiked = isLiked;
    const oldCount = likeCount;

    setIsLiked(!wasLiked);
    setLikeCount(wasLiked ? oldCount - 1 : oldCount + 1);

    try {
      if (wasLiked) {
        const result = await unlikeArticle(article._id).unwrap();
        setLikeCount(result.likeCount);
      } else {
        const result = await likeArticle(article._id).unwrap();
        setLikeCount(result.likeCount);
      }
    } catch (error) {
      console.error("Error toggling like:", error);
      // Revert on error
      setIsLiked(wasLiked);
      setLikeCount(oldCount);
    }
  };

  return (
    <>
      {/* Modal d'authentification */}
      {showAuthModal && (
        <div
          className="modal fade show"
          style={{
            display: "block",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          }}
          onClick={() => setShowAuthModal(false)}
        >
          <div
            className="modal-dialog modal-dialog-centered"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content">
              <div className="modal-header border-0">
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowAuthModal(false)}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body text-center py-4">
                <div className="mb-4">
                  <i
                    className="fa-regular fa-heart"
                    style={{ fontSize: "48px", color: "#dc3545" }}
                  ></i>
                </div>
                <h5 className="mb-3">Connectez-vous pour liker cet article</h5>
                <p className="text-muted mb-4">
                  Vous devez être connecté pour pouvoir liker les articles et
                  sauvegarder vos préférences.
                </p>
                <div className="d-flex gap-3 justify-content-center">
                  <a
                    href={`/auth/login?callbackUrl=/blog/${article.slug}`}
                    className="btn btn-primary px-4"
                  >
                    Se connecter
                  </a>
                  <a
                    href={`/auth/register?callbackUrl=/blog/${article.slug}`}
                    className="btn btn-outline-primary px-4"
                  >
                    Créer un compte
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <article>
        {article.featuredImage && (
        <img
          src={article.featuredImage}
          alt={article.title}
          className="w-100 thumb__img"
        />
      )}
      <div className="first__para ">
        {/* <ul className="d-flex flex-wrap gap-4">
          <li>
            <img src="/icons/clender.svg" alt="date" />
            <span>{formatDate(article.publishedAt || article.createdAt)}</span>
          </li>
        </ul> */}
        <SlideUp>
          <h2 className="t__54 pt__50">{article.title}</h2>
        </SlideUp>

        {article.excerpt && <p className="lead">{article.excerpt}</p>}

        {/* Render article content */}
        <div className="article-content">
          <MarkdownRenderer content={article.content} />
        </div>

        {/* Stats */}
        <div className="d-flex gap-4 my-4 align-items-center">
          <p className="mb-0">
            <i className="fa-solid fa-eye me-2"></i>
            <span>{article.viewCount} vues</span>
          </p>
          <button
            onClick={handleLikeToggle}
            disabled={isLoading}
            className={`btn btn-sm d-inline-flex align-items-center gap-2 ${
              isLiked ? "btn-danger" : "btn-outline-danger"
            }`}
            style={{
              marginTop: 33,
              border: isLiked ? "none" : "1px solid #dc3545",
              padding: "0.25rem 0.75rem",
            }}
            title={
              !session
                ? "Connectez-vous pour liker cet article"
                : isLiked
                ? "Retirer mon like"
                : "J'aime cet article"
            }
          >
            <i className={`fa-${isLiked ? "solid" : "regular"} fa-heart`}></i>
            <span>
              {likeCount} {likeCount === 1 ? "like" : "likes"}
            </span>
          </button>
          {/* <p className="mb-0">
            <i className="fa-solid fa-clock me-2"></i>
            <span>{article.readingTime} min de lecture</span>
          </p> */}
        </div>
      </div>

      {/* Share */}
      {/* <SlideUp className="d-flex justify-content-end flex-wrap align-items-center share__option">
        <div className="d-flex align-items-center gap-4">
          <h6>Share:</h6>
          <ul className="d-flex justify-content-center gap-3">
            <li>
              <Link
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                  window.location.href
                )}`}
                target="_blank"
              >
                <i className="fa-brands fa-facebook-f" />
              </Link>
            </li>
            <li>
              <Link
                href={`https://pinterest.com/pin/create/button/?url=${encodeURIComponent(
                  window.location.href
                )}&description=${encodeURIComponent(article.title)}`}
                target="_blank"
              >
                <i className="fa-brands fa-pinterest-p" />
              </Link>
            </li>
            <li>
              <Link href={`https://www.instagram.com/`} target="_blank">
                <i className="fa-brands fa-instagram" />
              </Link>
            </li>
            <li>
              <Link
                href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(
                  window.location.href
                )}&text=${encodeURIComponent(article.title)}`}
                target="_blank"
              >
                <i className="fa-brands fa-twitter" />
              </Link>
            </li>
          </ul>
        </div>
      </SlideUp> */}

      {/* Article Navigation (Previous/Next) */}
      <ArticleNavigation currentArticleId={article._id} />
      </article>
    </>
  );
};

export default BlogArticleDetail;
