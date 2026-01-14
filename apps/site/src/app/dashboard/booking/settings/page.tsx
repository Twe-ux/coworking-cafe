"use client";

import { useEffect, useState } from "react";
import { Card, Form, Button, Alert, Row, Col, Table } from "react-bootstrap";
import { useTopbarContext } from "@/context/useTopbarContext";
import { Icon } from "@iconify/react";

interface CancellationPolicyTier {
  daysBeforeBooking: number;
  chargePercentage: number;
}

interface BookingSettings {
  _id?: string;
  cancellationPolicyOpenSpace: CancellationPolicyTier[];
  cancellationPolicyMeetingRooms: CancellationPolicyTier[];
  cronSchedules: {
    attendanceCheckTime: string;
    dailyReportTime: string;
  };
  depositPolicy: {
    minAmountRequired: number;
    defaultPercent: number;
    applyToSpaces: string[];
  };
  notificationEmail: string;
}

export default function BookingSettingsPage() {
  const { setPageTitle } = useTopbarContext();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [settings, setSettings] = useState<BookingSettings>({
    cancellationPolicyOpenSpace: [
      { daysBeforeBooking: 7, chargePercentage: 0 },
      { daysBeforeBooking: 3, chargePercentage: 50 },
      { daysBeforeBooking: 0, chargePercentage: 100 },
    ],
    cancellationPolicyMeetingRooms: [
      { daysBeforeBooking: 7, chargePercentage: 0 },
      { daysBeforeBooking: 3, chargePercentage: 50 },
      { daysBeforeBooking: 0, chargePercentage: 100 },
    ],
    cronSchedules: {
      attendanceCheckTime: "10:00",
      dailyReportTime: "19:00",
    },
    depositPolicy: {
      minAmountRequired: 200,
      defaultPercent: 50,
      applyToSpaces: ["salle-etage"],
    },
    notificationEmail: "strasbourg@coworkingcafe.fr",
  });

  useEffect(() => {
    setPageTitle("Réglages Réservations");
    fetchSettings();

    return () => {
      setPageTitle("Dashboard");
    };
  }, [setPageTitle]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/booking-settings");
      const data = await response.json();

      if (data.success) {
        // Migration: Handle old format with single cancellationPolicy
        const loadedSettings = data.data;
        if (!loadedSettings.cancellationPolicyOpenSpace && loadedSettings.cancellationPolicy) {
          // Migrate old format to new format
          loadedSettings.cancellationPolicyOpenSpace = loadedSettings.cancellationPolicy;
          loadedSettings.cancellationPolicyMeetingRooms = loadedSettings.cancellationPolicy;
          delete loadedSettings.cancellationPolicy;
        }
        setSettings(loadedSettings);
      } else {
        setMessage({
          type: "error",
          text: data.error || "Erreur lors du chargement",
        });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: "Erreur lors du chargement des réglages",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage(null);

      const response = await fetch("/api/admin/booking-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      const data = await response.json();

      if (data.success) {
        setMessage({
          type: "success",
          text: "Réglages enregistrés avec succès",
        });
        // Migration: Handle old format with single cancellationPolicy in response
        const savedSettings = data.data;
        if (!savedSettings.cancellationPolicyOpenSpace && savedSettings.cancellationPolicy) {
          savedSettings.cancellationPolicyOpenSpace = savedSettings.cancellationPolicy;
          savedSettings.cancellationPolicyMeetingRooms = savedSettings.cancellationPolicy;
          delete savedSettings.cancellationPolicy;
        }
        setSettings(savedSettings);
      } else {
        setMessage({
          type: "error",
          text: data.error || "Erreur lors de l'enregistrement",
        });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: "Erreur lors de l'enregistrement des réglages",
      });
    } finally {
      setSaving(false);
    }
  };

  const addCancellationTier = (policyType: 'openSpace' | 'meetingRooms') => {
    if (policyType === 'openSpace') {
      setSettings({
        ...settings,
        cancellationPolicyOpenSpace: [
          ...(settings.cancellationPolicyOpenSpace || []),
          { daysBeforeBooking: 5, chargePercentage: 75 },
        ],
      });
    } else {
      setSettings({
        ...settings,
        cancellationPolicyMeetingRooms: [
          ...(settings.cancellationPolicyMeetingRooms || []),
          { daysBeforeBooking: 5, chargePercentage: 75 },
        ],
      });
    }
  };

  const removeCancellationTier = (policyType: 'openSpace' | 'meetingRooms', index: number) => {
    if (policyType === 'openSpace') {
      setSettings({
        ...settings,
        cancellationPolicyOpenSpace: (settings.cancellationPolicyOpenSpace || []).filter(
          (_, i) => i !== index
        ),
      });
    } else {
      setSettings({
        ...settings,
        cancellationPolicyMeetingRooms: (settings.cancellationPolicyMeetingRooms || []).filter(
          (_, i) => i !== index
        ),
      });
    }
  };

  const updateCancellationTier = (
    policyType: 'openSpace' | 'meetingRooms',
    index: number,
    field: keyof CancellationPolicyTier,
    value: number
  ) => {
    if (policyType === 'openSpace') {
      const updated = [...(settings.cancellationPolicyOpenSpace || [])];
      updated[index] = { ...updated[index], [field]: value };
      setSettings({ ...settings, cancellationPolicyOpenSpace: updated });
    } else {
      const updated = [...(settings.cancellationPolicyMeetingRooms || [])];
      updated[index] = { ...updated[index], [field]: value };
      setSettings({ ...settings, cancellationPolicyMeetingRooms: updated });
    }
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

  return (
    <div className="container-fluid">
      {message && (
        <Alert
          variant={message.type === "success" ? "success" : "danger"}
          dismissible
          onClose={() => setMessage(null)}
          className="mb-4"
        >
          {message.text}
        </Alert>
      )}

      <Row className="g-4">
        {/* Politique d'annulation Open-Space */}
        <Col xl={6}>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                <Icon icon="ri:close-circle-line" className="me-2" />
                Annulation Open-Space
              </h5>
            </Card.Header>
            <Card.Body>
              <p className="text-muted small mb-3">
                Politique d'annulation pour les places en open-space
              </p>
              <Table striped bordered hover size="sm">
                <thead>
                  <tr>
                    <th>Jours avant réservation</th>
                    <th>% encaissé</th>
                    <th style={{ width: "50px" }}></th>
                  </tr>
                </thead>
                <tbody>
                  {(settings.cancellationPolicyOpenSpace || []).map((tier, index) => (
                    <tr key={index}>
                      <td>
                        <Form.Control
                          type="number"
                          size="sm"
                          value={tier.daysBeforeBooking}
                          onChange={(e) =>
                            updateCancellationTier(
                              'openSpace',
                              index,
                              "daysBeforeBooking",
                              parseInt(e.target.value) || 0
                            )
                          }
                          min="0"
                        />
                      </td>
                      <td>
                        <Form.Control
                          type="number"
                          size="sm"
                          value={tier.chargePercentage}
                          onChange={(e) =>
                            updateCancellationTier(
                              'openSpace',
                              index,
                              "chargePercentage",
                              parseInt(e.target.value) || 0
                            )
                          }
                          min="0"
                          max="100"
                        />
                      </td>
                      <td className="text-center">
                        <Button
                          variant="link"
                          size="sm"
                          className="text-danger p-0"
                          onClick={() => removeCancellationTier('openSpace', index)}
                        >
                          <Icon icon="ri:delete-bin-line" width={18} />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              <Button
                variant="outline-primary"
                size="sm"
                onClick={() => addCancellationTier('openSpace')}
              >
                <Icon icon="ri:add-line" className="me-1" />
                Ajouter un palier
              </Button>
            </Card.Body>
          </Card>
        </Col>

        {/* Politique d'annulation Salles de Réunion */}
        <Col xl={6}>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                <Icon icon="ri:close-circle-line" className="me-2" />
                Annulation Salles de Réunion
              </h5>
            </Card.Header>
            <Card.Body>
              <p className="text-muted small mb-3">
                Politique d'annulation pour les salles de réunion (étage, verrière)
              </p>
              <Table striped bordered hover size="sm">
                <thead>
                  <tr>
                    <th>Jours avant réservation</th>
                    <th>% encaissé</th>
                    <th style={{ width: "50px" }}></th>
                  </tr>
                </thead>
                <tbody>
                  {(settings.cancellationPolicyMeetingRooms || []).map((tier, index) => (
                    <tr key={index}>
                      <td>
                        <Form.Control
                          type="number"
                          size="sm"
                          value={tier.daysBeforeBooking}
                          onChange={(e) =>
                            updateCancellationTier(
                              'meetingRooms',
                              index,
                              "daysBeforeBooking",
                              parseInt(e.target.value) || 0
                            )
                          }
                          min="0"
                        />
                      </td>
                      <td>
                        <Form.Control
                          type="number"
                          size="sm"
                          value={tier.chargePercentage}
                          onChange={(e) =>
                            updateCancellationTier(
                              'meetingRooms',
                              index,
                              "chargePercentage",
                              parseInt(e.target.value) || 0
                            )
                          }
                          min="0"
                          max="100"
                        />
                      </td>
                      <td className="text-center">
                        <Button
                          variant="link"
                          size="sm"
                          className="text-danger p-0"
                          onClick={() => removeCancellationTier('meetingRooms', index)}
                        >
                          <Icon icon="ri:delete-bin-line" width={18} />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              <Button
                variant="outline-primary"
                size="sm"
                onClick={() => addCancellationTier('meetingRooms')}
              >
                <Icon icon="ri:add-line" className="me-1" />
                Ajouter un palier
              </Button>
            </Card.Body>
          </Card>
        </Col>

        {/* Horaires Cron Jobs */}
        <Col xl={6}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">
                <Icon icon="ri:time-line" className="me-2" />
                Automatisations
              </h5>
            </Card.Header>
            <Card.Body>
              <Form.Group className="mb-3">
                <Form.Label>
                  Vérification présence (réservations J-1)
                </Form.Label>
                <Form.Control
                  type="time"
                  value={settings.cronSchedules.attendanceCheckTime}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      cronSchedules: {
                        ...settings.cronSchedules,
                        attendanceCheckTime: e.target.value,
                      },
                    })
                  }
                />
                <Form.Text className="text-muted">
                  Heure de vérification automatique des présences (encaissement
                  si non validé)
                </Form.Text>
              </Form.Group>

              <Form.Group>
                <Form.Label>Email récapitulatif quotidien</Form.Label>
                <Form.Control
                  type="time"
                  value={settings.cronSchedules.dailyReportTime}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      cronSchedules: {
                        ...settings.cronSchedules,
                        dailyReportTime: e.target.value,
                      },
                    })
                  }
                />
                <Form.Text className="text-muted">
                  Heure d'envoi du récapitulatif des réservations non validées
                </Form.Text>
              </Form.Group>
            </Card.Body>
          </Card>

          {/* Email de notification */}
          <Card className="mt-4">
            <Card.Header>
              <h5 className="mb-0">
                <Icon icon="ri:mail-line" className="me-2" />
                Notifications
              </h5>
            </Card.Header>
            <Card.Body>
              <Form.Group>
                <Form.Label>Email de destination</Form.Label>
                <Form.Control
                  type="email"
                  value={settings.notificationEmail}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      notificationEmail: e.target.value,
                    })
                  }
                  placeholder="strasbourg@coworkingcafe.fr"
                />
                <Form.Text className="text-muted">
                  Email pour recevoir les rapports quotidiens
                </Form.Text>
              </Form.Group>
            </Card.Body>
          </Card>
        </Col>

        {/* Politique d'accompte */}
        <Col xl={12}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">
                <Icon icon="ri:money-euro-circle-line" className="me-2" />
                Politique d'accompte
              </h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Montant minimum requis (€)</Form.Label>
                    <Form.Control
                      type="number"
                      value={settings.depositPolicy.minAmountRequired}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          depositPolicy: {
                            ...settings.depositPolicy,
                            minAmountRequired: parseFloat(e.target.value),
                          },
                        })
                      }
                      min="0"
                    />
                    <Form.Text className="text-muted">
                      Réservations au-delà de ce montant nécessitent un accompte
                    </Form.Text>
                  </Form.Group>
                </Col>

                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Pourcentage par défaut (%)</Form.Label>
                    <Form.Control
                      type="number"
                      value={settings.depositPolicy.defaultPercent}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          depositPolicy: {
                            ...settings.depositPolicy,
                            defaultPercent: parseInt(e.target.value),
                          },
                        })
                      }
                      min="0"
                      max="100"
                    />
                    <Form.Text className="text-muted">
                      Montant de l'accompte suggéré
                    </Form.Text>
                  </Form.Group>
                </Col>

                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Espaces concernés</Form.Label>
                    <Form.Select
                      multiple
                      value={settings.depositPolicy.applyToSpaces}
                      onChange={(e) => {
                        const selected = Array.from(
                          e.target.selectedOptions,
                          (option) => option.value
                        );
                        setSettings({
                          ...settings,
                          depositPolicy: {
                            ...settings.depositPolicy,
                            applyToSpaces: selected,
                          },
                        });
                      }}
                    >
                      <option value="open-space">Open-space</option>
                      <option value="salle-verriere">Salle Verrière</option>
                      <option value="salle-etage">Salle Étage</option>
                      <option value="evenementiel">Événementiel</option>
                    </Form.Select>
                    <Form.Text className="text-muted">
                      Types d'espaces nécessitant un accompte (Ctrl+clic pour sélection multiple)
                    </Form.Text>
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Boutons d'action */}
      <div className="d-flex justify-content-end gap-2 mt-4 mb-5">
        <Button
          variant="outline-secondary"
          onClick={fetchSettings}
          disabled={saving}
        >
          <Icon icon="ri:refresh-line" className="me-1" />
          Annuler
        </Button>
        <Button variant="primary" onClick={handleSave} disabled={saving}>
          {saving ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" />
              Enregistrement...
            </>
          ) : (
            <>
              <Icon icon="ri:save-line" className="me-1" />
              Enregistrer
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
