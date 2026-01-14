'use client';

import SlideUp from '@/utils/animations/slideUp';
import React from 'react';
import { useGetCommentsQuery } from '@/store/api/blogApi';
import CommentItem from './CommentItem';

interface CommentsProps {
    articleId: string;
}

const Comments = ({ articleId }: CommentsProps) => {
    const { data, isLoading, error } = useGetCommentsQuery({
        article: articleId,
        status: 'approved',
        page: 1,
        limit: 50,
    });

    if (isLoading) {
        return (
            <div className="comments">
                <h1 className="t__54">
                    Comments
                    <span>...</span>
                </h1>
                <div className="text-center py-4">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Chargement...</span>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="comments">
                <h1 className="t__54">
                    Comments
                    <span>00</span>
                </h1>
                <div className="alert alert-warning">
                    Impossible de charger les commentaires.
                </div>
            </div>
        );
    }

    const comments = data?.comments || [];
    // Filter only top-level comments (no parent)
    const topLevelComments = comments.filter(comment => !comment.parent);

    return (
        <div className="comments">
            <h1 className="t__54">
                Comments
                <span>{comments.length.toString().padStart(2, '0')}</span>
            </h1>
            {topLevelComments.length === 0 ? (
                <div className="text-center py-4">
                    <p className="text-muted">
                        Aucun commentaire pour le moment. Soyez le premier à commenter !
                    </p>
                </div>
            ) : (
                <div>
                    {topLevelComments.map(comment => (
                        <SlideUp key={comment._id} className="comment">
                            <CommentItem comment={comment} articleId={articleId} />
                        </SlideUp>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Comments;
