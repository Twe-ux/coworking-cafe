'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useCreateCommentMutation } from '@/store/api/blogApi';
import { useNotification } from '@/hooks/useNotification';
import type { Comment } from '@/store/api/blogApi';

interface CommentItemProps {
  comment: Comment;
  articleId: string;
  level?: number;
  maxLevel?: number;
}

const CommentItem = ({ comment, articleId, level = 0, maxLevel = 3 }: CommentItemProps) => {
  const { data: session } = useSession();
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [createComment, { isLoading }] = useCreateCommentMutation();
  const { success, error: showError } = useNotification();

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session) {
      showError('Vous devez être connecté pour répondre');
      return;
    }

    if (!replyContent.trim()) {
      showError('Veuillez saisir un commentaire');
      return;
    }

    try {
      await createComment({
        articleId: articleId,
        content: replyContent,
        parentId: comment._id,
      }).unwrap();

      success('Votre réponse a été envoyée pour modération');
      setReplyContent('');
      setShowReplyForm(false);
    } catch (err: any) {
      showError(err?.data?.error || 'Erreur lors de l\'envoi de la réponse');
    }
  };

  // Cast parent to object type for type safety
  const parent = typeof comment.parent === 'object' ? comment.parent : null;

  // Get replies from Comment type
  const replies = (comment as any).replies || [];

  return (
    <div className={`comment-item ${level > 0 ? 'reply__comment' : 'main__comment'}`} style={{ marginLeft: level > 0 ? '40px' : '0' }}>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="user d-flex align-items-center gap-3">
          <div
            className={`avatar rounded-circle ${level === 0 ? 'bg-primary-subtle' : 'bg-success-subtle'} d-flex align-items-center justify-content-center`}
            style={{ width: '50px', height: '50px' }}
          >
            <span className={`${level === 0 ? 'text-primary' : 'text-success'} fs-5 fw-semibold`}>
              {(comment.user.name || comment.user.username).charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h5 className="t__22 mb-1">{comment.user.name || comment.user.username}</h5>
            <p className="text-muted mb-0 small">{formatDate(comment.createdAt)}</p>
          </div>
        </div>
        {session && level < maxLevel && (
          <button
            className="btn btn-sm btn-outline-primary"
            onClick={() => setShowReplyForm(!showReplyForm)}
            type="button"
          >
            {showReplyForm ? 'Annuler' : 'Répondre'}
          </button>
        )}
      </div>

      {parent && (
        <div className="alert alert-light small mb-2">
          <strong>En réponse à {parent.user?.name || parent.user?.username || 'un commentaire'}</strong>
        </div>
      )}

      <p className="text mb-3">{comment.content}</p>

      {showReplyForm && (
        <form onSubmit={handleSubmitReply} className="reply-form mb-3 p-3 bg-light rounded">
          <div className="mb-2">
            <textarea
              className="form-control"
              rows={3}
              placeholder="Votre réponse..."
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              required
            />
          </div>
          <div className="d-flex gap-2">
            <button
              type="submit"
              className="btn btn-primary btn-sm"
              disabled={isLoading}
            >
              {isLoading ? 'Envoi...' : 'Envoyer'}
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setShowReplyForm(false)}
            >
              Annuler
            </button>
          </div>
        </form>
      )}

      {replies.length > 0 && (
        <div className="replies mt-3">
          {replies.map((reply: Comment) => (
            <CommentItem
              key={reply._id}
              comment={reply}
              articleId={articleId}
              level={level + 1}
              maxLevel={maxLevel}
            />
          ))}
        </div>
      )}

      {level === 0 && <span className="border__full my-4 d-block" />}
    </div>
  );
};

export default CommentItem;
