'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useTopbarContext } from '@/context/useTopbarContext';
import {
  Card,
  CardBody,
  Row,
  Col,
  Form,
  Button,
  Alert,
  Badge,
  Modal,
  Table
} from 'react-bootstrap';
import IconifyIcon from '@/components/dashboard/wrappers/IconifyIcon';
import DropzoneImageUpload from '@/components/dashboard/DropzoneImageUpload';

interface DrinkCategory {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  order: number;
  isActive: boolean;
  showOnSite: boolean;
}

interface Drink {
  _id: string;
  name: string;
  description?: string;
  recipe?: string;
  image?: string;
  category: { _id: string; name: string; slug: string };
  order: number;
  isActive: boolean;
}

export default function DrinksPage() {
  const { setPageTitle, setPageActions } = useTopbarContext();
  const { data: session } = useSession();
  const userRole = session?.user?.role?.slug;
  const canEdit = userRole === 'dev' || userRole === 'admin';
  const isStaff = userRole === 'staff';

  const [categories, setCategories] = useState<DrinkCategory[]>([]);
  const [drinks, setDrinks] = useState<Drink[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Staff view states
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Modal states
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showDrinkModal, setShowDrinkModal] = useState(false);
  const [showRecipeModal, setShowRecipeModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<DrinkCategory | null>(null);
  const [editingDrink, setEditingDrink] = useState<Drink | null>(null);
  const [selectedDrink, setSelectedDrink] = useState<Drink | null>(null);

  // Form states
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: ''
  });
  const [drinkForm, setDrinkForm] = useState({
    name: '',
    description: '',
    recipe: '',
    image: '',
    category: ''
  });

  const [saving, setSaving] = useState(false);

  const openNewCategory = () => {
    setEditingCategory(null);
    setCategoryForm({ name: '', description: '' });
    setShowCategoryModal(true);
  };

  const openNewDrink = (categoryId?: string) => {
    setEditingDrink(null);
    setDrinkForm({
      name: '',
      description: '',
      recipe: '',
      image: '',
      category: categoryId || (categories.length > 0 ? categories[0]._id : '')
    });
    setShowDrinkModal(true);
  };

  useEffect(() => {
    setPageTitle(isStaff ? 'Produits' : 'Gestion des boissons');

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
            onClick={() => openNewDrink()}
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
            Nouvelle boisson
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
      const res = await fetch('/api/admin/drinks');
      if (!res.ok) throw new Error('Erreur lors du chargement');
      const data = await res.json();
      setCategories(data.categories);
      setDrinks(data.drinks);
    } catch (err) {
      setMessage({ type: 'error', text: 'Erreur lors du chargement des données' });
    } finally {
      setLoading(false);
    }
  };

  // Category handlers
  const handleSaveCategory = async () => {
    if (!categoryForm.name.trim()) return;
    setSaving(true);

    try {
      const url = editingCategory
        ? `/api/admin/drinks/categories/${editingCategory._id}`
        : '/api/admin/drinks/categories';

      const res = await fetch(url, {
        method: editingCategory ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoryForm)
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Erreur');
      }

      setMessage({ type: 'success', text: editingCategory ? 'Catégorie mise à jour' : 'Catégorie créée' });
      setShowCategoryModal(false);
      setCategoryForm({ name: '', description: '' });
      setEditingCategory(null);
      fetchData();
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Erreur' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Supprimer cette catégorie ?')) return;

    try {
      const res = await fetch(`/api/admin/drinks/categories/${id}`, {
        method: 'DELETE'
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Erreur');
      }

      setMessage({ type: 'success', text: 'Catégorie supprimée' });
      fetchData();
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Erreur' });
    }
  };

  const handleToggleShowOnSite = async (id: string, currentValue: boolean) => {
    try {
      const res = await fetch(`/api/admin/drinks/categories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ showOnSite: !currentValue })
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Erreur');
      }

      setMessage({
        type: 'success',
        text: !currentValue ? 'Catégorie visible sur le site' : 'Catégorie masquée du site'
      });
      fetchData();
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Erreur' });
    }
  };

  const handleReorderCategory = async (categoryId: string, direction: 'up' | 'down') => {
    const sortedCategories = [...categories].sort((a, b) => a.order - b.order);
    const currentIndex = sortedCategories.findIndex(c => c._id === categoryId);

    if (currentIndex === -1) return;
    if (direction === 'up' && currentIndex === 0) return;
    if (direction === 'down' && currentIndex === sortedCategories.length - 1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const currentCategory = sortedCategories[currentIndex];
    const swapCategory = sortedCategories[newIndex];

    try {
      // Swap orders
      await Promise.all([
        fetch(`/api/admin/drinks/categories/${currentCategory._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order: swapCategory.order })
        }),
        fetch(`/api/admin/drinks/categories/${swapCategory._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order: currentCategory.order })
        })
      ]);

      fetchData();
    } catch (err) {
      setMessage({ type: 'error', text: 'Erreur lors du réarrangement' });
    }
  };

  // Drink handlers
  const handleSaveDrink = async () => {
    if (!drinkForm.name.trim() || !drinkForm.category) return;
    setSaving(true);

    try {
      const url = editingDrink
        ? `/api/admin/drinks/${editingDrink._id}`
        : '/api/admin/drinks';

      const res = await fetch(url, {
        method: editingDrink ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(drinkForm)
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Erreur');
      }

      setMessage({ type: 'success', text: editingDrink ? 'Boisson mise à jour' : 'Boisson créée' });
      setShowDrinkModal(false);
      setDrinkForm({ name: '', description: '', recipe: '', image: '', category: '' });
      setEditingDrink(null);
      fetchData();
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Erreur' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteDrink = async (id: string) => {
    if (!confirm('Supprimer cette boisson ?')) return;

    try {
      const res = await fetch(`/api/admin/drinks/${id}`, {
        method: 'DELETE'
      });

      if (!res.ok) throw new Error('Erreur lors de la suppression');

      setMessage({ type: 'success', text: 'Boisson supprimée' });
      fetchData();
    } catch (err) {
      setMessage({ type: 'error', text: 'Erreur lors de la suppression' });
    }
  };

  const openEditCategory = (category: DrinkCategory) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name,
      description: category.description || ''
    });
    setShowCategoryModal(true);
  };

  const openEditDrink = (drink: Drink) => {
    setEditingDrink(drink);
    setDrinkForm({
      name: drink.name,
      description: drink.description || '',
      recipe: drink.recipe || '',
      image: drink.image || '',
      category: drink.category._id
    });
    setShowDrinkModal(true);
  };

  const openRecipeModal = (drink: Drink) => {
    setSelectedDrink(drink);
    setShowRecipeModal(true);
  };

  const formatRecipe = (recipe: string) => {
    return recipe.split('\n').filter(line => line.trim()).map((line, index) => (
      <li key={index} className="mb-2">
        {line.replace(/^[•\-\*]\s*/, '')}
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
  const filteredDrinks = selectedCategory
    ? drinks.filter(d => d.category._id === selectedCategory)
    : drinks;

  return (
    <>
      {message && (
        <Alert
          variant={message.type === 'success' ? 'success' : 'danger'}
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
                    variant={viewMode === 'grid' ? 'primary' : 'outline-secondary'}
                    size="sm"
                    className="me-1"
                    onClick={() => setViewMode('grid')}
                  >
                    <IconifyIcon icon="ri:grid-fill" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'primary' : 'outline-secondary'}
                    size="sm"
                    onClick={() => setViewMode('list')}
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
                      cursor: 'pointer',
                      padding: '15px',
                      borderRadius: '10px',
                      backgroundColor: !selectedCategory ? '#0d6efd' : '#f8f9fa',
                      color: !selectedCategory ? '#fff' : '#333',
                      textAlign: 'center',
                      transition: 'all 0.2s ease',
                      border: '2px solid',
                      borderColor: !selectedCategory ? '#0d6efd' : '#dee2e6'
                    }}
                  >
                    <IconifyIcon icon="ri:apps-line" style={{ fontSize: '1.5rem' }} />
                    <div className="mt-2 fw-semibold" style={{ fontSize: '0.85rem' }}>Tous</div>
                    <Badge bg={!selectedCategory ? 'light' : 'secondary'} text={!selectedCategory ? 'dark' : undefined} className="mt-1">
                      {drinks.length}
                    </Badge>
                  </div>
                </Col>
                {categories.map(category => (
                  <Col key={category._id} xs={6} sm={4} md={3} lg={2} className="mb-3">
                    <div
                      onClick={() => setSelectedCategory(category._id)}
                      style={{
                        cursor: 'pointer',
                        padding: '15px',
                        borderRadius: '10px',
                        backgroundColor: selectedCategory === category._id ? '#0d6efd' : '#f8f9fa',
                        color: selectedCategory === category._id ? '#fff' : '#333',
                        textAlign: 'center',
                        transition: 'all 0.2s ease',
                        border: '2px solid',
                        borderColor: selectedCategory === category._id ? '#0d6efd' : '#dee2e6'
                      }}
                    >
                      <IconifyIcon icon="ri:cup-line" style={{ fontSize: '1.5rem' }} />
                      <div className="mt-2 fw-semibold" style={{ fontSize: '0.85rem' }}>{category.name}</div>
                      <Badge bg={selectedCategory === category._id ? 'light' : 'secondary'} text={selectedCategory === category._id ? 'dark' : undefined} className="mt-1">
                        {drinks.filter(d => d.category._id === category._id).length}
                      </Badge>
                    </div>
                  </Col>
                ))}
              </Row>
            </CardBody>
          </Card>

          {/* Products Display */}
          {filteredDrinks.length === 0 ? (
            <Card>
              <CardBody className="text-center py-5">
                <p className="text-muted mb-0">Aucun produit dans cette catégorie</p>
              </CardBody>
            </Card>
          ) : viewMode === 'grid' ? (
            /* Grid View */
            <Row>
              {filteredDrinks.map(drink => (
                <Col key={drink._id} xs={6} sm={4} md={3} lg={2} className="mb-4">
                  <Card
                    className="h-100"
                    style={{ cursor: 'pointer' }}
                    onClick={() => openRecipeModal(drink)}
                  >
                    {drink.image ? (
                      <Card.Img
                        variant="top"
                        src={drink.image}
                        style={{ height: '120px', objectFit: 'cover' }}
                      />
                    ) : (
                      <div
                        style={{
                          height: '120px',
                          backgroundColor: '#f0f0f0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <IconifyIcon icon="ri:cup-line" style={{ fontSize: '2rem' }} className="text-muted" />
                      </div>
                    )}
                    <CardBody className="p-2">
                      <h6 className="mb-1" style={{ fontSize: '0.85rem' }}>{drink.name}</h6>
                      {drink.recipe && (
                        <Badge bg="info" style={{ fontSize: '0.65rem' }}>
                          <IconifyIcon icon="ri:file-list-3-line" className="me-1" />
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
                      <th style={{ width: '60px' }}>Image</th>
                      <th>Nom</th>
                      <th>Catégorie</th>
                      <th style={{ width: '100px' }}>Recette</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDrinks.map(drink => (
                      <tr
                        key={drink._id}
                        style={{ cursor: 'pointer' }}
                        onClick={() => openRecipeModal(drink)}
                      >
                        <td>
                          {drink.image ? (
                            <img
                              src={drink.image}
                              alt={drink.name}
                              style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '6px' }}
                            />
                          ) : (
                            <div
                              style={{
                                width: '40px',
                                height: '40px',
                                backgroundColor: '#f0f0f0',
                                borderRadius: '6px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            >
                              <IconifyIcon icon="ri:cup-line" className="text-muted" />
                            </div>
                          )}
                        </td>
                        <td className="align-middle">{drink.name}</td>
                        <td className="align-middle text-muted">{drink.category.name}</td>
                        <td className="align-middle">
                          {drink.recipe ? (
                            <Badge bg="info">
                              <IconifyIcon icon="ri:file-list-3-line" className="me-1" />
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
                  Aucune catégorie créée. {canEdit && 'Commencez par créer une catégorie.'}
                </p>
              </CardBody>
            </Card>
          ) : (
            categories.sort((a, b) => a.order - b.order).map((category, index) => (
              <Card key={category._id} className="mb-4">
                <CardBody>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div className="d-flex align-items-center gap-2">
                      {canEdit && (
                        <div className="d-flex flex-column me-2">
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            style={{ padding: '2px 6px', fontSize: '0.75rem', lineHeight: 1 }}
                            onClick={() => handleReorderCategory(category._id, 'up')}
                            disabled={index === 0}
                          >
                            <IconifyIcon icon="ri:arrow-up-s-line" />
                          </Button>
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            style={{ padding: '2px 6px', fontSize: '0.75rem', lineHeight: 1, marginTop: '2px' }}
                            onClick={() => handleReorderCategory(category._id, 'down')}
                            disabled={index === categories.length - 1}
                          >
                            <IconifyIcon icon="ri:arrow-down-s-line" />
                          </Button>
                        </div>
                      )}
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
                          onClick={() => openNewDrink(category._id)}
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
                  {drinks.filter(d => d.category._id === category._id).length === 0 ? (
                    <p className="text-muted mb-0">Aucune boisson dans cette catégorie</p>
                  ) : (
                    <Table hover responsive>
                      <thead>
                        <tr>
                          <th style={{ width: '80px' }}>Image</th>
                          <th>Nom</th>
                          <th>Description</th>
                          <th style={{ width: '100px' }}>Recette</th>
                          {canEdit && <th style={{ width: '120px' }}>Actions</th>}
                        </tr>
                      </thead>
                      <tbody>
                        {drinks
                          .filter(d => d.category._id === category._id)
                          .map(drink => (
                            <tr key={drink._id}>
                              <td>
                                {drink.image ? (
                                  <img
                                    src={drink.image}
                                    alt={drink.name}
                                    style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '8px' }}
                                  />
                                ) : (
                                  <div
                                    style={{
                                      width: '50px',
                                      height: '50px',
                                      backgroundColor: '#f0f0f0',
                                      borderRadius: '8px',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center'
                                    }}
                                  >
                                    <IconifyIcon icon="ri:image-line" className="text-muted" />
                                  </div>
                                )}
                              </td>
                              <td className="align-middle">
                                {drink.name}
                                {!drink.isActive && (
                                  <Badge bg="secondary" className="ms-2">Inactif</Badge>
                                )}
                              </td>
                              <td className="align-middle text-muted">
                                {drink.description || '-'}
                              </td>
                              <td className="align-middle">
                                {drink.recipe ? (
                                  <Button
                                    variant="outline-info"
                                    size="sm"
                                    onClick={() => openRecipeModal(drink)}
                                  >
                                    <IconifyIcon icon="ri:file-list-3-line" className="me-1" />
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
                                    onClick={() => openEditDrink(drink)}
                                  >
                                    <IconifyIcon icon="ri:edit-line" />
                                  </Button>
                                  <Button
                                    variant="outline-danger"
                                    size="sm"
                                    onClick={() => handleDeleteDrink(drink._id)}
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
      <Modal show={showCategoryModal} onHide={() => setShowCategoryModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {editingCategory ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Nom de la catégorie</Form.Label>
            <Form.Control
              type="text"
              value={categoryForm.name}
              onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
              placeholder="Ex: Boissons chaudes"
            />
          </Form.Group>

          <Form.Group>
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              value={categoryForm.description}
              onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
              placeholder="Description de la catégorie (affichée sur le site)"
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCategoryModal(false)}>
            Annuler
          </Button>
          <Button variant="primary" onClick={handleSaveCategory} disabled={saving}>
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal Boisson */}
      <Modal show={showDrinkModal} onHide={() => setShowDrinkModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {editingDrink ? 'Modifier la boisson' : 'Nouvelle boisson'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Catégorie *</Form.Label>
            <Form.Select
              value={drinkForm.category}
              onChange={(e) => setDrinkForm({ ...drinkForm, category: e.target.value })}
            >
              <option value="">Sélectionner une catégorie</option>
              {categories.map(cat => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Nom *</Form.Label>
            <Form.Control
              type="text"
              value={drinkForm.name}
              onChange={(e) => setDrinkForm({ ...drinkForm, name: e.target.value })}
              placeholder="Ex: Cappuccino"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              value={drinkForm.description}
              onChange={(e) => setDrinkForm({ ...drinkForm, description: e.target.value })}
              placeholder="Description de la boisson..."
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Recette / Confection</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              value={drinkForm.recipe}
              onChange={(e) => setDrinkForm({ ...drinkForm, recipe: e.target.value })}
              placeholder="• Étape 1&#10;• Étape 2&#10;• Étape 3..."
            />
            <Form.Text className="text-muted">
              Utilisez des puces (•) ou tirets (-) pour lister les étapes
            </Form.Text>
          </Form.Group>

          <DropzoneImageUpload
            onImageUpload={(url) => setDrinkForm({ ...drinkForm, image: url })}
            currentImage={drinkForm.image}
            label="Image de la boisson"
            folder="drinks"
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDrinkModal(false)}>
            Annuler
          </Button>
          <Button variant="primary" onClick={handleSaveDrink} disabled={saving}>
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal Recette */}
      <Modal show={showRecipeModal} onHide={() => setShowRecipeModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedDrink && (
              <div className="d-flex align-items-center gap-3">
                {selectedDrink.image && (
                  <img
                    src={selectedDrink.image}
                    alt={selectedDrink.name}
                    style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '8px' }}
                  />
                )}
                <span>{selectedDrink.name}</span>
              </div>
            )}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedDrink?.description && (
            <div className="mb-3">
              <h6 className="text-muted mb-2">Description</h6>
              <p>{selectedDrink.description}</p>
            </div>
          )}
          <div>
            <h6 className="text-muted mb-2">Recette / Confection</h6>
            {selectedDrink?.recipe ? (
              <ul className="list-unstyled mb-0" style={{ fontSize: '1rem', lineHeight: '1.6' }}>
                {formatRecipe(selectedDrink.recipe)}
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
