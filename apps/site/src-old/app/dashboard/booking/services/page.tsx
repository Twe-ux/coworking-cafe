"use client";

import { useState, useEffect } from "react";
import { useTopbarContext } from "../../../../context/useTopbarContext";
import { Card, CardBody, Table, Modal, Form, Badge } from "react-bootstrap";
import { useNotification } from "../../../../hooks/useNotification";
import IconifyIcon from "../../../../components/dashboard/wrappers/IconifyIcon";

interface AdditionalService {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  category: "food" | "beverage" | "equipment" | "other";
  price: number;
  dailyPrice?: number;
  priceUnit: "per-person" | "flat-rate";
  vatRate: number;
  isActive: boolean;
  order: number;
  availableForSpaceTypes?: string[];
  icon?: string;
  createdAt: string;
  updatedAt: string;
}

const categoryLabels = {
  food: "Nourriture",
  beverage: "Boissons",
  equipment: "Équipement",
  other: "Autre",
};

const categoryColors = {
  food: "warning",
  beverage: "info",
  equipment: "secondary",
  other: "dark",
};

const AdditionalServicesPage = () => {
  const { setPageTitle, setPageActions } = useTopbarContext();
  const { success, error: showError } = useNotification();

  const [services, setServices] = useState<AdditionalService[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] =
    useState<AdditionalService | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "food" as "food" | "beverage" | "equipment" | "other",
    price: 0,
    dailyPrice: undefined as number | undefined,
    priceUnit: "flat-rate" as "per-person" | "flat-rate",
    vatRate: 20,
    isActive: true,
    order: 0,
    icon: "",
  });

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/additional-services?limit=100");
      const data = await response.json();
      if (data.success) {
        setServices(data.data);
      }
    } catch (error) {
      showError("Erreur lors du chargement des services");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleOpenModal = (service?: AdditionalService) => {
    if (service) {
      setEditingService(service);
      setFormData({
        name: service.name,
        description: service.description || "",
        category: service.category,
        price: service.price,
        dailyPrice: service.dailyPrice,
        priceUnit: service.priceUnit,
        vatRate: service.vatRate,
        isActive: service.isActive,
        order: service.order,
        icon: service.icon || "",
      });
    } else {
      setEditingService(null);
      setFormData({
        name: "",
        description: "",
        category: "food",
        price: 0,
        dailyPrice: undefined,
        priceUnit: "flat-rate",
        vatRate: 20,
        isActive: true,
        order: 0,
        icon: "",
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingService(null);
  };

  useEffect(() => {
    setPageTitle("Services Supplémentaires");
    setPageActions(
      <button
        onClick={() => handleOpenModal()}
        style={{
          padding: "8px 16px",
          background: "#667eea",
          border: "1px solid #667eea",
          borderRadius: "8px",
          fontSize: "14px",
          fontWeight: 500,
          color: "white",
          cursor: "pointer",
          transition: "all 0.3s",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "#5568d3";
          e.currentTarget.style.borderColor = "#5568d3";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "#667eea";
          e.currentTarget.style.borderColor = "#667eea";
        }}
      >
        <IconifyIcon icon="solar:add-circle-outline" />
        Nouveau Service
      </button>,
    );

    return () => {
      setPageTitle("Dashboard");
      setPageActions(null);
    };
  }, [setPageTitle, setPageActions]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingService
        ? `/api/additional-services/${editingService._id}`
        : "/api/additional-services";

      const response = await fetch(url, {
        method: editingService ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        success(
          editingService
            ? "Service modifié avec succès"
            : "Service créé avec succès",
        );
        handleCloseModal();
        fetchServices();
      } else {
        showError(data.error || "Erreur lors de la sauvegarde");
      }
    } catch (error) {
      showError("Une erreur est survenue");
    }
  };

  const handleDelete = async (serviceId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce service ?")) return;

    try {
      const response = await fetch(`/api/additional-services/${serviceId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        success("Service supprimé avec succès");
        fetchServices();
      } else {
        showError(data.error || "Erreur lors de la suppression");
      }
    } catch (error) {
      showError("Une erreur est survenue");
    }
  };

  const handleToggleActive = async (service: AdditionalService) => {
    try {
      const response = await fetch(`/api/additional-services/${service._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !service.isActive }),
      });

      const data = await response.json();

      if (data.success) {
        success(service.isActive ? "Service désactivé" : "Service activé");
        fetchServices();
      } else {
        showError(data.error || "Erreur");
      }
    } catch (error) {
      showError("Une erreur est survenue");
    }
  };

  return (
    <>
      <Card>
        <CardBody>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h4 className="card-title mb-0">
              Liste des services ({services.length})
            </h4>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Chargement...</span>
              </div>
            </div>
          ) : services.length === 0 ? (
            <div className="text-center py-5">
              <IconifyIcon
                icon="solar:box-outline"
                className="fs-1 text-muted mb-3"
              />
              <p className="text-muted">Aucun service disponible</p>
              <button
                className="btn btn-primary"
                onClick={() => handleOpenModal()}
              >
                Créer un service
              </button>
            </div>
          ) : (
            <div className="table-responsive">
              <Table className="table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Nom</th>
                    <th>Catégorie</th>
                    <th>Prix</th>
                    <th>Type de prix</th>
                    <th>Statut</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {services.map((service) => (
                    <tr key={service._id}>
                      <td>
                        <div className="d-flex align-items-center">
                          {service.icon && (
                            <IconifyIcon
                              icon={service.icon}
                              className="fs-4 me-2"
                            />
                          )}
                          <div>
                            <div className="fw-semibold">{service.name}</div>
                            {service.description && (
                              <small className="text-muted">
                                {service.description}
                              </small>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        <Badge bg={categoryColors[service.category]}>
                          {categoryLabels[service.category]}
                        </Badge>
                      </td>
                      <td className="fw-semibold">
                        {service.price.toFixed(2)}€
                      </td>
                      <td>
                        {service.priceUnit === "per-person"
                          ? "Par personne"
                          : "Forfait"}
                      </td>
                      <td>
                        <div className="form-check form-switch">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={service.isActive}
                            onChange={() => handleToggleActive(service)}
                            style={{ cursor: "pointer" }}
                          />
                          <label className="form-check-label">
                            {service.isActive ? "Actif" : "Inactif"}
                          </label>
                        </div>
                      </td>
                      <td className="text-end">
                        <button
                          className="btn btn-sm btn-soft-primary me-2"
                          onClick={() => handleOpenModal(service)}
                          title="Modifier"
                        >
                          <IconifyIcon icon="solar:pen-outline" />
                        </button>
                        <button
                          className="btn btn-sm btn-soft-danger"
                          onClick={() => handleDelete(service._id)}
                          title="Supprimer"
                        >
                          <IconifyIcon icon="solar:trash-bin-minimalistic-outline" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Modal Create/Edit */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {editingService ? "Modifier le service" : "Nouveau service"}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <div className="row g-3">
              <div className="col-md-12">
                <Form.Group>
                  <Form.Label>
                    Nom du service <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                    placeholder="Ex: Pizza Margherita"
                  />
                </Form.Group>
              </div>

              <div className="col-md-12">
                <Form.Group>
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Description du service"
                  />
                </Form.Group>
              </div>

              <div className="col-md-6">
                <Form.Group>
                  <Form.Label>
                    Catégorie <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        category: e.target.value as any,
                      })
                    }
                    required
                  >
                    <option value="food">Nourriture</option>
                    <option value="beverage">Boissons</option>
                    <option value="equipment">Équipement</option>
                    <option value="other">Autre</option>
                  </Form.Select>
                </Form.Group>
              </div>

              <div className="col-md-6">
                <Form.Group>
                  <Form.Label>
                    Prix (€) <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        price: parseFloat(e.target.value),
                      })
                    }
                    required
                  />
                </Form.Group>
              </div>

              <div className="col-md-6">
                <Form.Group>
                  <Form.Label>Prix forfait journée (€)</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.dailyPrice || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        dailyPrice: e.target.value
                          ? parseFloat(e.target.value)
                          : undefined,
                      })
                    }
                    placeholder="Optionnel"
                  />
                  <Form.Text className="text-muted">
                    Prix spécial pour les réservations à la journée
                  </Form.Text>
                </Form.Group>
              </div>

              <div className="col-md-6">
                <Form.Group>
                  <Form.Label>
                    Type de prix <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Select
                    value={formData.priceUnit}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        priceUnit: e.target.value as any,
                      })
                    }
                    required
                  >
                    <option value="flat-rate">Forfait</option>
                    <option value="per-person">Par personne</option>
                  </Form.Select>
                  <Form.Text className="text-muted">
                    Le prix par personne sera multiplié par le nombre de
                    participants
                  </Form.Text>
                </Form.Group>
              </div>

              <div className="col-md-6">
                <Form.Group>
                  <Form.Label>
                    Taux de TVA (%) <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Select
                    value={formData.vatRate}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        vatRate: parseFloat(e.target.value),
                      })
                    }
                    required
                  >
                    <option value="5.5">5,5% (Taux réduit alimentaire)</option>
                    <option value="10">10% (Taux réduit)</option>
                    <option value="20">20% (Taux normal)</option>
                  </Form.Select>
                  <Form.Text className="text-muted">
                    Taux de TVA applicable à ce service
                  </Form.Text>
                </Form.Group>
              </div>

              <div className="col-md-6">
                <Form.Group>
                  <Form.Label>Ordre d'affichage</Form.Label>
                  <Form.Control
                    type="number"
                    value={formData.order}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        order: parseInt(e.target.value),
                      })
                    }
                  />
                  <Form.Text className="text-muted">
                    Plus le nombre est petit, plus le service apparaît en haut
                  </Form.Text>
                </Form.Group>
              </div>

              <div className="col-md-12">
                <Form.Group>
                  <Form.Label>Icône (optionnel)</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.icon}
                    onChange={(e) =>
                      setFormData({ ...formData, icon: e.target.value })
                    }
                    placeholder="Ex: solar:cake-outline"
                  />
                  <Form.Text className="text-muted">
                    Icône Iconify (voir{" "}
                    <a
                      href="https://icon-sets.iconify.design/solar/"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      icon-sets.iconify.design
                    </a>
                    )
                  </Form.Text>
                </Form.Group>
              </div>

              <div className="col-md-12">
                <Form.Check
                  type="checkbox"
                  label="Service actif (visible dans les réservations)"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData({ ...formData, isActive: e.target.checked })
                  }
                />
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <button
              type="button"
              className="btn btn-light"
              onClick={handleCloseModal}
            >
              Annuler
            </button>
            <button type="submit" className="btn btn-primary">
              {editingService ? "Modifier" : "Créer"}
            </button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
};

export default AdditionalServicesPage;
