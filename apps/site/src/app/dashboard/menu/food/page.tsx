"use client";

import { useTopbarContext } from "@/context/useTopbarContext";
import DropzoneImageUpload from "@/components/dashboard/DropzoneImageUpload";
import IconifyIcon from "@/components/dashboard/wrappers/IconifyIcon";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Card,
  CardBody,
  Col,
  Form,
  Modal,
  Row,
  Table,
} from "react-bootstrap";

interface FoodCategory {
  _id: string;
  name: string;
  slug: string;
  order: number;
  isActive: boolean;
  showOnSite: boolean;
}

interface Food {
  _id: string;
  name: string;
  description?: string;
  recipe?: string;
  image?: string;
  category: { _id: string; name: string; slug: string };
  order: number;
  isActive: boolean;
}

export default function FoodsPage() {
  const { setPageTitle, setPageActions } = useTopbarContext();
  const { data: session } = useSession();
  const userRole = session?.user?.role?.slug;
  const canEdit = userRole === "dev" || userRole === "admin";
  const isStaff = userRole === "staff";

  const [categories, setCategories] = useState<FoodCategory[]>([]);
  const [foods, setFoods] = useState<Food[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Staff view states
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Modal states
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showFoodModal, setShowFoodModal] = useState(false);
  const [showRecipeModal, setShowRecipeModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<FoodCategory | null>(
    null
  );
  const [editingFood, setEditingFood] = useState<Food | null>(null);
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);

  // Form states
  const [categoryName, setCategoryName] = useState("");
  const [foodForm, setFoodForm] = useState({
    name: "",
    description: "",
    recipe: "",
    image: "",
    category: "",
  });

  const [saving, setSaving] = useState(false);

  const openNewCategory = () => {
    setEditingCategory(null);
    setCategoryName("");
    setShowCategoryModal(true);
  };

  const openNewFood = (categoryId?: string) => {
    setEditingFood(null);
    setFoodForm({
      name: "",
      description: "",
      recipe: "",
      image: "",
      category: categoryId || (categories.length > 0 ? categories[0]._id : ""),
    });
    setShowFoodModal(true);
  };

  useEffect(() => {
    setPageTitle(isStaff ? 'Produits alimentaires' : 'Gestion des produits alimentaires');

    if (canEdit) {
      setPageActions(
        <>
          <button
            onClick={openNewCategory}
            style={{
              padding: '8px 16px',
              background: '#667eea',
              border: '1px solid #667eea',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 500,
              color: 'white',
              cursor: 'pointer',
              transition: 'all 0.3s',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#5568d3';
              e.currentTarget.style.borderColor = '#5568d3';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#667eea';
              e.currentTarget.style.borderColor = '#667eea';
            }}
          >
            <IconifyIcon icon="ri:add-line" />
            Nouvelle catégorie
          </button>
          <button
            onClick={() => openNewFood()}
            disabled={categories.length === 0}
            style={{
              padding: '8px 16px',
              background: categories.length === 0 ? '#e5e7eb' : '#14b8a6',
              border: `1px solid ${categories.length === 0 ? '#e5e7eb' : '#14b8a6'}`,
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 500,
              color: categories.length === 0 ? '#9ca3af' : 'white',
              cursor: categories.length === 0 ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginLeft: '8px',
            }}
            onMouseEnter={(e) => {
              if (categories.length > 0) {
                e.currentTarget.style.background = '#0d9488';
                e.currentTarget.style.borderColor = '#0d9488';
              }
            }}
            onMouseLeave={(e) => {
              if (categories.length > 0) {
                e.currentTarget.style.background = '#14b8a6';
                e.currentTarget.style.borderColor = '#14b8a6';
              }
            }}
          >
            <IconifyIcon icon="ri:add-line" />
            Nouveau produit
          </button>
        </>
      );
    } else {
      setPageActions(null);
    }

    return () => {
      setPageTitle('Dashboard');
      setPageActions(null);
    };
  }, [setPageTitle, setPageActions, isStaff, canEdit, categories.length]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/admin/drinks?type=food");
      if (!res.ok) throw new Error("Erreur lors du chargement");
      const data = await res.json();
      setCategories(data.categories);
      setFoods(data.drinks);
    } catch (err) {
      setMessage({
        type: "error",
        text: "Erreur lors du chargement des données",
      });
    } finally {
      setLoading(false);
    }
  };

  // Category handlers
  const handleSaveCategory = async () => {
    if (!categoryName.trim()) return;
    setSaving(true);

    try {
      const url = editingCategory
        ? `/api/admin/drinks/categories/${editingCategory._id}`
        : "/api/admin/drinks/categories";

      const res = await fetch(url, {
        method: editingCategory ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: categoryName, type: 'food' }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Erreur");
      }

      setMessage({
        type: "success",
        text: editingCategory ? "Catégorie mise à jour" : "Catégorie créée",
      });
      setShowCategoryModal(false);
      setCategoryName("");
      setEditingCategory(null);
      fetchData();
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Erreur",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm("Supprimer cette catégorie ?")) return;

    try {
      const res = await fetch(`/api/admin/drinks/categories/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Erreur");
      }

      setMessage({ type: "success", text: "Catégorie supprimée" });
      fetchData();
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Erreur",
      });
    }
  };

  const handleToggleShowOnSite = async (id: string, currentValue: boolean) => {
    try {
      const res = await fetch(`/api/admin/drinks/categories/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ showOnSite: !currentValue }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Erreur");
      }

      setMessage({
        type: "success",
        text: !currentValue
          ? "Catégorie visible sur le site"
          : "Catégorie masquée du site",
      });
      fetchData();
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Erreur",
      });
    }
  };

  // Drink handlers
  const handleSaveFood = async () => {
    if (!foodForm.name.trim() || !foodForm.category) return;
    setSaving(true);

    try {
      const url = editingFood
        ? `/api/admin/drinks/${editingFood._id}`
        : "/api/admin/drinks";

      const res = await fetch(url, {
        method: editingFood ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...foodForm, type: 'food' }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Erreur");
      }

      setMessage({
        type: "success",
        text: editingFood ? "Produit mis à jour" : "Produit créé",
      });
      setShowFoodModal(false);
      setFoodForm({
        name: "",
        description: "",
        recipe: "",
        image: "",
        category: "",
      });
      setEditingFood(null);
      fetchData();
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Erreur",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteFood = async (id: string) => {
    if (!confirm("Supprimer ce produit ?")) return;

    try {
      const res = await fetch(`/api/admin/drinks/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Erreur lors de la suppression");

      setMessage({ type: "success", text: "Produit supprimé" });
      fetchData();
    } catch (err) {
      setMessage({ type: "error", text: "Erreur lors de la suppression" });
    }
  };

  const openEditCategory = (category: FoodCategory) => {
    setEditingCategory(category);
    setCategoryName(category.name);
    setShowCategoryModal(true);
  };

  const openEditFood = (food: Food) => {
    setEditingFood(food);
    setFoodForm({
      name: food.name,
      description: food.description || "",
      recipe: food.recipe || "",
      image: food.image || "",
      category: food.category._id,
    });
    setShowFoodModal(true);
  };

  const openRecipeModal = (food: Food) => {
    setSelectedFood(food);
    setShowRecipeModal(true);
  };

  const formatRecipe = (recipe: string) => {
    return recipe
      .split("\n")
      .filter((line) => line.trim())
      .map((line, index) => (
        <li key={index} className="mb-2">
          {line.replace(/^[•\-\*]\s*/, "")}
        </li>
      ));
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
      </div>
    );
  }

  // Get filtered drinks for staff view
  const filteredFoods = selectedCategory
    ? foods.filter((d) => d.category._id === selectedCategory)
    : foods;

  return (
    <>
      {message && (
        <Alert
          variant={message.type === "success" ? "success" : "danger"}
          dismissible
          onClose={() => setMessage(null)}
        >
          {message.text}
        </Alert>
      )}

      {/* Staff View */}
      {isStaff ? (
        <>
          {/* Category Tabs */}
          <Card className="mb-4">
            <CardBody>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0">Catégories</h5>
                <div>
                  <Button
                    variant={
                      viewMode === "grid" ? "primary" : "outline-secondary"
                    }
                    size="sm"
                    className="me-1"
                    onClick={() => setViewMode("grid")}
                  >
                    <IconifyIcon icon="ri:grid-fill" />
                  </Button>
                  <Button
                    variant={
                      viewMode === "list" ? "primary" : "outline-secondary"
                    }
                    size="sm"
                    onClick={() => setViewMode("list")}
                  >
                    <IconifyIcon icon="ri:list-check" />
                  </Button>
                </div>
              </div>
              <Row>
                <Col xs={6} sm={4} md={3} lg={2} className="mb-3">
                  <div
                    onClick={() => setSelectedCategory(null)}
                    style={{
                      cursor: "pointer",
                      padding: "15px",
                      borderRadius: "10px",
                      backgroundColor: !selectedCategory
                        ? "#0d6efd"
                        : "#f8f9fa",
                      color: !selectedCategory ? "#fff" : "#333",
                      textAlign: "center",
                      transition: "all 0.2s ease",
                      border: "2px solid",
                      borderColor: !selectedCategory ? "#0d6efd" : "#dee2e6",
                    }}
                  >
                    <IconifyIcon
                      icon="ri:apps-line"
                      style={{ fontSize: "1.5rem" }}
                    />
                    <div
                      className="mt-2 fw-semibold"
                      style={{ fontSize: "0.85rem" }}
                    >
                      Tous
                    </div>
                    <Badge
                      bg={!selectedCategory ? "light" : "secondary"}
                      text={!selectedCategory ? "dark" : undefined}
                      className="mt-1"
                    >
                      {foods.length}
                    </Badge>
                  </div>
                </Col>
                {categories.map((category) => (
                  <Col
                    key={category._id}
                    xs={6}
                    sm={4}
                    md={3}
                    lg={2}
                    className="mb-3"
                  >
                    <div
                      onClick={() => setSelectedCategory(category._id)}
                      style={{
                        cursor: "pointer",
                        padding: "15px",
                        borderRadius: "10px",
                        backgroundColor:
                          selectedCategory === category._id
                            ? "#0d6efd"
                            : "#f8f9fa",
                        color:
                          selectedCategory === category._id ? "#fff" : "#333",
                        textAlign: "center",
                        transition: "all 0.2s ease",
                        border: "2px solid",
                        borderColor:
                          selectedCategory === category._id
                            ? "#0d6efd"
                            : "#dee2e6",
                      }}
                    >
                      <IconifyIcon
                        icon="ri:cup-line"
                        style={{ fontSize: "1.5rem" }}
                      />
                      <div
                        className="mt-2 fw-semibold"
                        style={{ fontSize: "0.85rem" }}
                      >
                        {category.name}
                      </div>
                      <Badge
                        bg={
                          selectedCategory === category._id
                            ? "light"
                            : "secondary"
                        }
                        text={
                          selectedCategory === category._id ? "dark" : undefined
                        }
                        className="mt-1"
                      >
                        {
                          foods.filter((d) => d.category._id === category._id)
                            .length
                        }
                      </Badge>
                    </div>
                  </Col>
                ))}
              </Row>
            </CardBody>
          </Card>

          {/* Products Display */}
          {filteredFoods.length === 0 ? (
            <Card>
              <CardBody className="text-center py-5">
                <p className="text-muted mb-0">
                  Aucun produit dans cette catégorie
                </p>
              </CardBody>
            </Card>
          ) : viewMode === "grid" ? (
            /* Grid View */
            <Row>
              {filteredFoods.map((food) => (
                <Col
                  key={food._id}
                  xs={6}
                  sm={4}
                  md={3}
                  lg={2}
                  className="mb-4"
                >
                  <Card
                    className="h-100"
                    style={{ cursor: "pointer" }}
                    onClick={() => openRecipeModal(food)}
                  >
                    {food.image ? (
                      <Card.Img
                        variant="top"
                        src={food.image}
                        style={{ height: "120px", objectFit: "cover" }}
                      />
                    ) : (
                      <div
                        style={{
                          height: "120px",
                          backgroundColor: "#f0f0f0",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <IconifyIcon
                          icon="ri:cup-line"
                          style={{ fontSize: "2rem" }}
                          className="text-muted"
                        />
                      </div>
                    )}
                    <CardBody className="p-2">
                      <h6 className="mb-1" style={{ fontSize: "0.85rem" }}>
                        {food.name}
                      </h6>
                      {food.recipe && (
                        <Badge bg="info" style={{ fontSize: "0.65rem" }}>
                          <IconifyIcon
                            icon="ri:file-list-3-line"
                            className="me-1"
                          />
                          Recette
                        </Badge>
                      )}
                    </CardBody>
                  </Card>
                </Col>
              ))}
            </Row>
          ) : (
            /* List View */
            <Card>
              <CardBody>
                <Table hover responsive>
                  <thead>
                    <tr>
                      <th style={{ width: "60px" }}>Image</th>
                      <th>Nom</th>
                      <th>Catégorie</th>
                      <th style={{ width: "100px" }}>Recette</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredFoods.map((food) => (
                      <tr
                        key={food._id}
                        style={{ cursor: "pointer" }}
                        onClick={() => openRecipeModal(food)}
                      >
                        <td>
                          {food.image ? (
                            <img
                              src={food.image}
                              alt={food.name}
                              style={{
                                width: "40px",
                                height: "40px",
                                objectFit: "cover",
                                borderRadius: "6px",
                              }}
                            />
                          ) : (
                            <div
                              style={{
                                width: "40px",
                                height: "40px",
                                backgroundColor: "#f0f0f0",
                                borderRadius: "6px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <IconifyIcon
                                icon="ri:cup-line"
                                className="text-muted"
                              />
                            </div>
                          )}
                        </td>
                        <td className="align-middle">{food.name}</td>
                        <td className="align-middle text-muted">
                          {food.category.name}
                        </td>
                        <td className="align-middle">
                          {food.recipe ? (
                            <Badge bg="info">
                              <IconifyIcon
                                icon="ri:file-list-3-line"
                                className="me-1"
                              />
                              Recette
                            </Badge>
                          ) : (
                            <span className="text-muted">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </CardBody>
            </Card>
          )}
        </>
      ) : (
        /* Admin/Dev View */
        <>
          {categories.length === 0 ? (
            <Card>
              <CardBody className="text-center py-5">
                <p className="text-muted mb-0">
                  Aucune catégorie créée.{" "}
                  {canEdit && "Commencez par créer une catégorie."}
                </p>
              </CardBody>
            </Card>
          ) : (
            categories.map((category) => (
              <Card key={category._id} className="mb-4">
                <CardBody>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div className="d-flex align-items-center gap-2">
                      <h5 className="mb-0">{category.name}</h5>
                      {!category.isActive && (
                        <Badge bg="secondary">Inactif</Badge>
                      )}
                      {canEdit && (
                        <Form.Check
                          type="switch"
                          id={`showOnSite-${category._id}`}
                          label={<small className="text-muted">Afficher sur le site</small>}
                          checked={category.showOnSite !== false}
                          onChange={() => handleToggleShowOnSite(category._id, category.showOnSite !== false)}
                          className="ms-3"
                        />
                      )}
                    </div>
                    {canEdit && (
                      <div>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          className="me-2"
                          onClick={() => openNewFood(category._id)}
                        >
                          <IconifyIcon icon="ri:add-line" />
                        </Button>
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          className="me-2"
                          onClick={() => openEditCategory(category)}
                        >
                          <IconifyIcon icon="ri:edit-line" />
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleDeleteCategory(category._id)}
                        >
                          <IconifyIcon icon="ri:delete-bin-line" />
                        </Button>
                      </div>
                    )}
                  </div>
                  {foods.filter((d) => d.category._id === category._id)
                    .length === 0 ? (
                    <p className="text-muted mb-0">
                      Aucun produit dans cette catégorie
                    </p>
                  ) : (
                    <Table hover responsive>
                      <thead>
                        <tr>
                          <th style={{ width: "80px" }}>Image</th>
                          <th>Nom</th>
                          <th>Description</th>
                          <th style={{ width: "100px" }}>Recette</th>
                          {canEdit && (
                            <th style={{ width: "120px" }}>Actions</th>
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {foods
                          .filter((d) => d.category._id === category._id)
                          .map((food) => (
                            <tr key={food._id}>
                              <td>
                                {food.image ? (
                                  <img
                                    src={food.image}
                                    alt={food.name}
                                    style={{
                                      width: "50px",
                                      height: "50px",
                                      objectFit: "cover",
                                      borderRadius: "8px",
                                    }}
                                  />
                                ) : (
                                  <div
                                    style={{
                                      width: "50px",
                                      height: "50px",
                                      backgroundColor: "#f0f0f0",
                                      borderRadius: "8px",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                    }}
                                  >
                                    <IconifyIcon
                                      icon="ri:image-line"
                                      className="text-muted"
                                    />
                                  </div>
                                )}
                              </td>
                              <td className="align-middle">
                                {food.name}
                                {!food.isActive && (
                                  <Badge bg="secondary" className="ms-2">
                                    Inactif
                                  </Badge>
                                )}
                              </td>
                              <td className="align-middle text-muted">
                                {food.description || "-"}
                              </td>
                              <td className="align-middle">
                                {food.recipe ? (
                                  <Button
                                    variant="outline-info"
                                    size="sm"
                                    onClick={() => openRecipeModal(food)}
                                  >
                                    <IconifyIcon
                                      icon="ri:file-list-3-line"
                                      className="me-1"
                                    />
                                    Voir
                                  </Button>
                                ) : (
                                  <span className="text-muted">-</span>
                                )}
                              </td>
                              {canEdit && (
                                <td className="align-middle">
                                  <Button
                                    variant="outline-secondary"
                                    size="sm"
                                    className="me-1"
                                    onClick={() => openEditFood(food)}
                                  >
                                    <IconifyIcon icon="ri:edit-line" />
                                  </Button>
                                  <Button
                                    variant="outline-danger"
                                    size="sm"
                                    onClick={() => handleDeleteFood(food._id)}
                                  >
                                    <IconifyIcon icon="ri:delete-bin-line" />
                                  </Button>
                                </td>
                              )}
                            </tr>
                          ))}
                      </tbody>
                    </Table>
                  )}
                </CardBody>
              </Card>
            ))
          )}
        </>
      )}

      {/* Modal Catégorie */}
      <Modal
        show={showCategoryModal}
        onHide={() => setShowCategoryModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {editingCategory ? "Modifier la catégorie" : "Nouvelle catégorie"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Nom de la catégorie</Form.Label>
            <Form.Control
              type="text"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              placeholder="Ex: Boissons chaudes"
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowCategoryModal(false)}
          >
            Annuler
          </Button>
          <Button
            variant="primary"
            onClick={handleSaveCategory}
            disabled={saving}
          >
            {saving ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal Boisson */}
      <Modal show={showFoodModal} onHide={() => setShowFoodModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {editingFood ? "Modifier le produit" : "Nouveau produit"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Catégorie *</Form.Label>
            <Form.Select
              value={foodForm.category}
              onChange={(e) =>
                setFoodForm({ ...foodForm, category: e.target.value })
              }
            >
              <option value="">Sélectionner une catégorie</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Nom *</Form.Label>
            <Form.Control
              type="text"
              value={foodForm.name}
              onChange={(e) =>
                setFoodForm({ ...foodForm, name: e.target.value })
              }
              placeholder="Ex: Cappuccino"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              value={foodForm.description}
              onChange={(e) =>
                setFoodForm({ ...foodForm, description: e.target.value })
              }
              placeholder="Description du produit..."
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Recette / Confection</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              value={foodForm.recipe}
              onChange={(e) =>
                setFoodForm({ ...foodForm, recipe: e.target.value })
              }
              placeholder="• Étape 1&#10;• Étape 2&#10;• Étape 3..."
            />
            <Form.Text className="text-muted">
              Utilisez des puces (•) ou tirets (-) pour lister les étapes
            </Form.Text>
          </Form.Group>

          <DropzoneImageUpload
            onImageUpload={(url) => setFoodForm({ ...foodForm, image: url })}
            currentImage={foodForm.image}
            label="Image du produit"
            folder="foods"
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowFoodModal(false)}>
            Annuler
          </Button>
          <Button variant="primary" onClick={handleSaveFood} disabled={saving}>
            {saving ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal Recette */}
      <Modal
        show={showRecipeModal}
        onHide={() => setShowRecipeModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedFood && (
              <div className="d-flex align-items-center gap-3">
                {selectedFood.image && (
                  <img
                    src={selectedFood.image}
                    alt={selectedFood.name}
                    style={{
                      width: "40px",
                      height: "40px",
                      objectFit: "cover",
                      borderRadius: "8px",
                    }}
                  />
                )}
                <span>{selectedFood.name}</span>
              </div>
            )}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedFood?.description && (
            <div className="mb-3">
              <h6 className="text-muted mb-2">Description</h6>
              <p>{selectedFood.description}</p>
            </div>
          )}
          <div>
            <h6 className="text-muted mb-2">Recette / Confection</h6>
            {selectedFood?.recipe ? (
              <ul
                className="list-unstyled mb-0"
                style={{ fontSize: "1rem", lineHeight: "1.6" }}
              >
                {formatRecipe(selectedFood.recipe)}
              </ul>
            ) : (
              <p className="text-muted mb-0">Aucune recette disponible.</p>
            )}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRecipeModal(false)}>
            Fermer
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
