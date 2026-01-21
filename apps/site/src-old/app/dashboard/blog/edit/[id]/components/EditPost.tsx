"use client";

import DropzoneImageUpload from "../../../../../../components/dashboard/DropzoneImageUpload";
import TextAreaFormInput from "../../../../../../components/dashboard/from/TextAreaFormInput";
import TextFormInput from "../../../../../../components/dashboard/from/TextFormInput";
import ImageUpload from "../../../../../../components/dashboard/ImageUpload";
import MarkdownEditor from "../../../../../../components/dashboard/MarkdownEditor";
import PreviewModal from "../../../../../../components/dashboard/PreviewModal";
import IconifyIcon from "../../../../../../components/dashboard/wrappers/IconifyIcon";
import { useNotification } from "../../../../../../hooks/useNotification";
import {
  useGetArticleByIdQuery,
  useGetCategoriesQuery,
  useUpdateArticleMutation,
} from "../../../../../../store/api/blogApi";
import {
  generateMetaDescription,
  generateMetaTitle,
} from "../../../../../../utils/markdown";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Col,
  Form,
  Row,
  Spinner,
} from "react-bootstrap";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";

interface EditPostProps {
  articleId: string;
}

const EditPost = ({ articleId }: EditPostProps) => {
  const router = useRouter();
  const {
    data: article,
    isLoading: isFetching,
    error: fetchError,
  } = useGetArticleByIdQuery(articleId);
  const [updateArticle, { isLoading: isUpdating }] = useUpdateArticleMutation();
  const { data: categoriesData } = useGetCategoriesQuery({ limit: 100 });
  const { success, error: showError } = useNotification();
  const [selectedStatus, setSelectedStatus] = useState<string>("draft");
  const [showPreview, setShowPreview] = useState(false);

  const articleSchema = yup.object({
    title: yup
      .string()
      .required("Le titre est obligatoire")
      .min(5, "Le titre doit contenir au moins 5 caractères")
      .defined(),
    excerpt: yup
      .string()
      .max(300, "L'extrait ne peut pas dépasser 300 caractères")
      .defined()
      .default(""),
    content: yup
      .string()
      .required("Le contenu est obligatoire")
      .min(50, "Le contenu doit contenir au moins 50 caractères")
      .defined(),
    featuredImage: yup
      .string()
      .url("L'URL de l'image doit être valide")
      .defined()
      .default(""),
    categoryId: yup.string().defined().default(""),
    scheduledFor: yup.date().nullable().default(null),
    seoMetaTitle: yup
      .string()
      .max(60, "Le meta titre ne peut pas dépasser 60 caractères")
      .defined()
      .default(""),
    seoMetaDescription: yup
      .string()
      .max(160, "La meta description ne peut pas dépasser 160 caractères")
      .defined()
      .default(""),
    seoMetaKeywords: yup.array().of(yup.string()).defined().default([]),
    seoOgImage: yup
      .string()
      .url("L'URL de l'image OG doit être valide")
      .defined()
      .default(""),
  });

  const {
    handleSubmit,
    control,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm({
    resolver: yupResolver(articleSchema),
    defaultValues: {
      title: "",
      excerpt: "",
      content: "",
      featuredImage: "",
      categoryId: "",
      scheduledFor: null,
      seoMetaTitle: "",
      seoMetaDescription: "",
      seoMetaKeywords: [],
      seoOgImage: "",
    },
  });

  // Auto-generate SEO meta description from content
  const handleGenerateMetaDescription = () => {
    const content = watch("content");
    if (!content) {
      showError("Veuillez d'abord rédiger le contenu de l'article");
      return;
    }
    const metaDesc = generateMetaDescription(content, 160);
    setValue("seoMetaDescription", metaDesc);
    success("Meta description générée automatiquement");
  };

  // Auto-generate SEO meta title from title
  const handleGenerateMetaTitle = () => {
    const title = watch("title");
    if (!title) {
      showError("Veuillez d'abord saisir le titre de l'article");
      return;
    }
    const metaTitle = generateMetaTitle(
      title,
      "CoworKing Café by Anticafé",
      60,
    );
    setValue("seoMetaTitle", metaTitle);
    success("Meta titre généré automatiquement");
  };

  // Populate form when article data is loaded
  useEffect(() => {
    if (article) {
      reset({
        title: article.title || "",
        excerpt: article.excerpt || "",
        content: article.content || "",
        featuredImage: article.featuredImage || "",
        categoryId: article.category?._id || "",
        scheduledFor: article.scheduledFor
          ? new Date(article.scheduledFor)
          : null,
        seoMetaTitle: article.metaTitle || "",
        seoMetaDescription: article.metaDescription || "",
        seoMetaKeywords: article.metaKeywords || [],
        seoOgImage: "",
      });
      setSelectedStatus(article.status || "draft");
    }
  }, [article, reset]);

  const onSubmit = async (data: any) => {
    try {
      const articleData: any = {
        title: data.title,
        content: data.content,
        excerpt: data.excerpt || undefined,
        featuredImage: data.featuredImage || undefined,
        categoryId: data.categoryId || undefined,
        status: selectedStatus,
        scheduledFor: data.scheduledFor || undefined,
        // SEO fields as separate properties
        metaTitle: data.seoMetaTitle || undefined,
        metaDescription: data.seoMetaDescription || undefined,
        metaKeywords: data.seoMetaKeywords?.filter(Boolean) || [],
      };

      await updateArticle({ id: articleId, data: articleData }).unwrap();
      success("Article mis à jour avec succès");

      // Stay on the edit page after successful update
    } catch (err: any) {
      showError(
        err?.data?.error || "Erreur lors de la mise à jour de l'article",
      );
    }
  };

  if (isFetching) {
    return (
      <Card>
        <CardBody className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="text-muted mt-3">Chargement de l'article...</p>
        </CardBody>
      </Card>
    );
  }

  if (fetchError || !article) {
    return (
      <Card>
        <CardBody className="text-center py-5">
          <IconifyIcon
            icon="solar:danger-circle-outline"
            className="fs-48 text-danger mb-3"
          />
          <h5>Erreur de chargement</h5>
          <p className="text-muted">
            Impossible de charger l'article. Il n'existe peut-être pas ou vous
            n'avez pas les permissions nécessaires.
          </p>
          <Button
            variant="primary"
            onClick={() => router.push("/dashboard/post")}
          >
            Retour à la liste
          </Button>
        </CardBody>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Article Info */}
      <Card>
        <CardHeader className="d-flex justify-content-between align-items-center">
          <CardTitle as={"h4"}>Informations de l'article</CardTitle>
          <div className="d-flex gap-2">
            <small className="text-muted">
              <IconifyIcon icon="solar:eye-outline" className="me-1" />
              {article.viewCount} vues
            </small>
            <small className="text-muted">
              <IconifyIcon icon="solar:heart-outline" className="me-1" />
              {article.likeCount} likes
            </small>
            <small className="text-muted">
              <IconifyIcon icon="solar:clock-circle-outline" className="me-1" />
              {article.readingTime} min
            </small>
          </div>
        </CardHeader>
        <CardBody>
          <Row>
            <Col lg={12}>
              <div className="mb-3">
                <TextFormInput
                  control={control}
                  name="title"
                  placeholder="Titre de l'article"
                  label="Titre *"
                />
                {errors.title && (
                  <small className="text-danger">{errors.title.message}</small>
                )}
              </div>
            </Col>

            <Col lg={12}>
              <div className="mb-3">
                <TextAreaFormInput
                  control={control}
                  name="excerpt"
                  label="Extrait (résumé court)"
                  rows={2}
                  placeholder="Un court résumé de l'article..."
                />
                {errors.excerpt && (
                  <small className="text-danger">
                    {errors.excerpt.message}
                  </small>
                )}
              </div>
            </Col>

            <Col lg={12}>
              <Controller
                name="content"
                control={control}
                render={({ field }) => (
                  <>
                    <MarkdownEditor
                      value={field.value}
                      onChange={field.onChange}
                      label="Contenu *"
                      placeholder="Écrivez votre article en Markdown..."
                    />
                    {errors.content && (
                      <small className="text-danger">
                        {errors.content.message}
                      </small>
                    )}
                  </>
                )}
              />
            </Col>

            <Col lg={12}>
              <Controller
                name="featuredImage"
                control={control}
                render={({ field }) => (
                  <DropzoneImageUpload
                    onImageUpload={field.onChange}
                    currentImage={field.value}
                    label="Image à la une"
                    folder="blog"
                  />
                )}
              />
              {errors.featuredImage && (
                <small className="text-danger">
                  {errors.featuredImage.message}
                </small>
              )}
            </Col>

            <Col lg={6}>
              <div className="mb-3">
                <label htmlFor="categoryId" className="form-label">
                  Catégorie
                </label>
                <Controller
                  name="categoryId"
                  control={control}
                  render={({ field }) => (
                    <Form.Select {...field} id="categoryId">
                      <option value="">Sélectionner une catégorie</option>
                      {categoriesData?.categories.map((category) => (
                        <option key={category._id} value={category._id}>
                          {category.name}
                        </option>
                      ))}
                    </Form.Select>
                  )}
                />
                {errors.categoryId && (
                  <small className="text-danger">
                    {errors.categoryId.message}
                  </small>
                )}
              </div>
            </Col>

            <Col lg={12}>
              <div className="mb-3">
                <label htmlFor="status" className="form-label">
                  Statut *
                </label>
                <Form.Select
                  id="status"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                >
                  <option value="draft">Brouillon</option>
                  <option value="published">Publié</option>
                  <option value="archived">Archivé</option>
                  <option value="scheduled">Programmé</option>
                </Form.Select>
              </div>
            </Col>

            {selectedStatus === "scheduled" && (
              <Col lg={6}>
                <div className="mb-3">
                  <Controller
                    name="scheduledFor"
                    control={control}
                    render={({ field }) => (
                      <>
                        <label htmlFor="scheduledFor" className="form-label">
                          Date de publication programmée
                        </label>
                        <input
                          {...field}
                          type="datetime-local"
                          id="scheduledFor"
                          className="form-control"
                          value={
                            field.value
                              ? new Date(field.value).toISOString().slice(0, 16)
                              : ""
                          }
                          onChange={(e) =>
                            field.onChange(
                              e.target.value ? new Date(e.target.value) : null,
                            )
                          }
                        />
                      </>
                    )}
                  />
                </div>
              </Col>
            )}
          </Row>
        </CardBody>
      </Card>

      {/* SEO Section */}
      <Card>
        <CardHeader>
          <CardTitle as={"h4"}>SEO (Référencement)</CardTitle>
        </CardHeader>
        <CardBody>
          <Row>
            <Col lg={12}>
              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <label className="form-label mb-0">Meta Titre</label>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={handleGenerateMetaTitle}
                    type="button"
                  >
                    <i className="bi bi-magic me-1"></i>
                    Générer automatiquement
                  </Button>
                </div>
                <TextFormInput
                  control={control}
                  name="seoMetaTitle"
                  placeholder="Titre pour les moteurs de recherche"
                  label=""
                />
                {errors.seoMetaTitle && (
                  <small className="text-danger">
                    {errors.seoMetaTitle.message}
                  </small>
                )}
              </div>
            </Col>

            <Col lg={12}>
              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <label className="form-label mb-0">Meta Description</label>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={handleGenerateMetaDescription}
                    type="button"
                  >
                    <i className="bi bi-magic me-1"></i>
                    Générer automatiquement
                  </Button>
                </div>
                <TextAreaFormInput
                  control={control}
                  name="seoMetaDescription"
                  label=""
                  rows={2}
                  placeholder="Description pour les moteurs de recherche..."
                />
                {errors.seoMetaDescription && (
                  <small className="text-danger">
                    {errors.seoMetaDescription.message}
                  </small>
                )}
              </div>
            </Col>

            <Col lg={12}>
              <Controller
                name="seoOgImage"
                control={control}
                render={({ field }) => (
                  <ImageUpload
                    onImageUpload={field.onChange}
                    currentImage={field.value}
                    label="Image Open Graph (réseaux sociaux)"
                    folder="blog/og"
                  />
                )}
              />
              {errors.seoOgImage && (
                <small className="text-danger">
                  {errors.seoOgImage.message}
                </small>
              )}
            </Col>
          </Row>
        </CardBody>
      </Card>

      {/* Article Metadata */}
      <Card>
        <CardHeader>
          <CardTitle as={"h4"}>Métadonnées</CardTitle>
        </CardHeader>
        <CardBody>
          <Row>
            <Col lg={6}>
              <p className="mb-2">
                <strong>Auteur:</strong>{" "}
                {article.author?.name || article.author?.username}
              </p>
              <p className="mb-2">
                <strong>Slug:</strong> {article.slug}
              </p>
            </Col>
            <Col lg={6}>
              <p className="mb-2">
                <strong>Créé le:</strong>{" "}
                {new Date(article.createdAt).toLocaleDateString("fr-FR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
              {article.publishedAt && (
                <p className="mb-2">
                  <strong>Publié le:</strong>{" "}
                  {new Date(article.publishedAt).toLocaleDateString("fr-FR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              )}
            </Col>
          </Row>
        </CardBody>
      </Card>

      {/* Action Buttons */}
      <div className="mb-3 rounded">
        <Row className="justify-content-end g-2">
          <Col lg={2}>
            <Button
              variant="outline-info"
              className="w-100"
              type="button"
              onClick={() => setShowPreview(true)}
              disabled={isUpdating}
            >
              <i className="bi bi-eye me-2"></i>
              Prévisualiser
            </Button>
          </Col>
          <Col lg={2}>
            <Button
              variant="outline-secondary"
              className="w-100"
              onClick={() => router.push(`/blog/${article.slug}`)}
              disabled={isUpdating}
            >
              <IconifyIcon icon="solar:link-outline" className="me-2" />
              Voir publié
            </Button>
          </Col>
          <Col lg={2}>
            <Button
              variant="outline-primary"
              type="submit"
              className="w-100"
              disabled={isUpdating}
            >
              {isUpdating ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <IconifyIcon icon="solar:diskette-outline" className="me-2" />
                  Enregistrer
                </>
              )}
            </Button>
          </Col>
          <Col lg={2}>
            <Button
              variant="danger"
              className="w-100"
              onClick={() => router.push("/dashboard/post")}
              disabled={isUpdating}
            >
              Annuler
            </Button>
          </Col>
        </Row>
      </div>

      {/* Preview Modal */}
      <PreviewModal
        show={showPreview}
        onHide={() => setShowPreview(false)}
        article={{
          title: watch("title") || "Sans titre",
          excerpt: watch("excerpt"),
          content: watch("content") || "Pas de contenu",
          featuredImage: watch("featuredImage"),
          author: article?.author || { name: "Vous" },
          category:
            article?.category ||
            categoriesData?.categories.find(
              (c) => c._id === watch("categoryId"),
            ),
        }}
      />
    </form>
  );
};

export default EditPost;
