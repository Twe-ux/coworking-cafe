"use client";

import IconifyIcon from "../../../../components/dashboard/wrappers/IconifyIcon";
import Link from "next/link";
import { Card, CardBody, Col, Row, Spinner, Badge } from "react-bootstrap";
import { useGetArticlesQuery } from "../../../../store/api/blogApi";

const Articles = () => {
  const { data, isLoading, error } = useGetArticlesQuery({
    page: 1,
    limit: 4,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getBadgeColor = (tagName: string) => {
    const colors: { [key: string]: string } = {
      Tutorials: "success",
      Blog: "danger",
      News: "warning",
      Homes: "primary",
    };
    return colors[tagName] || "primary";
  };

  if (isLoading) {
    return (
      <Col xl={7} lg={12}>
        <Card>
          <CardBody className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <p className="text-muted mt-3">Chargement des articles...</p>
          </CardBody>
        </Card>
      </Col>
    );
  }

  if (error || !data?.articles || data.articles.length === 0) {
    return (
      <Col xl={7} lg={12}>
        <Card>
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

  const articles = data.articles;
  const featuredArticle = articles[0];
  const recentArticles = articles.slice(1);

  return (
    <Col xl={7} lg={12}>
      <Card>
        <CardBody>
          {/* Recent Articles List */}
          {recentArticles.map((article, idx) => (
            <div
              className={`border-bottom pb-3 ${idx !== 0 && "py-3"}`}
              key={article._id}
            >
              <span className="text-dark">
                <Link
                  href={`/blog/${article.slug}`}
                  className="text-dark fs-18 fw-medium"
                >
                  {article.title}
                </Link>
              </span>
              <p className="mt-2 text-muted">
                {article.excerpt
                  ? article.excerpt.substring(0, 150)
                  : article.content.substring(0, 150)}
                ...
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
          ))}

          {/* Featured Article with Image */}
          <div className="pt-3">
            <span className="text-dark">
              <Link
                href={`/blog/${featuredArticle.slug}`}
                className="text-dark fs-18 fw-medium"
              >
                {featuredArticle.title}
              </Link>
              &nbsp;
              {featuredArticle.category && (
                <Badge
                  bg={`${getBadgeColor(featuredArticle.category.name)}-subtle`}
                  text={getBadgeColor(featuredArticle.category.name)}
                  className="ms-1"
                >
                  {featuredArticle.category.name}
                </Badge>
              )}
            </span>
            <Row className="my-2 align-items-center">
              {featuredArticle.featuredImage && (
                <Col lg={3}>
                  <img
                    alt={featuredArticle.title}
                    src={featuredArticle.featuredImage}
                    className="rounded-3 img-fluid"
                    style={{
                      maxHeight: "150px",
                      objectFit: "cover",
                      width: "100%",
                    }}
                  />
                </Col>
              )}
              <Col lg={featuredArticle.featuredImage ? 9 : 12}>
                <p className="my-2 text-muted">
                  {featuredArticle.excerpt
                    ? featuredArticle.excerpt.substring(0, 120)
                    : featuredArticle.content.substring(0, 120)}
                  ...
                </p>
                <Link
                  href={`/blog/${featuredArticle.slug}`}
                  className="link-primary"
                >
                  View More
                </Link>
              </Col>
            </Row>
            <div className="d-flex align-items-center gap-1 mt-2 pt-1">
              <div className="position-relative">
                <div className="avatar rounded-circle flex-shrink-0 bg-primary-subtle d-flex align-items-center justify-content-center">
                  <span className="text-primary fs-16 fw-semibold">
                    {(
                      featuredArticle.author.name ||
                      featuredArticle.author.username
                    )
                      .charAt(0)
                      .toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="d-block ms-2 flex-grow-1">
                <span className="text-dark">
                  <span className="text-dark fw-medium">
                    {featuredArticle.author.name ||
                      featuredArticle.author.username}
                  </span>
                </span>
                <p className="text-muted mb-0">
                  <IconifyIcon icon="ti:calendar-due" />{" "}
                  {formatDate(
                    featuredArticle.publishedAt || featuredArticle.createdAt,
                  )}
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

export default Articles;
