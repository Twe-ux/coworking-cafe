"use client";

import DropzoneImageUpload from "../../../../../components/dashboard/DropzoneImageUpload";
import TextAreaFormInput from "../../../../../components/dashboard/from/TextAreaFormInput";
import TextFormInput from "../../../../../components/dashboard/from/TextFormInput";
import ImageUpload from "../../../../../components/dashboard/ImageUpload";
import MarkdownEditor from "../../../../../components/dashboard/MarkdownEditor";
import PreviewModal from "../../../../../components/dashboard/PreviewModal";
import { useNotification } from "../../../../../hooks/useNotification";
import {
  useCreateArticleMutation,
  useGetCategoriesQuery,
} from "../../../../../store/api/blogApi";
import {
  generateMetaDescription,
  generateMetaTitle,
} from "../../../../../utils/markdown";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "next/navigation";
import { useState } from "react";
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

const CreatePost = () => {
  const router = useRouter();
  const [createArticle, { isLoading }] = useCreateArticleMutation();
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

      const result = await createArticle(articleData).unwrap();
      success("Article créé avec succès");

      // Redirect to the edit page or post list
      router.push(`/dashboard/blog/edit/${result._id}`);
    } catch (err: any) {
      showError(err?.data?.error || "Erreur lors de la création de l'article");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader>
          <CardTitle as={"h4"}>Informations de l'article</CardTitle>
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

      <div className="mb-3 rounded">
        <Row className="justify-content-end g-2">
          <Col lg={2}>
            <Button
              variant="outline-info"
              type="button"
              className="w-100"
              onClick={() => setShowPreview(true)}
              disabled={isLoading}
            >
              <i className="bi bi-eye me-2"></i>
              Prévisualiser
            </Button>
          </Col>
          <Col lg={2}>
            <Button
              variant="outline-primary"
              type="submit"
              className="w-100"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Création...
                </>
              ) : (
                "Créer l'article"
              )}
            </Button>
          </Col>
          <Col lg={2}>
            <Button
              variant="danger"
              className="w-100"
              onClick={() => router.push("/dashboard/post")}
              disabled={isLoading}
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
          author: {
            name: "Vous",
          },
          category: categoriesData?.categories.find(
            (c) => c._id === watch("categoryId"),
          ),
        }}
      />
    </form>
  );
};

export default CreatePost;
