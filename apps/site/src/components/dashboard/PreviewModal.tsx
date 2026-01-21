"use client";

import MarkdownRenderer from "../site/blogs/MarkdownRenderer";
import { Button, Modal } from "react-bootstrap";

interface PreviewModalProps {
  show: boolean;
  onHide: () => void;
  article: {
    title: string;
    excerpt?: string;
    content: string;
    featuredImage?: string;
    author?: {
      name?: string;
      username?: string;
    };
    category?: { _id: string; name: string };
  };
}

const PreviewModal = ({ show, onHide, article }: PreviewModalProps) => {
  const today = new Date().toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Modal show={show} onHide={onHide} size="xl" scrollable>
      <Modal.Header closeButton>
        <Modal.Title>
          <i className="bi bi-eye me-2"></i>
          Prévisualisation de l'article
        </Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ maxHeight: "80vh" }}>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-10">
              {/* Article Header */}
              <article>
                <header className="mb-5">
                  {/* Category */}
                  {article.category && (
                    <div className="mb-3">
                      <span className="badge bg-primary me-2">
                        {article.category.name}
                      </span>
                    </div>
                  )}

                  {/* Title */}
                  <h1 className="display-4 fw-bold mb-3">{article.title}</h1>

                  {/* Excerpt */}
                  {article.excerpt && (
                    <p className="lead text-muted mb-4">{article.excerpt}</p>
                  )}

                  {/* Meta Info */}
                  <div className="d-flex align-items-center gap-4 mb-4 text-muted">
                    <div className="d-flex align-items-center gap-2">
                      <div
                        className="avatar rounded-circle bg-primary text-white d-flex align-items-center justify-content-center"
                        style={{ width: "40px", height: "40px" }}
                      >
                        <span className="fw-semibold">
                          {(
                            article.author?.name ||
                            article.author?.username ||
                            "A"
                          )
                            .charAt(0)
                            .toUpperCase()}
                        </span>
                      </div>
                      <span className="fw-medium text-dark">
                        {article.author?.name ||
                          article.author?.username ||
                          "Auteur"}
                      </span>
                    </div>
                    <span>•</span>
                    <time>{today}</time>
                    <span>•</span>
                    <span>Prévisualisation</span>
                  </div>

                  {/* Featured Image */}
                  {article.featuredImage && (
                    <div className="mb-5">
                      <img
                        src={article.featuredImage}
                        alt={article.title}
                        className="img-fluid rounded w-100"
                        style={{ maxHeight: "500px", objectFit: "cover" }}
                      />
                    </div>
                  )}
                </header>

                {/* Article Content */}
                <div className="article-content mb-5">
                  <MarkdownRenderer content={article.content} />
                </div>

                {/* Preview Notice */}
                <div className="alert alert-info">
                  <i className="bi bi-info-circle me-2"></i>
                  <strong>Note :</strong> Ceci est une prévisualisation.
                  L'article n'est pas encore publié.
                </div>
              </article>
            </div>
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Fermer
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default PreviewModal;
