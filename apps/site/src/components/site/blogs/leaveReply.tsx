"use client";

import SlideUp from "../../../utils/animations/slideUp";
import React, { useState } from "react";
import { useCreateCommentMutation } from "../../../store/api/blogApi";
import { useSession } from "next-auth/react";
import Link from "next/link";

interface LeaveReplyProps {
  articleId: string;
}

const LeaveReply = ({ articleId }: LeaveReplyProps) => {
  const { data: session } = useSession();
  const [createComment, { isLoading }] = useCreateCommentMutation();
  const [formData, setFormData] = useState({
    message: "",
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setShowSuccess(false);

    if (!session) {
      setError("Vous devez être connecté pour commenter.");
      return;
    }

    if (!formData.message.trim()) {
      setError("Le commentaire ne peut pas être vide.");
      return;
    }

    try {
      await createComment({
        content: formData.message,
        articleId: articleId,
      }).unwrap();

      // Reset form
      setFormData({
        message: "",
      });

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);
    } catch (err: any) {
      setError(
        err?.data?.error ||
          "Erreur lors de l'envoi du commentaire. Veuillez réessayer.",
      );
    }
  };

  if (!session) {
    return (
      <SlideUp className="leave__replay">
        <h2 className="t__54">Leave A Reply</h2>
        <div className="alert alert-info">
          <p className="mb-0">
            Vous devez être{" "}
            <Link href="/auth/login" className="fw-bold">
              connecté
            </Link>{" "}
            pour laisser un commentaire.
          </p>
        </div>
      </SlideUp>
    );
  }

  return (
    <SlideUp className="leave__replay">
      <h2 className="t__54">Leave A Reply</h2>
      <p>
        Votre commentaire sera modéré avant publication. Les champs marqués *
        sont obligatoires.
      </p>

      {showSuccess && (
        <div className="alert alert-success">
          <strong>Merci !</strong> Votre commentaire a été envoyé et sera publié
          après modération.
        </div>
      )}

      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="row">
          <div className="col-12">
            <textarea
              name="message"
              placeholder="Votre commentaire *"
              value={formData.message}
              onChange={(e) =>
                setFormData({ ...formData, message: e.target.value })
              }
              required
              rows={5}
              disabled={isLoading}
            />
          </div>
          <div>
            <button
              type="submit"
              className="common__btn mt-4 mt-md-0"
              disabled={isLoading}
            >
              {isLoading ? "Envoi..." : "Poster le commentaire"}
              <img src="/icons/arrow-up-rignt-black.svg" alt="img" />
            </button>
          </div>
        </div>
      </form>
    </SlideUp>
  );
};

export default LeaveReply;
