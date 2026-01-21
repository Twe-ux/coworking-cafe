"use client";

import { useState } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Table,
  Spinner,
  Badge,
  Button,
  Form,
  ButtonGroup,
  Modal,
} from "react-bootstrap";
import {
  useGetCommentsQuery,
  useApproveCommentMutation,
  useDeleteCommentMutation,
} from "../../../../store/api/blogApi";
import { useNotification } from "../../../../hooks/useNotification";
import IconifyIcon from "../../../../components/dashboard/wrappers/IconifyIcon";
import Link from "next/link";

const CommentsPage = () => {
  const [statusFilter, setStatusFilter] = useState<
    "all" | "pending" | "approved" | "rejected" | "spam"
  >("pending");
  const [page, setPage] = useState(1);
  const [selectedComment, setSelectedComment] = useState<any>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const { data, isLoading, error } = useGetCommentsQuery({
    status: statusFilter === "all" ? undefined : statusFilter,
    page,
    limit: 20,
  });

  const [approveComment, { isLoading: isApproving }] =
    useApproveCommentMutation();
  const [deleteComment, { isLoading: isDeleting }] = useDeleteCommentMutation();
  const { success, error: showError } = useNotification();

  const handleApprove = async (
    id: string,
    status: "approved" | "rejected" | "spam",
  ) => {
    try {
      await approveComment({ id, status }).unwrap();
      success(
        `Commentaire ${status === "approved" ? "approuvé" : status === "rejected" ? "rejeté" : "marqué comme spam"} avec succès`,
      );
    } catch (err: any) {
      showError(err?.data?.error || "Erreur lors de la mise à jour");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce commentaire ?")) {
      return;
    }

    try {
      await deleteComment(id).unwrap();
      success("Commentaire supprimé avec succès");
    } catch (err: any) {
      showError(err?.data?.error || "Erreur lors de la suppression");
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      pending: "warning",
      approved: "success",
      rejected: "danger",
      spam: "dark",
    };
    return <Badge bg={variants[status] || "secondary"}>{status}</Badge>;
  };

  const handleShowDetails = (comment: any) => {
    setSelectedComment(comment);
    setShowDetailsModal(true);
  };

  if (isLoading) {
    return (
      <Card>
        <CardBody className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="text-muted mt-3">Chargement des commentaires...</p>
        </CardBody>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="d-flex justify-content-between align-items-center flex-wrap gap-3">
          <CardTitle as="h4" className="mb-0">
            Gestion des Commentaires
          </CardTitle>
          <div className="d-flex gap-2 align-items-center">
            <Form.Select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as any);
                setPage(1);
              }}
              style={{ width: "auto" }}
            >
              <option value="all">Tous</option>
              <option value="pending">En attente</option>
              <option value="approved">Approuvés</option>
              <option value="rejected">Rejetés</option>
              <option value="spam">Spam</option>
            </Form.Select>
            {data && (
              <Badge bg="primary" className="fs-6">
                {data.total} commentaire{data.total > 1 ? "s" : ""}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardBody>
          {error ? (
            <div className="alert alert-danger">
              Erreur lors du chargement des commentaires
            </div>
          ) : !data?.comments || data.comments.length === 0 ? (
            <div className="text-center py-5">
              <IconifyIcon
                icon="solar:chat-square-outline"
                className="fs-48 text-muted mb-3"
              />
              <h5>Aucun commentaire</h5>
              <p className="text-muted mb-3">
                {statusFilter === "pending"
                  ? "Aucun commentaire en attente de modération"
                  : `Aucun commentaire avec le statut "${statusFilter}"`}
              </p>
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <Table hover className="mb-0">
                  <thead>
                    <tr>
                      <th>Auteur</th>
                      <th>Commentaire</th>
                      <th>Article</th>
                      <th>Date</th>
                      <th>Statut</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.comments.map((comment) => (
                      <tr key={comment._id}>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <div
                              className="avatar rounded-circle bg-primary-subtle d-flex align-items-center justify-content-center"
                              style={{
                                width: "35px",
                                height: "35px",
                                minWidth: "35px",
                              }}
                            >
                              <span className="text-primary fw-semibold">
                                {(comment.user.name || comment.user.username)
                                  .charAt(0)
                                  .toUpperCase()}
                              </span>
                            </div>
                            <div
                              className="text-truncate"
                              style={{ maxWidth: "120px" }}
                            >
                              <strong className="d-block text-truncate">
                                {comment.user.name || comment.user.username}
                              </strong>
                              <small className="text-muted text-truncate d-block">
                                {comment.user.email}
                              </small>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div style={{ maxWidth: "250px" }}>
                            <p className="mb-0 text-truncate">
                              {comment.content.length > 60
                                ? `${comment.content.substring(0, 60)}...`
                                : comment.content}
                            </p>
                            {comment.parent && (
                              <small className="text-muted">
                                <IconifyIcon
                                  icon="solar:reply-outline"
                                  className="me-1"
                                />
                                Réponse
                              </small>
                            )}
                          </div>
                        </td>
                        <td>
                          <div style={{ maxWidth: "200px" }}>
                            {typeof comment.article === "object" &&
                            comment.article?.title ? (
                              <Link
                                href={`/blog/${comment.article.slug}`}
                                className="text-decoration-none"
                                target="_blank"
                              >
                                <small className="text-truncate d-block">
                                  {comment.article.title}
                                </small>
                              </Link>
                            ) : (
                              <small className="text-muted">
                                Article supprimé
                              </small>
                            )}
                          </div>
                        </td>
                        <td>
                          <small>{formatDate(comment.createdAt)}</small>
                        </td>
                        <td>{getStatusBadge(comment.status)}</td>
                        <td>
                          <div className="d-flex gap-1">
                            <Button
                              variant="outline-primary"
                              size="sm"
                              title="Voir détails"
                              onClick={() => handleShowDetails(comment)}
                            >
                              <IconifyIcon icon="solar:eye-outline" />
                            </Button>
                            {comment.status === "pending" && (
                              <>
                                <Button
                                  variant="outline-success"
                                  size="sm"
                                  onClick={() =>
                                    handleApprove(comment._id, "approved")
                                  }
                                  disabled={isApproving}
                                  title="Approuver"
                                >
                                  <IconifyIcon icon="solar:check-circle-outline" />
                                </Button>
                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  onClick={() =>
                                    handleApprove(comment._id, "rejected")
                                  }
                                  disabled={isApproving}
                                  title="Rejeter"
                                >
                                  <IconifyIcon icon="solar:close-circle-outline" />
                                </Button>
                              </>
                            )}
                            {comment.status !== "spam" && (
                              <Button
                                variant="outline-warning"
                                size="sm"
                                onClick={() =>
                                  handleApprove(comment._id, "spam")
                                }
                                disabled={isApproving}
                                title="Marquer comme spam"
                              >
                                <IconifyIcon icon="solar:shield-warning-outline" />
                              </Button>
                            )}
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => handleDelete(comment._id)}
                              disabled={isDeleting}
                              title="Supprimer"
                            >
                              <IconifyIcon icon="solar:trash-bin-outline" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>

              {/* Pagination */}
              {data.pages > 1 && (
                <div className="d-flex justify-content-center gap-2 mt-4">
                  <Button
                    variant="outline-dark"
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                  >
                    Précédent
                  </Button>
                  <span className="align-self-center px-3">
                    Page {page} sur {data.pages}
                  </span>
                  <Button
                    variant="outline-dark"
                    disabled={page === data.pages}
                    onClick={() => setPage(page + 1)}
                  >
                    Suivant
                  </Button>
                </div>
              )}
            </>
          )}
        </CardBody>
      </Card>

      {/* Details Modal */}
      <Modal
        show={showDetailsModal}
        onHide={() => setShowDetailsModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Détails du commentaire</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedComment && (
            <>
              {/* Author Info */}
              <div className="mb-4">
                <h6 className="text-muted mb-2">Auteur</h6>
                <div className="d-flex align-items-center gap-3">
                  <div
                    className="avatar rounded-circle bg-primary-subtle d-flex align-items-center justify-content-center"
                    style={{ width: "50px", height: "50px" }}
                  >
                    <span className="text-primary fw-semibold fs-5">
                      {(
                        selectedComment.user.name ||
                        selectedComment.user.username
                      )
                        .charAt(0)
                        .toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <strong className="d-block">
                      {selectedComment.user.name ||
                        selectedComment.user.username}
                    </strong>
                    <small className="text-muted">
                      {selectedComment.user.email}
                    </small>
                  </div>
                </div>
              </div>

              {/* Article Info */}
              {typeof selectedComment.article === "object" &&
                selectedComment.article && (
                  <div className="mb-4">
                    <h6 className="text-muted mb-2">Article</h6>
                    <Link
                      href={`/blog/${selectedComment.article.slug}`}
                      className="text-decoration-none"
                      target="_blank"
                    >
                      <strong>{selectedComment.article.title}</strong>
                      <IconifyIcon
                        icon="solar:link-circle-outline"
                        className="ms-2"
                      />
                    </Link>
                  </div>
                )}

              {/* Comment Content */}
              <div className="mb-4">
                <h6 className="text-muted mb-2">Contenu</h6>
                <p className="bg-light p-3 rounded">
                  {selectedComment.content}
                </p>
              </div>

              {/* Parent Comment */}
              {typeof selectedComment.parent === "object" &&
                selectedComment.parent && (
                  <div className="mb-4">
                    <h6 className="text-muted mb-2">En réponse à</h6>
                    <p className="bg-light p-3 rounded">
                      <small className="text-muted d-block mb-1">
                        {selectedComment.parent.user.name ||
                          selectedComment.parent.user.username}
                      </small>
                      {selectedComment.parent.content}
                    </p>
                  </div>
                )}

              {/* Metadata */}
              <div className="row">
                <div className="col-md-4">
                  <h6 className="text-muted mb-2">Statut</h6>
                  {getStatusBadge(selectedComment.status)}
                </div>
                <div className="col-md-4">
                  <h6 className="text-muted mb-2">Date</h6>
                  <small>{formatDate(selectedComment.createdAt)}</small>
                </div>
                <div className="col-md-4">
                  <h6 className="text-muted mb-2">Likes</h6>
                  <span>{selectedComment.likeCount || 0}</span>
                </div>
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          {selectedComment && selectedComment.status === "pending" && (
            <>
              <Button
                variant="success"
                onClick={() => {
                  handleApprove(selectedComment._id, "approved");
                  setShowDetailsModal(false);
                }}
              >
                <IconifyIcon
                  icon="solar:check-circle-outline"
                  className="me-2"
                />
                Approuver
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  handleApprove(selectedComment._id, "rejected");
                  setShowDetailsModal(false);
                }}
              >
                <IconifyIcon
                  icon="solar:close-circle-outline"
                  className="me-2"
                />
                Rejeter
              </Button>
            </>
          )}
          <Button
            variant="secondary"
            onClick={() => setShowDetailsModal(false)}
          >
            Fermer
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default CommentsPage;
