"use client";

import IconifyIcon from "../../../../components/dashboard/wrappers/IconifyIcon";
import Link from "next/link";
import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Col,
  Spinner,
  Badge,
} from "react-bootstrap";
import { useGetArticlesQuery } from "../../../../store/api/blogApi";

const FreshArticles = () => {
  const { data, isLoading, error } = useGetArticlesQuery({
    page: 1,
    limit: 1,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const article = data?.articles[0];

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <Col xl={5} lg={12}>
        <Card>
          <CardHeader>
            <CardTitle as={"h4"}>Fresh Articles, News &amp; Updates</CardTitle>
          </CardHeader>
          <CardBody className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <p className="text-muted mt-3">Chargement...</p>
          </CardBody>
        </Card>
      </Col>
    );
  }

  if (error || !article) {
    return (
      <Col xl={5} lg={12}>
        <Card>
          <CardHeader>
            <CardTitle as={"h4"}>Fresh Articles, News &amp; Updates</CardTitle>
          </CardHeader>
          <CardBody className="text-center py-5">
            <IconifyIcon
              icon="solar:document-outline"
              className="fs-48 text-muted mb-3"
            />
            <p className="text-muted">Aucun article disponible</p>
          </CardBody>
        </Card>
      </Col>
    );
  }

  return (
    <Col xl={5} lg={12}>
      <Card>
        <CardHeader>
          <CardTitle as={"h4"}>Fresh Articles, News &amp; Updates</CardTitle>
        </CardHeader>
        <CardBody>
          {article.featuredImage && (
            <img
              src={article.featuredImage}
              alt={article.title}
              className="rounded-3 img-fluid w-100"
              style={{ maxHeight: "300px", objectFit: "cover" }}
            />
          )}
          <div className="mt-3">
            <span>
              <Link
                href={`/blog/${article.slug}`}
                className="text-dark fs-18 fw-medium"
              >
                {article.title}
              </Link>
              &nbsp;
              {article.category && (
                <Badge bg="primary-subtle" text="primary" className="ms-1">
                  {article.category.name}
                </Badge>
              )}
            </span>
            <p className="mt-2 text-muted">
              {article.excerpt
                ? article.excerpt.length > 200
                  ? `${article.excerpt.substring(0, 200)}...`
                  : article.excerpt
                : article.content.substring(0, 200) + "..."}{" "}
              <Link
                href={`/blog/${article.slug}`}
                className="link-primary fw-medium"
              >
                Read More
              </Link>
            </p>
            <div className="d-flex align-items-center gap-1">
              <div className="position-relative">
                <div className="avatar rounded-circle flex-shrink-0 bg-primary-subtle d-flex align-items-center justify-content-center">
                  <span className="text-primary fs-16 fw-semibold">
                    {(article.author.name || article.author.username)
                      .charAt(0)
                      .toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="d-block ms-2 flex-grow-1">
                <span className="text-dark">
                  <span className="text-dark fw-medium">
                    {article.author.name || article.author.username}
                  </span>
                </span>
                <p className="text-muted mb-0">
                  <IconifyIcon icon="ti:calendar-due" />{" "}
                  {formatDate(article.publishedAt || article.createdAt)}
                </p>
              </div>
              <div className="ms-auto">
                <span>
                  <button
                    type="button"
                    className="btn btn-soft-danger avatar-sm d-inline-flex align-items-center justify-content-center fs-20 rounded-circle"
                  >
                    <span>
                      <IconifyIcon icon="solar:heart-broken" />
                    </span>
                  </button>
                </span>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    </Col>
  );
};

export default FreshArticles;
