"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Card,
  CardBody,
  Col,
  Badge,
  Button,
  Spinner,
  Dropdown,
} from "react-bootstrap";
import IconifyIcon from "../../../../components/dashboard/wrappers/IconifyIcon";
import {
  useGetArticlesQuery,
  useDeleteArticleMutation,
  useTogglePublishMutation,
} from "../../../../store/api/blogApi";
import { useNotification } from "../../../../hooks/useNotification";
import type { Article } from "../../../../store/api/blogApi";

interface PostCardProps {
  article: Article;
  onDelete: (id: string) => void;
  onTogglePublish: (id: string) => void;
  isDeleting: boolean;
  isToggling: boolean;
}

const PostCard = ({
  article,
  onDelete,
  onTogglePublish,
  isDeleting,
  isToggling,
}: PostCardProps) => {
  const statusColor = {
    published: "success",
    draft: "warning",
    archived: "secondary",
    scheduled: "info",
  }[article.status];

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Card>
      <CardBody className="p-3">
        {/* Featured Image */}
        {article.featuredImage && (
          <div className="ratio ratio-16x9 mb-3">
            <img
              src={article.featuredImage}
              alt={article.title}
              className="rounded object-fit-cover"
            />
          </div>
        )}

        {/* Title & Status */}
        <div className="d-flex align-items-start gap-2 mb-2">
          <Link
            href={`/dashboard/blog/edit/${article._id}`}
            className="text-dark fs-16 fw-medium flex-grow-1"
          >
            {article.title}
          </Link>
          <Badge bg={statusColor}>{article.status}</Badge>
        </div>

        {/* Excerpt */}
        {article.excerpt && (
          <p className="text-muted small mb-3">
            {article.excerpt.substring(0, 100)}...
          </p>
        )}

        {/* Meta Info */}
        <div className="d-flex align-items-center gap-3 text-muted small mb-3">
          <span>
            <IconifyIcon icon="solar:eye-outline" className="me-1" />
            {article.viewCount}
          </span>
          <span>
            <IconifyIcon icon="solar:heart-outline" className="me-1" />
            {article.likeCount}
          </span>
          <span>
            <IconifyIcon icon="solar:clock-circle-outline" className="me-1" />
            {article.readingTime} min
          </span>
        </div>

        {/* Author & Date */}
        <div className="d-flex align-items-center justify-content-between">
          <div>
            <div className="text-dark fw-medium">
              {article.author.name || article.author.username}
            </div>
            <small className="text-muted">
              <IconifyIcon icon="solar:calendar-outline" className="me-1" />
              {formatDate(article.publishedAt || article.createdAt)}
            </small>
          </div>

          {/* Actions Dropdown */}
          <Dropdown>
            <Dropdown.Toggle variant="light" size="sm" className="btn-icon">
              <IconifyIcon icon="solar:menu-dots-bold" />
            </Dropdown.Toggle>

            <Dropdown.Menu align="end">
              <Dropdown.Item
                as={Link}
                href={`/dashboard/blog/edit/${article._id}`}
              >
                <IconifyIcon icon="solar:pen-outline" className="me-2" />
                Éditer
              </Dropdown.Item>

              <Dropdown.Item
                as={Link}
                href={`/blog/${article.slug}`}
                target="_blank"
              >
                <IconifyIcon icon="solar:eye-outline" className="me-2" />
                Voir
              </Dropdown.Item>

              <Dropdown.Divider />

              <Dropdown.Item
                onClick={() => onTogglePublish(article._id)}
                disabled={isToggling}
              >
                <IconifyIcon
                  icon={
                    article.status === "published"
                      ? "solar:archive-outline"
                      : "solar:upload-outline"
                  }
                  className="me-2"
                />
                {article.status === "published" ? "Dépublier" : "Publier"}
              </Dropdown.Item>

              <Dropdown.Divider />

              <Dropdown.Item
                onClick={() => onDelete(article._id)}
                disabled={isDeleting}
                className="text-danger"
              >
                <IconifyIcon icon="solar:trash-bin-outline" className="me-2" />
                Supprimer
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </CardBody>
    </Card>
  );
};

const Posts = () => {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    status: "",
    search: "",
  });

  const { data, isLoading, isFetching, error } = useGetArticlesQuery({
    page,
    limit: 8,
    ...filters,
  });

  const [deleteArticle, { isLoading: isDeleting }] = useDeleteArticleMutation();
  const [togglePublish, { isLoading: isToggling }] = useTogglePublishMutation();
  const { success, error: showError } = useNotification();

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet article ?")) {
      return;
    }

    try {
      await deleteArticle(id).unwrap();
      success("Article supprimé avec succès");
    } catch (err) {
      showError("Erreur lors de la suppression de l'article");
    }
  };

  const handleTogglePublish = async (id: string) => {
    try {
      await togglePublish(id).unwrap();
      success("Statut de publication modifié");
    } catch (err) {
      showError("Erreur lors de la modification du statut");
    }
  };

  if (error) {
    return (
      <Col xs={12}>
        <Card>
          <CardBody className="text-center py-5">
            <IconifyIcon
              icon="solar:danger-circle-outline"
              className="fs-48 text-danger mb-3"
            />
            <h5>Erreur de chargement</h5>
            <p className="text-muted">
              Impossible de charger les articles. Veuillez réessayer.
            </p>
          </CardBody>
        </Card>
      </Col>
    );
  }

  if (isLoading) {
    return (
      <Col xs={12}>
        <Card>
          <CardBody className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <p className="text-muted mt-3">Chargement des articles...</p>
          </CardBody>
        </Card>
      </Col>
    );
  }

  if (!data?.articles || data.articles.length === 0) {
    return (
      <Col xs={12}>
        <Card>
          <CardBody className="text-center py-5">
            <IconifyIcon
              icon="solar:document-outline"
              className="fs-48 text-muted mb-3"
            />
            <h5>Aucun article</h5>
            <p className="text-muted mb-3">
              Commencez par créer votre premier article
            </p>
            <Link href="/dashboard/post/create">
              <Button variant="primary">
                <IconifyIcon icon="solar:add-circle-outline" className="me-2" />
                Créer un article
              </Button>
            </Link>
          </CardBody>
        </Card>
      </Col>
    );
  }

  return (
    <>
      {/* Articles Grid */}
      {data.articles.map((article) => (
        <Col xl={3} lg={6} key={article._id}>
          <PostCard
            article={article}
            onDelete={handleDelete}
            onTogglePublish={handleTogglePublish}
            isDeleting={isDeleting}
            isToggling={isToggling}
          />
        </Col>
      ))}

      {/* Pagination */}
      {data.pages > 1 && (
        <Col xs={12}>
          <div className="d-flex justify-content-center gap-2 mt-4">
            <Button
              variant="outline-primary"
              disabled={page === 1 || isFetching}
              onClick={() => setPage(page - 1)}
            >
              Précédent
            </Button>
            <span className="align-self-center px-3">
              Page {page} sur {data.pages}
            </span>
            <Button
              variant="outline-primary"
              disabled={page === data.pages || isFetching}
              onClick={() => setPage(page + 1)}
            >
              Suivant
            </Button>
          </div>
        </Col>
      )}
    </>
  );
};

export default Posts;
