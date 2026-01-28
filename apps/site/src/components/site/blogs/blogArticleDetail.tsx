"use client";

import MarkdownRenderer from "./MarkdownRenderer";
import type { Article } from "../../../store/api/blogApi";
import { useToggleLikeMutation } from "../../../store/api/blogApi";
import SlideUp from "../../../utils/animations/slideUp";
import { useState } from "react";
import ArticleNavigation from "./ArticleNavigation";

interface BlogArticleDetailProps {
  article: Article;
}

const BlogArticleDetail = ({ article }: BlogArticleDetailProps) => {
  const [toggleLike, { isLoading: isLiking }] = useToggleLikeMutation();
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(article.likeCount);

  const handleLike = async () => {
    if (isLiking || liked) return; // Prevent double-click and already liked

    try {
      setLiked(true);
      setLikeCount((prev) => prev + 1);
      await toggleLike(article._id).unwrap();
    } catch (error) {
      // Revert on error
      setLiked(false);
      setLikeCount((prev) => prev - 1);
    }
  };

  return (
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
            onClick={handleLike}
            disabled={isLiking || liked}
            className={`btn btn-sm d-inline-flex align-items-center gap-2 ${
              liked ? "btn-danger" : "btn-outline-danger"
            }`}
            style={{
              marginTop: 33,
              border: liked ? "none" : "1px solid #dc3545",
              padding: "0.25rem 0.75rem",
            }}
          >
            <i className={`fa-${liked ? "solid" : "regular"} fa-heart`}></i>
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
  );
};

export default BlogArticleDetail;
