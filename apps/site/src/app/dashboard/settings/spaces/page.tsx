"use client";

import { useEffect, useState } from "react";
import { Card, Button, Form, Row, Col, Nav, Tab, Alert, Table, Badge, Modal } from "react-bootstrap";
import { Icon } from "@iconify/react";
import { useTopbarContext } from "@/context/useTopbarContext";

interface PricingTier {
  minPeople: number;
  maxPeople: number;
  hourlyRate: number;
  dailyRate: number;
  extraPersonHourly?: number;
  extraPersonDaily?: number;
}

interface PricingStructure {
  hourly: number;
  daily: number;
  weekly: number;
  monthly: number;
  perPerson: boolean;
  maxHoursBeforeDaily?: number;
  dailyRatePerPerson?: number;
  tiers?: PricingTier[];
}

interface AvailableReservationTypes {
  hourly: boolean;
  daily: boolean;
  weekly: boolean;
  monthly: boolean;
}

interface DepositPolicy {
  enabled: boolean;
  percentage?: number;
  fixedAmount?: number;
  minimumAmount?: number;
}

interface SpaceConfiguration {
  _id: string;
  spaceType: string;
  name: string;
  slug: string;
  description?: string;
  pricing: PricingStructure;
  availableReservationTypes?: AvailableReservationTypes;
  requiresQuote: boolean;
  depositPolicy?: DepositPolicy;
  minCapacity: number;
  maxCapacity: number;
  isActive: boolean;
  imageUrl?: string;
  displayOrder: number;
  features?: string[];
}

const spaceTypeLabels: Record<string, string> = {
  "open-space": "Open-space",
  "salle-verriere": "Salle Verrière",
  "salle-etage": "Salle Étage",
  "evenementiel": "Événementiel",
};

export default function SpacesSettingsPage() {
  const { setPageTitle, setPageActions } = useTopbarContext();
  const [configurations, setConfigurations] = useState<SpaceConfiguration[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [activeTab, setActiveTab] = useState<string>("open-space");
  const [viewMode, setViewMode] = useState<"list" | "edit" | "create">("list");
  const [uploadingImage, setUploadingImage] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [spaceToDelete, setSpaceToDelete] = useState<SpaceConfiguration | null>(null);
  const [newSpace, setNewSpace] = useState<Partial<SpaceConfiguration>>({
    spaceType: "",
    name: "",
    slug: "",
    description: "",
    minCapacity: 1,
    maxCapacity: 10,
    isActive: true,
    requiresQuote: false,
    displayOrder: 0,
    features: [],
    pricing: {
      hourly: 0,
      daily: 0,
      weekly: 0,
      monthly: 0,
      perPerson: false,
    },
    availableReservationTypes: {
      hourly: true,
      daily: false,
      weekly: false,
      monthly: false,
    },
  });

  useEffect(() => {
    setPageTitle('Configuration des Espaces');
    setPageActions(
      <>
        <button
          onClick={() => setViewMode("list")}
          style={{
            padding: '8px 16px',
            background: viewMode === "list" ? '#667eea' : 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 500,
            color: viewMode === "list" ? 'white' : '#374151',
            cursor: 'pointer',
            transition: 'all 0.3s',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
          onMouseEnter={(e) => {
            if (viewMode !== 'list') {
              e.currentTarget.style.background = '#f9fafb';
              e.currentTarget.style.borderColor = '#d1d5db';
            }
          }}
          onMouseLeave={(e) => {
            if (viewMode !== 'list') {
              e.currentTarget.style.background = 'white';
              e.currentTarget.style.borderColor = '#e5e7eb';
            }
          }}
        >
          <Icon icon="ri:list-check" width={16} />
          Liste
        </button>
        <button
          onClick={() => setViewMode("edit")}
          style={{
            padding: '8px 16px',
            background: viewMode === "edit" ? '#667eea' : 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 500,
            color: viewMode === "edit" ? 'white' : '#374151',
            cursor: 'pointer',
            transition: 'all 0.3s',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            marginLeft: '8px',
          }}
          onMouseEnter={(e) => {
            if (viewMode !== 'edit') {
              e.currentTarget.style.background = '#f9fafb';
              e.currentTarget.style.borderColor = '#d1d5db';
            }
          }}
          onMouseLeave={(e) => {
            if (viewMode !== 'edit') {
              e.currentTarget.style.background = 'white';
              e.currentTarget.style.borderColor = '#e5e7eb';
            }
          }}
        >
          <Icon icon="ri:settings-3-line" width={16} />
          Éditer
        </button>
        <button
          onClick={() => setViewMode("create")}
          style={{
            padding: '8px 16px',
            background: viewMode === "create" ? '#14b8a6' : '#14b8a6',
            border: '1px solid #14b8a6',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 500,
            color: 'white',
            cursor: 'pointer',
            transition: 'all 0.3s',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            marginLeft: '8px',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#0d9488';
            e.currentTarget.style.borderColor = '#0d9488';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#14b8a6';
            e.currentTarget.style.borderColor = '#14b8a6';
          }}
        >
          <Icon icon="ri:add-line" width={16} />
          Créer
        </button>
      </>
    );

    return () => {
      setPageTitle('Dashboard');
      setPageActions(null);
    };
  }, [setPageTitle, setPageActions, viewMode, saving]);

  useEffect(() => {
    fetchConfigurations();
  }, []);

  const fetchConfigurations = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/space-configurations");
      const data = await response.json();

      if (data.success) {
        setConfigurations(data.data);
        if (data.data.length > 0) {
          setActiveTab(data.data[0].spaceType);
        }
      } else {
        setMessage({ type: "error", text: "Erreur lors du chargement des configurations" });
      }
    } catch (error) {      setMessage({ type: "error", text: "Erreur lors du chargement des configurations" });
    } finally {
      setLoading(false);
    }
  };

  const handleSeedData = async () => {
    try {
      setSaving(true);
      const response = await fetch("/api/admin/space-configurations/seed", {
        method: "POST",
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: "success", text: "Configurations initiales créées avec succès" });
        fetchConfigurations();
      } else {
        setMessage({ type: "error", text: data.error || "Erreur lors de la création" });
      }
    } catch (error) {      setMessage({ type: "error", text: "Erreur lors de la création" });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSpace = async () => {
    if (!spaceToDelete) return;

    try {
      setSaving(true);
      const response = await fetch(`/api/admin/space-configurations/${spaceToDelete.spaceType}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: "success", text: "Espace supprimé avec succès" });
        setShowDeleteModal(false);
        setSpaceToDelete(null);
        fetchConfigurations();
      } else {
        setMessage({ type: "error", text: data.error || "Erreur lors de la suppression" });
      }
    } catch (error) {      setMessage({ type: "error", text: "Erreur lors de la suppression" });
    } finally {
      setSaving(false);
    }
  };

  const handleCreateSpace = async () => {
    if (!newSpace.name || !newSpace.spaceType) {
      setMessage({ type: "error", text: "Veuillez remplir les champs obligatoires" });
      return;
    }

    try {
      setSaving(true);
      const response = await fetch("/api/admin/space-configurations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newSpace),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: "success", text: "Espace créé avec succès" });
        setViewMode("list");
        // Reset form
        setNewSpace({
          spaceType: "",
          name: "",
          slug: "",
          description: "",
          minCapacity: 1,
          maxCapacity: 10,
          isActive: true,
          requiresQuote: false,
          displayOrder: 0,
          features: [],
          pricing: {
            hourly: 0,
            daily: 0,
            weekly: 0,
            monthly: 0,
            perPerson: false,
          },
          availableReservationTypes: {
            hourly: true,
            daily: false,
            weekly: false,
            monthly: false,
          },
        });
        fetchConfigurations();
      } else {
        setMessage({ type: "error", text: data.error || "Erreur lors de la création" });
      }
    } catch (error) {      setMessage({ type: "error", text: "Erreur lors de la création" });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateConfiguration = async (config: SpaceConfiguration) => {
    try {
      setSaving(true);
      const response = await fetch(`/api/admin/space-configurations/${config.spaceType}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(config),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: "success", text: "Configuration mise à jour avec succès" });
        fetchConfigurations();
      } else {
        setMessage({ type: "error", text: data.error || "Erreur lors de la mise à jour" });
      }
    } catch (error) {      setMessage({ type: "error", text: "Erreur lors de la mise à jour" });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (spaceType: string, currentStatus: boolean) => {
    const config = configurations.find((c) => c.spaceType === spaceType);
    if (!config) return;

    const updatedConfig = { ...config, isActive: !currentStatus };
    await handleUpdateConfiguration(updatedConfig);
  };

  const handleImageUpload = async (spaceType: string, file: File) => {
    try {      setUploadingImage(spaceType);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "spaces");      const response = await fetch("/api/admin/space-configurations/upload", {
        method: "POST",
        body: formData,
      });      const data = await response.json();
      if (response.ok && data.url) {
        // Update configuration with new image URL
        const foundConfig = configurations.find((c) => c.spaceType === spaceType);
        if (foundConfig) {
          const updatedConfig = { ...foundConfig, imageUrl: data.url };
          await handleUpdateConfiguration(updatedConfig);
        }
        setMessage({ type: "success", text: "Image uploadée avec succès" });
      } else {        setMessage({ type: "error", text: data.error || "Erreur lors de l'upload" });
      }
    } catch (error) {      setMessage({ type: "error", text: "Erreur lors de l'upload de l'image" });
    } finally {
      setUploadingImage(null);
    }
  };

  const updateConfiguration = (spaceType: string, updates: Partial<SpaceConfiguration>) => {
    setConfigurations((prev) =>
      prev.map((config) =>
        config.spaceType === spaceType ? { ...config, ...updates } : config
      )
    );
  };

  const updatePricing = (spaceType: string, field: keyof PricingStructure, value: number | boolean) => {
    setConfigurations((prev) =>
      prev.map((config) =>
        config.spaceType === spaceType
          ? {
              ...config,
              pricing: {
                ...config.pricing,
                [field]: value,
              },
            }
          : config
      )
    );
  };

  const addTier = (spaceType: string) => {
    setConfigurations((prev) =>
      prev.map((config) =>
        config.spaceType === spaceType
          ? {
              ...config,
              pricing: {
                ...config.pricing,
                tiers: [
                  ...(config.pricing.tiers || []),
                  {
                    minPeople: 1,
                    maxPeople: 10,
                    hourlyRate: 0,
                    dailyRate: 0,
                    extraPersonHourly: 0,
                    extraPersonDaily: 0,
                  },
                ],
              },
            }
          : config
      )
    );
  };

  const updateTier = (spaceType: string, tierIndex: number, field: keyof PricingTier, value: number) => {
    setConfigurations((prev) =>
      prev.map((config) =>
        config.spaceType === spaceType
          ? {
              ...config,
              pricing: {
                ...config.pricing,
                tiers: config.pricing.tiers?.map((tier, idx) =>
                  idx === tierIndex ? { ...tier, [field]: value } : tier
                ),
              },
            }
          : config
      )
    );
  };

  const removeTier = (spaceType: string, tierIndex: number) => {
    setConfigurations((prev) =>
      prev.map((config) =>
        config.spaceType === spaceType
          ? {
              ...config,
              pricing: {
                ...config.pricing,
                tiers: config.pricing.tiers?.filter((_, idx) => idx !== tierIndex),
              },
            }
          : config
      )
    );
  };

  const getAvailableTypes = (space: SpaceConfiguration) => {
    const types = [];
    if (space.availableReservationTypes?.hourly) types.push("Horaire");
    if (space.availableReservationTypes?.daily) types.push("Journée");
    if (space.availableReservationTypes?.weekly) types.push("Semaine");
    if (space.availableReservationTypes?.monthly) types.push("Mois");
    return types.join(", ") || "Aucun";
  };

  const getMinPrice = (space: SpaceConfiguration) => {
    if (space.requiresQuote) return "Sur devis";

    if (space.pricing.tiers && space.pricing.tiers.length > 0) {
      const minHourly = Math.min(...space.pricing.tiers.map(t => t.hourlyRate).filter(p => p > 0));
      return minHourly > 0 ? `À partir de ${minHourly}€/h` : "À configurer";
    }

    const prices = [
      space.pricing.hourly,
      space.pricing.daily,
      space.pricing.weekly,
      space.pricing.monthly,
    ].filter((p) => p > 0);

    if (prices.length === 0) return "À configurer";
    return `À partir de ${Math.min(...prices)}€`;
  };

  if (loading) {
    return (
      <div className="container-fluid">
        <div className="text-center mt-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
        </div>
      </div>
    );
  }

  if (configurations.length === 0) {
    return (
      <div className="container-fluid">
        <div className="text-center mt-5">
          <h3>Aucune configuration trouvée</h3>
          <p>Initialisez les configurations par défaut pour commencer.</p>
          <Button onClick={handleSeedData} disabled={saving}>
            {saving ? "Création en cours..." : "Initialiser les configurations"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      {message && (
        <Alert
          variant={message.type === "success" ? "success" : "danger"}
          dismissible
          onClose={() => setMessage(null)}
        >
          {message.text}
        </Alert>
      )}

      {viewMode === "list" ? (
        <Card className="border-0 shadow-sm">
          <Card.Body>
            <div className="table-responsive">
              <Table hover className="align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th style={{ width: "80px" }}>Image</th>
                    <th>Nom</th>
                    <th>Type</th>
                    <th>Capacité</th>
                    <th>Prix</th>
                    <th>Types dispo.</th>
                    <th>Statut</th>
                    <th style={{ width: "100px" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {configurations.map((space) => (
                    <tr key={space._id}>
                      <td>
                        {space.imageUrl ? (
                          <img
                            src={space.imageUrl}
                            alt={space.name}
                            className="rounded"
                            style={{
                              width: "60px",
                              height: "60px",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          <div
                            className="bg-light rounded d-flex align-items-center justify-content-center"
                            style={{ width: "60px", height: "60px" }}
                          >
                            <Icon icon="ri:image-line" width={24} className="text-muted" />
                          </div>
                        )}
                      </td>
                      <td>
                        <div>
                          <div className="fw-medium">{space.name}</div>
                          <small className="text-muted">{space.slug}</small>
                        </div>
                      </td>
                      <td>
                        <Badge bg="light" text="dark">
                          {spaceTypeLabels[space.spaceType] || space.spaceType}
                        </Badge>
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          <Icon icon="ri:user-line" className="me-1 text-muted" width={16} />
                          {space.minCapacity} - {space.maxCapacity}
                        </div>
                      </td>
                      <td>
                        <span>{getMinPrice(space)}</span>
                      </td>
                      <td>
                        <small className="text-muted">{getAvailableTypes(space)}</small>
                      </td>
                      <td>
                        <Badge bg={space.isActive ? "success" : "secondary"}>
                          {space.isActive ? "Actif" : "Inactif"}
                        </Badge>
                      </td>
                      <td>
                        <div className="d-flex gap-1">
                          <Button
                            size="sm"
                            variant="outline-secondary"
                            onClick={() => {
                              setActiveTab(space.spaceType);
                              setViewMode("edit");
                            }}
                          >
                            <Icon icon="ri:edit-line" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline-danger"
                            onClick={() => {
                              setSpaceToDelete(space);
                              setShowDeleteModal(true);
                            }}
                          >
                            <Icon icon="ri:delete-bin-line" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </Card.Body>
        </Card>
      ) : viewMode === "edit" ? (
        <Tab.Container activeKey={activeTab} onSelect={(k) => k && setActiveTab(k)}>
          <Row>
            <Col lg={12}>
              <Card>
                <Card.Body>
                  <Nav variant="tabs" className="mb-3">
                    {configurations.map((config) => (
                      <Nav.Item key={config.spaceType}>
                        <Nav.Link eventKey={config.spaceType}>{config.name}</Nav.Link>
                      </Nav.Item>
                    ))}
                  </Nav>

                  <Tab.Content>
                    {configurations.map((config) => (
                      <Tab.Pane key={config.spaceType} eventKey={config.spaceType}>
                        <Form>
                          {/* Image Upload */}
                          <h5 className="mb-3">Image</h5>
                          <Row className="mb-4">
                            <Col md={12}>
                              {config.imageUrl && (
                                <div className="mb-3">
                                  <img
                                    src={config.imageUrl}
                                    alt={config.name}
                                    className="rounded"
                                    style={{
                                      width: "200px",
                                      height: "200px",
                                      objectFit: "cover",
                                    }}
                                  />
                                </div>
                              )}
                              <Form.Group>
                                <Form.Label>Changer l'image</Form.Label>
                                <Form.Control
                                  type="file"
                                  accept="image/*"
                                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      handleImageUpload(config.spaceType, file);
                                    }
                                  }}
                                  disabled={uploadingImage === config.spaceType}
                                />
                                {uploadingImage === config.spaceType && (
                                  <small className="text-muted">Upload en cours...</small>
                                )}
                              </Form.Group>
                            </Col>
                          </Row>

                          {/* Basic Information */}
                          <h5 className="mb-3">Informations générales</h5>
                          <Row className="mb-3">
                            <Col md={6}>
                              <Form.Group className="mb-3">
                                <Form.Label>Nom</Form.Label>
                                <Form.Control
                                  type="text"
                                  value={config.name}
                                  onChange={(e) =>
                                    updateConfiguration(config.spaceType, { name: e.target.value })
                                  }
                                />
                              </Form.Group>
                            </Col>
                            <Col md={6}>
                              <Form.Group className="mb-3">
                                <Form.Label>Statut</Form.Label>
                                <Form.Check
                                  type="switch"
                                  label={config.isActive ? "Actif" : "Inactif"}
                                  checked={config.isActive}
                                  onChange={(e) =>
                                    updateConfiguration(config.spaceType, {
                                      isActive: e.target.checked,
                                    })
                                  }
                                />
                              </Form.Group>
                            </Col>
                          </Row>

                          <Form.Group className="mb-3">
                            <Form.Label>Description</Form.Label>
                            <Form.Control
                              as="textarea"
                              rows={2}
                              value={config.description || ""}
                              onChange={(e) =>
                                updateConfiguration(config.spaceType, {
                                  description: e.target.value,
                                })
                              }
                            />
                          </Form.Group>

                          {/* Features */}
                          <Form.Group className="mb-3">
                            <Form.Label>
                              Tags / Équipements{" "}
                              <small className="text-muted">
                                (Exemples: WiFi, Café, Écran, Projecteur, Climatisation, Imprimante, Tableau blanc, etc.)
                              </small>
                            </Form.Label>
                            <div className="d-flex flex-wrap gap-2 mb-2">
                              {(config.features || []).map((feature, index) => (
                                <Badge
                                  key={index}
                                  bg="light"
                                  text="dark"
                                  className="d-flex align-items-center gap-1 p-2"
                                  style={{ fontSize: '0.875rem' }}
                                >
                                  {feature}
                                  <Icon
                                    icon="ri:close-line"
                                    width={14}
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => {
                                      const newFeatures = [...(config.features || [])];
                                      newFeatures.splice(index, 1);
                                      updateConfiguration(config.spaceType, {
                                        features: newFeatures,
                                      });
                                    }}
                                  />
                                </Badge>
                              ))}
                            </div>
                            <div className="d-flex gap-2">
                              <Form.Control
                                type="text"
                                placeholder="Ajouter un tag (ex: WiFi)"
                                id={`feature-input-${config.spaceType}`}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    const input = e.target as HTMLInputElement;
                                    const value = input.value.trim();
                                    if (value && !(config.features || []).includes(value)) {
                                      updateConfiguration(config.spaceType, {
                                        features: [...(config.features || []), value],
                                      });
                                      input.value = '';
                                    }
                                  }
                                }}
                              />
                              <Button
                                variant="outline-primary"
                                onClick={() => {
                                  const input = document.getElementById(`feature-input-${config.spaceType}`) as HTMLInputElement;
                                  const value = input?.value.trim();
                                  if (value && !(config.features || []).includes(value)) {
                                    updateConfiguration(config.spaceType, {
                                      features: [...(config.features || []), value],
                                    });
                                    input.value = '';
                                  }
                                }}
                              >
                                <Icon icon="ri:add-line" />
                              </Button>
                            </div>
                          </Form.Group>

                          {/* Pricing */}
                          <h5 className="mb-3 mt-4">Tarification</h5>

                          <Form.Group className="mb-3">
                            <Form.Check
                              type="switch"
                              label="Tarifs sur devis (désactive la réservation en ligne)"
                              checked={config.requiresQuote}
                              onChange={(e) =>
                                updateConfiguration(config.spaceType, {
                                  requiresQuote: e.target.checked,
                                })
                              }
                            />
                          </Form.Group>

                          {!config.requiresQuote && (
                            <>
                              {/* Tarification par palier */}
                              <div className="mb-4">
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                  <h6 className="mb-0">Tarification par palier (optionnel)</h6>
                                  <Button
                                    size="sm"
                                    variant="outline-primary"
                                    onClick={() => addTier(config.spaceType)}
                                  >
                                    <Icon icon="ri:add-line" className="me-1" />
                                    Ajouter un palier
                                  </Button>
                                </div>

                                {config.pricing.tiers && config.pricing.tiers.length > 0 && (
                                  <div className="border rounded p-3 mb-3">
                                    {config.pricing.tiers.map((tier, idx) => (
                                      <div key={idx} className="border-bottom pb-3 mb-3">
                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                          <strong>Palier {idx + 1}</strong>
                                          <Button
                                            size="sm"
                                            variant="outline-danger"
                                            onClick={() => removeTier(config.spaceType, idx)}
                                          >
                                            <Icon icon="ri:delete-bin-line" />
                                          </Button>
                                        </div>
                                        <Row>
                                          <Col md={3}>
                                            <Form.Group className="mb-2">
                                              <Form.Label className="small">Min personnes</Form.Label>
                                              <Form.Control
                                                type="number"
                                                size="sm"
                                                min="1"
                                                value={tier.minPeople}
                                                onChange={(e) =>
                                                  updateTier(
                                                    config.spaceType,
                                                    idx,
                                                    "minPeople",
                                                    parseInt(e.target.value)
                                                  )
                                                }
                                              />
                                            </Form.Group>
                                          </Col>
                                          <Col md={3}>
                                            <Form.Group className="mb-2">
                                              <Form.Label className="small">Max personnes</Form.Label>
                                              <Form.Control
                                                type="number"
                                                size="sm"
                                                min="1"
                                                value={tier.maxPeople}
                                                onChange={(e) =>
                                                  updateTier(
                                                    config.spaceType,
                                                    idx,
                                                    "maxPeople",
                                                    parseInt(e.target.value)
                                                  )
                                                }
                                              />
                                            </Form.Group>
                                          </Col>
                                          <Col md={3}>
                                            <Form.Group className="mb-2">
                                              <Form.Label className="small">Tarif horaire (€)</Form.Label>
                                              <Form.Control
                                                type="number"
                                                size="sm"
                                                min="0"
                                                step="0.01"
                                                value={tier.hourlyRate}
                                                onChange={(e) =>
                                                  updateTier(
                                                    config.spaceType,
                                                    idx,
                                                    "hourlyRate",
                                                    parseFloat(e.target.value)
                                                  )
                                                }
                                              />
                                            </Form.Group>
                                          </Col>
                                          <Col md={3}>
                                            <Form.Group className="mb-2">
                                              <Form.Label className="small">Tarif journée (€)</Form.Label>
                                              <Form.Control
                                                type="number"
                                                size="sm"
                                                min="0"
                                                step="0.01"
                                                value={tier.dailyRate}
                                                onChange={(e) =>
                                                  updateTier(
                                                    config.spaceType,
                                                    idx,
                                                    "dailyRate",
                                                    parseFloat(e.target.value)
                                                  )
                                                }
                                              />
                                            </Form.Group>
                                          </Col>
                                          <Col md={6}>
                                            <Form.Group className="mb-2">
                                              <Form.Label className="small">
                                                Pers. sup. horaire (€)
                                              </Form.Label>
                                              <Form.Control
                                                type="number"
                                                size="sm"
                                                min="0"
                                                step="0.01"
                                                value={tier.extraPersonHourly || 0}
                                                onChange={(e) =>
                                                  updateTier(
                                                    config.spaceType,
                                                    idx,
                                                    "extraPersonHourly",
                                                    parseFloat(e.target.value)
                                                  )
                                                }
                                              />
                                            </Form.Group>
                                          </Col>
                                          <Col md={6}>
                                            <Form.Group className="mb-2">
                                              <Form.Label className="small">
                                                Pers. sup. journée (€)
                                              </Form.Label>
                                              <Form.Control
                                                type="number"
                                                size="sm"
                                                min="0"
                                                step="0.01"
                                                value={tier.extraPersonDaily || 0}
                                                onChange={(e) =>
                                                  updateTier(
                                                    config.spaceType,
                                                    idx,
                                                    "extraPersonDaily",
                                                    parseFloat(e.target.value)
                                                  )
                                                }
                                              />
                                            </Form.Group>
                                          </Col>
                                        </Row>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>

                              {/* Tarification simple si pas de paliers */}
                              {(!config.pricing.tiers || config.pricing.tiers.length === 0) && (
                                <>
                                  {/* Reservation Types Selection */}
                                  <div className="mb-4">
                                    <h6 className="mb-3">Types de réservation disponibles</h6>
                                    <Row>
                                      <Col md={6}>
                                        <Form.Group className="mb-3">
                                          <Form.Check
                                            type="switch"
                                            id={`hourly-${config.spaceType}`}
                                            label="Réservation à l'heure"
                                            checked={config.availableReservationTypes?.hourly || false}
                                            onChange={(e) =>
                                              updateConfiguration(config.spaceType, {
                                                availableReservationTypes: {
                                                  hourly: e.target.checked,
                                                  daily: config.availableReservationTypes?.daily || false,
                                                  weekly: config.availableReservationTypes?.weekly || false,
                                                  monthly: config.availableReservationTypes?.monthly || false,
                                                },
                                              })
                                            }
                                          />
                                        </Form.Group>
                                      </Col>
                                      <Col md={6}>
                                        <Form.Group className="mb-3">
                                          <Form.Check
                                            type="switch"
                                            id={`daily-${config.spaceType}`}
                                            label="Réservation à la journée"
                                            checked={config.availableReservationTypes?.daily || false}
                                            onChange={(e) =>
                                              updateConfiguration(config.spaceType, {
                                                availableReservationTypes: {
                                                  hourly: config.availableReservationTypes?.hourly || false,
                                                  daily: e.target.checked,
                                                  weekly: config.availableReservationTypes?.weekly || false,
                                                  monthly: config.availableReservationTypes?.monthly || false,
                                                },
                                              })
                                            }
                                          />
                                        </Form.Group>
                                      </Col>
                                    </Row>
                                  </div>

                                  {/* Pricing Fields */}
                                  <h6 className="mb-3">Tarifs</h6>
                                  <Row className="mb-3">
                                    {config.availableReservationTypes?.hourly && (
                                      <Col md={6}>
                                        <Form.Group>
                                          <Form.Label>Prix Horaire (€)</Form.Label>
                                          <Form.Control
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={config.pricing.hourly}
                                            onChange={(e) =>
                                              updatePricing(
                                                config.spaceType,
                                                "hourly",
                                                parseFloat(e.target.value)
                                              )
                                            }
                                          />
                                        </Form.Group>
                                      </Col>
                                    )}
                                    {config.availableReservationTypes?.daily && (
                                      <Col md={6}>
                                        <Form.Group>
                                          <Form.Label>Prix Journée (€)</Form.Label>
                                          <Form.Control
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={config.pricing.daily}
                                            onChange={(e) =>
                                              updatePricing(
                                                config.spaceType,
                                                "daily",
                                                parseFloat(e.target.value)
                                              )
                                            }
                                          />
                                        </Form.Group>
                                      </Col>
                                    )}
                                  </Row>

                                  <Form.Group className="mb-3">
                                    <Form.Check
                                      type="checkbox"
                                      label="Prix par personne (multiplier par le nombre de personnes)"
                                      checked={config.pricing.perPerson}
                                      onChange={(e) =>
                                        updatePricing(config.spaceType, "perPerson", e.target.checked)
                                      }
                                    />
                                  </Form.Group>

                                  {/* Max hours before daily */}
                                  {config.pricing.perPerson && (
                                    <Row className="mb-3">
                                      <Col md={6}>
                                        <Form.Group>
                                          <Form.Label>
                                            Heures max avant tarif journée (optionnel)
                                          </Form.Label>
                                          <Form.Control
                                            type="number"
                                            min="0"
                                            value={config.pricing.maxHoursBeforeDaily || ""}
                                            onChange={(e) =>
                                              updatePricing(
                                                config.spaceType,
                                                "maxHoursBeforeDaily",
                                                parseInt(e.target.value) || 0
                                              )
                                            }
                                          />
                                        </Form.Group>
                                      </Col>
                                      <Col md={6}>
                                        <Form.Group>
                                          <Form.Label>Tarif journée par personne (€)</Form.Label>
                                          <Form.Control
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={config.pricing.dailyRatePerPerson || ""}
                                            onChange={(e) =>
                                              updatePricing(
                                                config.spaceType,
                                                "dailyRatePerPerson",
                                                parseFloat(e.target.value) || 0
                                              )
                                            }
                                          />
                                        </Form.Group>
                                      </Col>
                                    </Row>
                                  )}
                                </>
                              )}
                            </>
                          )}

                          {config.requiresQuote && (
                            <Alert variant="info">
                              <Icon icon="ri:information-line" className="me-2" />
                              Mode "sur devis" activé. Les visiteurs verront un message les invitant à vous contacter pour un devis personnalisé.
                            </Alert>
                          )}

                          {/* Deposit Policy */}
                          <h5 className="mb-3 mt-4">Politique d'empreinte bancaire</h5>
                          <Form.Group className="mb-3">
                            <Form.Check
                              type="checkbox"
                              id={`depositEnabled-${config.spaceType}`}
                              label="Activer l'empreinte bancaire pour ce type d'espace"
                              checked={config.depositPolicy?.enabled || false}
                              onChange={(e) =>
                                updateConfiguration(config.spaceType, {
                                  depositPolicy: {
                                    ...config.depositPolicy,
                                    enabled: e.target.checked,
                                  },
                                })
                              }
                            />
                          </Form.Group>

                          {config.depositPolicy?.enabled && (
                            <>
                              <Alert variant="info" className="mb-3">
                                <Icon icon="ri:information-line" className="me-2" />
                                <small>
                                  L'empreinte bancaire permet de garantir les réservations. Elle peut être :
                                  <ul className="mb-0 mt-2" style={{ fontSize: '0.85rem' }}>
                                    <li>Un <strong>pourcentage</strong> du montant total</li>
                                    <li>Un <strong>montant fixe</strong></li>
                                    <li>Avec un <strong>montant minimum</strong> si besoin</li>
                                  </ul>
                                </small>
                              </Alert>

                              <Row className="mb-3">
                                <Col md={6}>
                                  <Form.Group>
                                    <Form.Label>Pourcentage du montant total (%)</Form.Label>
                                    <Form.Control
                                      type="number"
                                      min="0"
                                      max="100"
                                      step="1"
                                      placeholder="Ex: 30 pour 30%"
                                      value={config.depositPolicy?.percentage || ""}
                                      onChange={(e) =>
                                        updateConfiguration(config.spaceType, {
                                          depositPolicy: {
                                            ...config.depositPolicy,
                                            enabled: true,
                                            percentage: e.target.value ? parseInt(e.target.value) : undefined,
                                          },
                                        })
                                      }
                                    />
                                    <Form.Text className="text-muted">
                                      Laisser vide pour utiliser un montant fixe
                                    </Form.Text>
                                  </Form.Group>
                                </Col>
                                <Col md={6}>
                                  <Form.Group>
                                    <Form.Label>Montant fixe (€)</Form.Label>
                                    <Form.Control
                                      type="number"
                                      min="0"
                                      step="0.01"
                                      placeholder="Ex: 50"
                                      value={config.depositPolicy?.fixedAmount ? (config.depositPolicy.fixedAmount / 100) : ""}
                                      onChange={(e) =>
                                        updateConfiguration(config.spaceType, {
                                          depositPolicy: {
                                            ...config.depositPolicy,
                                            enabled: true,
                                            fixedAmount: e.target.value ? Math.round(parseFloat(e.target.value) * 100) : undefined,
                                          },
                                        })
                                      }
                                    />
                                    <Form.Text className="text-muted">
                                      Utilisé si le pourcentage n'est pas défini
                                    </Form.Text>
                                  </Form.Group>
                                </Col>
                              </Row>

                              <Row className="mb-3">
                                <Col md={6}>
                                  <Form.Group>
                                    <Form.Label>Montant minimum d'empreinte (€)</Form.Label>
                                    <Form.Control
                                      type="number"
                                      min="0"
                                      step="0.01"
                                      placeholder="Ex: 20"
                                      value={config.depositPolicy?.minimumAmount ? (config.depositPolicy.minimumAmount / 100) : ""}
                                      onChange={(e) =>
                                        updateConfiguration(config.spaceType, {
                                          depositPolicy: {
                                            ...config.depositPolicy,
                                            enabled: true,
                                            minimumAmount: e.target.value ? Math.round(parseFloat(e.target.value) * 100) : undefined,
                                          },
                                        })
                                      }
                                    />
                                    <Form.Text className="text-muted">
                                      Optionnel : montant minimum garanti
                                    </Form.Text>
                                  </Form.Group>
                                </Col>
                              </Row>
                            </>
                          )}

                          {/* Capacity */}
                          <h5 className="mb-3 mt-4">Capacité</h5>
                          <Row className="mb-3">
                            <Col md={6}>
                              <Form.Group>
                                <Form.Label>Capacité Minimale</Form.Label>
                                <Form.Control
                                  type="number"
                                  min="1"
                                  value={config.minCapacity}
                                  onChange={(e) =>
                                    updateConfiguration(config.spaceType, {
                                      minCapacity: parseInt(e.target.value),
                                    })
                                  }
                                />
                              </Form.Group>
                            </Col>
                            <Col md={6}>
                              <Form.Group>
                                <Form.Label>Capacité Maximale</Form.Label>
                                <Form.Control
                                  type="number"
                                  min="1"
                                  value={config.maxCapacity}
                                  onChange={(e) =>
                                    updateConfiguration(config.spaceType, {
                                      maxCapacity: parseInt(e.target.value),
                                    })
                                  }
                                />
                              </Form.Group>
                            </Col>
                          </Row>

                          {/* Save Button */}
                          <div className="mt-4">
                            <Button
                              variant="primary"
                              onClick={() => handleUpdateConfiguration(config)}
                              disabled={saving}
                            >
                              {saving ? "Enregistrement..." : "Enregistrer les modifications"}
                            </Button>
                          </div>
                        </Form>
                      </Tab.Pane>
                    ))}
                  </Tab.Content>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Tab.Container>
      ) : viewMode === "create" ? (
        <Card>
          <Card.Body>
            <h5 className="mb-4">Créer un nouvel espace</h5>
            <Form>
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Type d'espace *</Form.Label>
                    <Form.Control
                      type="text"
                      value={newSpace.spaceType || ""}
                      onChange={(e) => setNewSpace({ ...newSpace, spaceType: e.target.value })}
                      placeholder="ex: salle-reunion"
                    />
                    <Form.Text className="text-muted">
                      Utilisé dans l'URL (sans espaces, en minuscules)
                    </Form.Text>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Nom *</Form.Label>
                    <Form.Control
                      type="text"
                      value={newSpace.name || ""}
                      onChange={(e) => setNewSpace({ ...newSpace, name: e.target.value })}
                      placeholder="ex: Salle de Réunion"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Slug</Form.Label>
                    <Form.Control
                      type="text"
                      value={newSpace.slug || ""}
                      onChange={(e) => setNewSpace({ ...newSpace, slug: e.target.value })}
                      placeholder="ex: salle-reunion"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Ordre d'affichage</Form.Label>
                    <Form.Control
                      type="number"
                      value={newSpace.displayOrder || 0}
                      onChange={(e) => setNewSpace({ ...newSpace, displayOrder: parseInt(e.target.value) })}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={newSpace.description || ""}
                  onChange={(e) => setNewSpace({ ...newSpace, description: e.target.value })}
                />
              </Form.Group>

              <h6 className="mt-4 mb-3">Capacité</h6>
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Capacité minimale</Form.Label>
                    <Form.Control
                      type="number"
                      min="1"
                      value={newSpace.minCapacity || 1}
                      onChange={(e) => setNewSpace({ ...newSpace, minCapacity: parseInt(e.target.value) })}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Capacité maximale</Form.Label>
                    <Form.Control
                      type="number"
                      min="1"
                      value={newSpace.maxCapacity || 10}
                      onChange={(e) => setNewSpace({ ...newSpace, maxCapacity: parseInt(e.target.value) })}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <h6 className="mt-4 mb-3">Tarification</h6>
              <Form.Group className="mb-3">
                <Form.Check
                  type="switch"
                  label="Sur devis uniquement"
                  checked={newSpace.requiresQuote || false}
                  onChange={(e) => setNewSpace({ ...newSpace, requiresQuote: e.target.checked })}
                />
              </Form.Group>

              {!newSpace.requiresQuote && (
                <>
                  <Row className="mb-3">
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Prix horaire (€)</Form.Label>
                        <Form.Control
                          type="number"
                          min="0"
                          step="0.01"
                          value={newSpace.pricing?.hourly || 0}
                          onChange={(e) => setNewSpace({
                            ...newSpace,
                            pricing: { ...newSpace.pricing!, hourly: parseFloat(e.target.value) }
                          })}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Prix journée (€)</Form.Label>
                        <Form.Control
                          type="number"
                          min="0"
                          step="0.01"
                          value={newSpace.pricing?.daily || 0}
                          onChange={(e) => setNewSpace({
                            ...newSpace,
                            pricing: { ...newSpace.pricing!, daily: parseFloat(e.target.value) }
                          })}
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-3">
                    <Form.Check
                      type="checkbox"
                      label="Prix par personne"
                      checked={newSpace.pricing?.perPerson || false}
                      onChange={(e) => setNewSpace({
                        ...newSpace,
                        pricing: { ...newSpace.pricing!, perPerson: e.target.checked }
                      })}
                    />
                  </Form.Group>
                </>
              )}

              <Form.Group className="mb-3">
                <Form.Check
                  type="switch"
                  label="Actif"
                  checked={newSpace.isActive !== false}
                  onChange={(e) => setNewSpace({ ...newSpace, isActive: e.target.checked })}
                />
              </Form.Group>

              <div className="mt-4 d-flex gap-2">
                <Button variant="primary" onClick={handleCreateSpace} disabled={saving}>
                  {saving ? "Création en cours..." : "Créer l'espace"}
                </Button>
                <Button variant="outline-secondary" onClick={() => setViewMode("list")}>
                  Annuler
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      ) : null}

      {/* Modal de confirmation de suppression */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirmer la suppression</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Êtes-vous sûr de vouloir supprimer l'espace{" "}
            <strong>{spaceToDelete?.name}</strong> ?
          </p>
          <Alert variant="warning">
            <Icon icon="ri:alert-line" className="me-2" />
            Cette action est irréversible. Toutes les données associées seront perdues.
          </Alert>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setShowDeleteModal(false)}>
            Annuler
          </Button>
          <Button variant="danger" onClick={handleDeleteSpace} disabled={saving}>
            {saving ? "Suppression..." : "Supprimer"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
