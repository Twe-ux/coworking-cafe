/**
 * CommentForm Component - apps/site
 * Formulaire pour poster un commentaire sur un article
 */

'use client';

import { useState } from 'react';
import { apiClient, handleApiError } from '@/lib/utils/api-client';
import type { CreateCommentData } from '@/types';

interface CommentFormProps {
  articleSlug: string;
  parentId?: string;
  onSuccess?: () => void;
}

export function CommentForm({ articleSlug, parentId, onSuccess }: CommentFormProps) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      setError('Veuillez saisir un commentaire');
      return;
    }

    if (content.length < 10) {
      setError('Le commentaire doit contenir au moins 10 caractères');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const commentData: CreateCommentData = {
        articleSlug,
        content: content.trim(),
        parentId,
      };

      const response = await apiClient.post(`/blog/${articleSlug}/comments`, commentData);

      if (response.success) {
        setSuccess(true);
        setContent('');

        setTimeout(() => {
          setSuccess(false);
          if (onSuccess) {
            onSuccess();
          }
        }, 2000);
      }
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="comment-form">
      <div className="comment-form__field">
        <label htmlFor="content" className="comment-form__label">
          {parentId ? 'Répondre' : 'Laisser un commentaire'}
        </label>

        <textarea
          id="content"
          name="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className={`comment-form__textarea ${error ? 'comment-form__textarea--error' : ''}`}
          rows={5}
          placeholder="Partagez votre avis..."
          disabled={loading}
          required
        />

        {error && <span className="comment-form__error">{error}</span>}
      </div>

      <div className="comment-form__actions">
        <button type="submit" className="comment-form__submit" disabled={loading}>
          {loading ? 'Publication...' : 'Publier'}
        </button>

        {success && (
          <span className="comment-form__success">Commentaire publié avec succès!</span>
        )}
      </div>
    </form>
  );
}
