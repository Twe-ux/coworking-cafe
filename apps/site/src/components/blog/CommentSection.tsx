/**
 * CommentSection Component - apps/site
 * Section complète des commentaires avec liste et formulaire
 */

'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { apiClient, handleApiError } from '@/lib/utils/api-client';
import { formatDateFr } from '@/lib/utils/format-date';
import type { ArticleComment } from '@/types';
import { CommentForm } from './CommentForm';

interface CommentSectionProps {
  articleSlug: string;
}

export function CommentSection({ articleSlug }: CommentSectionProps) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<ArticleComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get<ArticleComment[]>(`/blog/${articleSlug}/comments`);

      if (response.success && response.data) {
        setComments(response.data);
      }
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [articleSlug]);

  const renderComment = (comment: ArticleComment, isNested = false) => {
    if (comment.status !== 'approved') {
      return null;
    }

    const showReplyForm = replyingTo === comment.id;

    return (
      <div
        key={comment.id}
        className={`comment ${isNested ? 'comment--nested' : ''}`}
      >
        <div className="comment__header">
          <div className="comment__author">
            {comment.author.avatar && (
              <img
                src={comment.author.avatar}
                alt={`${comment.author.firstName} ${comment.author.lastName}`}
                className="comment__author-avatar"
              />
            )}
            <span className="comment__author-name">
              {comment.author.firstName} {comment.author.lastName}
            </span>
          </div>

          <time className="comment__date" dateTime={comment.createdAt.toISOString()}>
            {formatDateFr(comment.createdAt.toISOString().split('T')[0])}
          </time>
        </div>

        <div className="comment__content">
          <p>{comment.content}</p>
        </div>

        <div className="comment__actions">
          {comment.likeCount > 0 && (
            <span className="comment__likes">{comment.likeCount} likes</span>
          )}

          {session && !isNested && (
            <button
              type="button"
              className="comment__reply-btn"
              onClick={() => setReplyingTo(showReplyForm ? null : comment.id)}
            >
              {showReplyForm ? 'Annuler' : 'Répondre'}
            </button>
          )}
        </div>

        {showReplyForm && session && (
          <div className="comment__reply-form">
            <CommentForm
              articleSlug={articleSlug}
              parentId={comment.id}
              onSuccess={() => {
                setReplyingTo(null);
                fetchComments();
              }}
            />
          </div>
        )}

        {comment.replies && comment.replies.length > 0 && (
          <div className="comment__replies">
            {comment.replies.map((reply) => renderComment(reply, true))}
          </div>
        )}
      </div>
    );
  };

  return (
    <section className="comment-section">
      <h2 className="comment-section__title">
        Commentaires ({comments.length})
      </h2>

      {session ? (
        <div className="comment-section__form">
          <CommentForm articleSlug={articleSlug} onSuccess={fetchComments} />
        </div>
      ) : (
        <p className="comment-section__login-message">
          Vous devez être connecté pour laisser un commentaire.
        </p>
      )}

      {loading ? (
        <div className="comment-section__loading">Chargement des commentaires...</div>
      ) : error ? (
        <div className="comment-section__error">{error}</div>
      ) : comments.length === 0 ? (
        <p className="comment-section__empty">
          Aucun commentaire pour le moment. Soyez le premier à commenter!
        </p>
      ) : (
        <div className="comment-section__list">
          {comments.map((comment) => renderComment(comment))}
        </div>
      )}
    </section>
  );
}
