"use client";

import { useEffect, useState } from "react";
import { Card, Button, Table, Badge, Modal, Form, Row, Col, Alert, ProgressBar } from "react-bootstrap";
import { Icon } from "@iconify/react";
import { useTopbarContext } from "@/context/useTopbarContext";
import ContractTemplateCDI from "@/components/hr/ContractTemplateCDI";
import OnboardingWizard from "@/components/hr/OnboardingWizard";

interface Employee {
  _id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  placeOfBirth: string;
  address: {
    street: string;
    postalCode: string;
    city: string;
  };
  email: string;
  phone: string;
  socialSecurityNumber: string;
  contractType: 'CDI' | 'CDD' | 'Stage';
  contractualHours: number;
  level: string;
  step: number;
  hourlyRate: number;
  employeeRole: 'Manager' | 'Employé';
  isActive: boolean;
  hireDate: string;
  hireTime?: string;
  endDate?: string;
  endContractReason?: 'démission' | 'fin-periode-essai' | 'rupture';
  onboardingStatus: {
    step1Completed?: boolean;
    step2Completed?: boolean;
    step3Completed?: boolean;
    step4Completed?: boolean;
    contractGenerated: boolean;
    dpaeCompleted: boolean;
    dpaeCompletedAt?: Date;
    medicalVisitCompleted?: boolean;
    medicalVisitCompletedAt?: Date;
    mutuelleCompleted?: boolean;
    mutuelleCompletedAt?: Date;
    bankDetailsProvided: boolean;
    bankDetailsProvidedAt?: Date;
    registerCompleted?: boolean;
    registerCompletedAt?: Date;
    contractSent: boolean;
  };
  workSchedule?: {
    weeklyDistribution: string;
    timeSlots: string;
  };
  availability?: {
    monday?: AvailabilityDay;
    tuesday?: AvailabilityDay;
    wednesday?: AvailabilityDay;
    thursday?: AvailabilityDay;
    friday?: AvailabilityDay;
    saturday?: AvailabilityDay;
    sunday?: AvailabilityDay;
  };
  clockingCode?: string;
  employeeColor?: string;
}

interface TimeSlot {
  start: string;
  end: string;
}

interface AvailabilityDay {
  available: boolean;
  slots: TimeSlot[];
}

interface NewEmployee {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  placeOfBirth: string;
  address: {
    street: string;
    postalCode: string;
    city: string;
  };
  phone: string;
  email: string;
  socialSecurityNumber: string;
  contractType: 'CDI' | 'CDD' | 'Stage';
  contractualHours: number;
  hireDate: string;
  hireTime?: string;
  endDate?: string;
  level: string;
  step: number;
  hourlyRate: number;
  clockingCode: string;
  employeeRole: 'Manager' | 'Employé';
  availability: {
    monday: AvailabilityDay;
    tuesday: AvailabilityDay;
    wednesday: AvailabilityDay;
    thursday: AvailabilityDay;
    friday: AvailabilityDay;
    saturday: AvailabilityDay;
    sunday: AvailabilityDay;
  };
}

const defaultAvailability: AvailabilityDay = {
  available: true,
  slots: [{ start: '09:00', end: '18:00' }],
};

export default function EmployeesPage() {
  const { setPageTitle, setPageActions } = useTopbarContext();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showOnboardingWizard, setShowOnboardingWizard] = useState(false);
  const [showContractModal, setShowContractModal] = useState(false);
  const [showResignModal, setShowResignModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [endContractDate, setEndContractDate] = useState<string>("");
  const [endContractReason, setEndContractReason] = useState<'démission' | 'fin-periode-essai' | 'rupture' | ''>("");

  const [newEmployee, setNewEmployee] = useState<NewEmployee>({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    placeOfBirth: "",
    address: {
      street: "",
      postalCode: "",
      city: "",
    },
    phone: "",
    email: "",
    socialSecurityNumber: "",
    contractType: "CDI",
    contractualHours: 35,
    hireDate: "",
    hireTime: "9H30",
    level: "I",
    step: 1,
    hourlyRate: 12.50,
    clockingCode: "",
    employeeRole: "Employé",
    availability: {
      monday: { ...defaultAvailability },
      tuesday: { ...defaultAvailability },
      wednesday: { ...defaultAvailability },
      thursday: { ...defaultAvailability },
      friday: { ...defaultAvailability },
      saturday: { available: false, slots: [] },
      sunday: { available: false, slots: [] },
    },
  });

  useEffect(() => {
    setPageTitle('Gestion des Employés');
    setPageActions(
      <div style={{ display: 'flex', gap: '8px' }}>
        <Button
          onClick={() => setShowArchived(!showArchived)}
          style={{
            padding: '8px 16px',
            background: showArchived ? '#ef4444' : 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 500,
            color: showArchived ? 'white' : '#374151',
            cursor: 'pointer',
            transition: 'all 0.3s',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <Icon icon={showArchived ? "ri:eye-off-line" : "ri:archive-line"} width={16} />
          {showArchived ? 'Masquer archivés' : 'Voir archivés'}
        </Button>
        <Button
          onClick={() => setShowCreateModal(true)}
          style={{
            padding: '8px 16px',
            background: '#14b8a6',
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
          }}
        >
          <Icon icon="ri:add-line" width={16} />
          Nouvel Employé
        </Button>
      </div>
    );

    return () => {
      setPageTitle('Dashboard');
      setPageActions(null);
    };
  }, [setPageTitle, setPageActions, showArchived]);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      // Inclure les employés supprimés pour pouvoir les afficher dans les archivés
      const response = await fetch("/api/hr/employees?includeDeleted=true");
      const data = await response.json();

      if (data.success) {
        setEmployees(data.data);
      } else {
        setMessage({ type: "error", text: "Erreur lors du chargement des employés" });
      }
    } catch (error) {      setMessage({ type: "error", text: "Erreur lors du chargement des employés" });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEmployee = async () => {
    try {
      setSaving(true);

      // Validation
      if (!newEmployee.firstName || !newEmployee.lastName || !newEmployee.email) {
        setMessage({ type: "error", text: "Veuillez remplir tous les champs obligatoires" });
        return;
      }

      // Valider le format du numéro de sécu (15 chiffres)
      if (!/^\d{15}$/.test(newEmployee.socialSecurityNumber)) {
        setMessage({ type: "error", text: "Le numéro de sécurité sociale doit contenir 15 chiffres" });
        return;
      }

      // Valider le code de pointage (4 chiffres)
      if (!/^\d{4}$/.test(newEmployee.clockingCode)) {
        setMessage({ type: "error", text: "Le code de pointage doit contenir 4 chiffres" });
        return;
      }

      const response = await fetch("/api/hr/employees", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...newEmployee,
          onboardingStatus: {
            step1Completed: true,
          },
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: "success", text: "Employé créé avec succès" });
        setShowCreateModal(false);
        fetchEmployees();
        // Reset form
        setNewEmployee({
          firstName: "",
          lastName: "",
          dateOfBirth: "",
          placeOfBirth: "",
          address: {
            street: "",
            postalCode: "",
            city: "",
          },
          phone: "",
          email: "",
          socialSecurityNumber: "",
          contractType: "CDI",
          contractualHours: 35,
          hireDate: "",
          level: "I",
          step: 1,
          hourlyRate: 12.50,
          clockingCode: "",
          employeeRole: "Employé",
          availability: {
            monday: { ...defaultAvailability },
            tuesday: { ...defaultAvailability },
            wednesday: { ...defaultAvailability },
            thursday: { ...defaultAvailability },
            friday: { ...defaultAvailability },
            saturday: { available: false, slots: [] },
            sunday: { available: false, slots: [] },
          },
        });
      } else {
        setMessage({ type: "error", text: data.error || "Erreur lors de la création" });
      }
    } catch (error) {      setMessage({ type: "error", text: "Erreur lors de la création" });
    } finally {
      setSaving(false);
    }
  };

  const handleEditEmployee = async (employee: Employee) => {
    try {
      // Charger les détails complets de l'employé
      const response = await fetch(`/api/hr/employees/${employee._id}`);
      const data = await response.json();

      if (data.success) {
        // Convertir les dates au format YYYY-MM-DD pour les inputs
        const employeeData = {
          ...data.data,
          dateOfBirth: data.data.dateOfBirth ? new Date(data.data.dateOfBirth).toISOString().split('T')[0] : '',
          hireDate: data.data.hireDate ? new Date(data.data.hireDate).toISOString().split('T')[0] : '',
        };
        setSelectedEmployee(employeeData);
        setShowEditModal(true);
      }
    } catch (error) {      setMessage({ type: "error", text: "Erreur lors du chargement de l'employé" });
    }
  };

  const handleUpdateEmployee = async () => {
    if (!selectedEmployee) return;

    try {
      setSaving(true);

      const response = await fetch(`/api/hr/employees/${selectedEmployee._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(selectedEmployee),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: "success", text: "Employé mis à jour avec succès" });
        setShowEditModal(false);
        fetchEmployees();
      } else {
        setMessage({ type: "error", text: data.error || "Erreur lors de la mise à jour" });
      }
    } catch (error) {      setMessage({ type: "error", text: "Erreur lors de la mise à jour" });
    } finally {
      setSaving(false);
    }
  };

  const handleResignEmployee = async () => {
    if (!selectedEmployee) return;

    if (!endContractDate) {
      setMessage({ type: "error", text: "Veuillez saisir une date de fin de contrat" });
      return;
    }

    if (!endContractReason) {
      setMessage({ type: "error", text: "Veuillez sélectionner un motif de fin de contrat" });
      return;
    }

    try {
      setSaving(true);

      const endDate = new Date(endContractDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      endDate.setHours(0, 0, 0, 0);

      // Si la date de fin est dans le futur, on met à jour l'employé avec la date de fin
      // mais on le laisse actif jusqu'à cette date
      if (endDate > today) {
        const response = await fetch(`/api/hr/employees/${selectedEmployee._id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...selectedEmployee,
            endDate: endContractDate,
            endContractReason: endContractReason,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          setMessage({
            type: "success",
            text: `Date de fin de contrat enregistrée (${endDate.toLocaleDateString('fr-FR')}). L'employé sera automatiquement archivé à cette date.`
          });
          setShowResignModal(false);
          setSelectedEmployee(null);
          setEndContractDate("");
          setEndContractReason("");
          fetchEmployees();
        } else {
          setMessage({ type: "error", text: data.error || "Erreur lors de l'enregistrement" });
        }
      } else {
        // Si la date de fin est passée ou aujourd'hui, mettre à jour d'abord puis archiver
        // 1. D'abord mettre à jour avec la date de fin et le motif
        const updateResponse = await fetch(`/api/hr/employees/${selectedEmployee._id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...selectedEmployee,
            endDate: endContractDate,
            endContractReason: endContractReason,
          }),
        });

        if (!updateResponse.ok) {
          setMessage({ type: "error", text: "Erreur lors de la mise à jour" });
          return;
        }

        // 2. Ensuite archiver
        const deleteResponse = await fetch(`/api/hr/employees/${selectedEmployee._id}`, {
          method: "DELETE",
        });

        const data = await deleteResponse.json();

        if (deleteResponse.ok) {
          setMessage({ type: "success", text: "Employé archivé (fin de contrat)" });
          setShowResignModal(false);
          setSelectedEmployee(null);
          setEndContractDate("");
          setEndContractReason("");
          fetchEmployees();
        } else {
          setMessage({ type: "error", text: data.error || "Erreur lors de l'archivage" });
        }
      }
    } catch (error) {      setMessage({ type: "error", text: "Erreur lors de l'archivage" });
    } finally {
      setSaving(false);
    }
  };

  const handleContractGenerated = async () => {
    if (!selectedEmployee) return;

    try {
      const response = await fetch(`/api/hr/employees/${selectedEmployee._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          onboardingStatus: {
            ...selectedEmployee.onboardingStatus,
            step4Completed: true,
            contractGenerated: true,
            contractGeneratedAt: new Date(),
          },
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: "success", text: "Contrat généré avec succès" });
        fetchEmployees();
      } else {
        setMessage({ type: "error", text: data.error || "Erreur lors de la mise à jour du statut" });
      }
    } catch (error) {      setMessage({ type: "error", text: "Erreur lors de la mise à jour du statut" });
    }
  };

  const handleStartOnboarding = (employee: Employee) => {
    setSelectedEmployee(employee);
    setShowOnboardingWizard(true);
  };

  const handleViewContract = (employee: Employee) => {
    setSelectedEmployee(employee);
    setShowContractModal(true);
  };

  const handleOnboardingComplete = () => {
    fetchEmployees();
  };

  const updateAvailability = (day: keyof typeof newEmployee.availability, available: boolean) => {
    setNewEmployee(prev => ({
      ...prev,
      availability: {
        ...prev.availability,
        [day]: {
          available,
          slots: available ? prev.availability[day].slots : [],
        },
      },
    }));
  };

  const updateTimeSlot = (day: keyof typeof newEmployee.availability, slotIndex: number, field: 'start' | 'end', value: string) => {
    setNewEmployee(prev => {
      const newSlots = [...prev.availability[day].slots];
      newSlots[slotIndex] = { ...newSlots[slotIndex], [field]: value };
      return {
        ...prev,
        availability: {
          ...prev.availability,
          [day]: {
            ...prev.availability[day],
            slots: newSlots,
          },
        },
      };
    });
  };

  const addTimeSlot = (day: keyof typeof newEmployee.availability) => {
    setNewEmployee(prev => ({
      ...prev,
      availability: {
        ...prev.availability,
        [day]: {
          ...prev.availability[day],
          slots: [...prev.availability[day].slots, { start: '09:00', end: '18:00' }],
        },
      },
    }));
  };

  const removeTimeSlot = (day: keyof typeof newEmployee.availability, slotIndex: number) => {
    setNewEmployee(prev => ({
      ...prev,
      availability: {
        ...prev.availability,
        [day]: {
          ...prev.availability[day],
          slots: prev.availability[day].slots.filter((_, i) => i !== slotIndex),
        },
      },
    }));
  };

  // Fonctions pour gérer les créneaux dans l'édition
  const updateEditAvailability = (day: string, available: boolean) => {
    if (!selectedEmployee) return;

    const availability = selectedEmployee.availability || {};
    const dayData = availability[day as keyof typeof availability] || { available: true, slots: [] };

    setSelectedEmployee({
      ...selectedEmployee,
      availability: {
        ...availability,
        [day]: {
          available,
          slots: available ? dayData.slots : [],
        },
      },
    });
  };

  const updateEditTimeSlot = (day: string, slotIndex: number, field: 'start' | 'end', value: string) => {
    if (!selectedEmployee) return;

    const availability = selectedEmployee.availability || {};
    const dayData = availability[day as keyof typeof availability] || { available: true, slots: [] };
    const newSlots = [...(dayData.slots || [])];
    newSlots[slotIndex] = { ...newSlots[slotIndex], [field]: value };

    setSelectedEmployee({
      ...selectedEmployee,
      availability: {
        ...availability,
        [day]: {
          ...dayData,
          slots: newSlots,
        },
      },
    });
  };

  const addEditTimeSlot = (day: string) => {
    if (!selectedEmployee) return;

    const availability = selectedEmployee.availability || {};
    const dayData = availability[day as keyof typeof availability] || { available: true, slots: [] };

    setSelectedEmployee({
      ...selectedEmployee,
      availability: {
        ...availability,
        [day]: {
          ...dayData,
          slots: [...(dayData.slots || []), { start: '09:00', end: '18:00' }],
        },
      },
    });
  };

  const removeEditTimeSlot = (day: string, slotIndex: number) => {
    if (!selectedEmployee) return;

    const availability = selectedEmployee.availability || {};
    const dayData = availability[day as keyof typeof availability] || { available: true, slots: [] };

    setSelectedEmployee({
      ...selectedEmployee,
      availability: {
        ...availability,
        [day]: {
          ...dayData,
          slots: (dayData.slots || []).filter((_, i) => i !== slotIndex),
        },
      },
    });
  };

  const getOnboardingProgress = (employee: Employee) => {
    const steps = [
      employee.onboardingStatus.step1Completed,
      employee.onboardingStatus.step2Completed,
      employee.onboardingStatus.step3Completed,
      employee.onboardingStatus.step4Completed,
    ];
    const completed = steps.filter(Boolean).length;
    return Math.round((completed / steps.length) * 100);
  };

  const dayLabels: Record<string, string> = {
    monday: 'Lundi',
    tuesday: 'Mardi',
    wednesday: 'Mercredi',
    thursday: 'Jeudi',
    friday: 'Vendredi',
    saturday: 'Samedi',
    sunday: 'Dimanche',
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
        >
          {message.text}
        </Alert>
      )}

      <Card className="border-0 shadow-sm">
        <Card.Body>
          <div className="table-responsive">
            <Table hover className="align-middle mb-0">
              <thead className="table-light">
                {showArchived ? (
                  <tr>
                    <th>Nom</th>
                    <th>Date de sortie</th>
                    <th>Motif</th>
                    <th style={{ width: "100px" }}>Actions</th>
                  </tr>
                ) : (
                  <tr>
                    <th>Nom</th>
                    <th>Email</th>
                    <th>Téléphone</th>
                    <th>Contrat</th>
                    <th>Heures</th>
                    <th>Rôle</th>
                    <th>Onboarding</th>
                    <th>Statut</th>
                    <th style={{ width: "100px" }}>Actions</th>
                  </tr>
                )}
              </thead>
              <tbody>
                {employees.filter(emp => showArchived ? !emp.isActive || (emp as any).deletedAt : emp.isActive && !(emp as any).deletedAt).length === 0 ? (
                  <tr>
                    <td colSpan={showArchived ? 4 : 9} className="text-center text-muted py-5">
                      <Icon icon="ri:user-line" width={48} className="mb-3 opacity-50" />
                      <p>{showArchived ? 'Aucun employé archivé' : 'Aucun employé actif trouvé'}</p>
                      {!showArchived && (
                        <Button variant="primary" onClick={() => setShowCreateModal(true)}>
                          Créer le premier employé
                        </Button>
                      )}
                    </td>
                  </tr>
                ) : (
                  employees
                    .filter(emp => showArchived ? !emp.isActive || (emp as any).deletedAt : emp.isActive && !(emp as any).deletedAt)
                    .map((employee) => (
                    showArchived ? (
                      <tr key={employee._id}>
                        <td>
                          <div>
                            <div className="fw-medium">{employee.firstName} {employee.lastName}</div>
                            <small className="text-muted">{employee.employeeRole}</small>
                          </div>
                        </td>
                        <td>
                          {employee.endDate ? (
                            <div>
                              <div>{new Date(employee.endDate).toLocaleDateString('fr-FR')}</div>
                            </div>
                          ) : (
                            <small className="text-muted">Non renseignée</small>
                          )}
                        </td>
                        <td>
                          {employee.endContractReason ? (
                            <Badge bg="secondary">
                              {employee.endContractReason === 'démission' && 'Démission'}
                              {employee.endContractReason === 'fin-periode-essai' && 'Fin de période d\'essai'}
                              {employee.endContractReason === 'rupture' && 'Rupture'}
                            </Badge>
                          ) : (
                            <small className="text-muted">Non renseigné</small>
                          )}
                        </td>
                        <td>
                          <div className="d-flex gap-1">
                            <Button
                              size="sm"
                              variant="outline-secondary"
                              onClick={() => handleEditEmployee(employee)}
                              title="Voir les détails"
                            >
                              <Icon icon="ri:eye-line" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline-primary"
                              onClick={() => handleViewContract(employee)}
                              title="Voir le contrat"
                            >
                              <Icon icon="ri:file-text-line" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      <tr key={employee._id}>
                        <td>
                          <div>
                            <div className="fw-medium">{employee.firstName} {employee.lastName}</div>
                            <small className="text-muted">{employee.employeeRole}</small>
                          </div>
                        </td>
                        <td>{employee.email}</td>
                        <td>{employee.phone}</td>
                        <td>
                          <Badge bg="light" text="dark">
                            {employee.contractType}
                          </Badge>
                        </td>
                        <td>{employee.contractualHours}h</td>
                        <td>
                          <Badge bg={employee.employeeRole === 'Manager' ? 'primary' : 'secondary'}>
                            {employee.employeeRole}
                          </Badge>
                        </td>
                        <td>
                          <div style={{ minWidth: '120px' }}>
                            <ProgressBar
                              now={getOnboardingProgress(employee)}
                              label={`${getOnboardingProgress(employee)}%`}
                              variant={getOnboardingProgress(employee) === 100 ? 'success' : 'warning'}
                              style={{ height: '20px' }}
                            />
                          </div>
                        </td>
                        <td>
                          {employee.isActive && employee.endDate && new Date(employee.endDate) > new Date() ? (
                            <div>
                              <Badge bg="warning" className="mb-1">
                                Actif - Fin prévue
                              </Badge>
                              <div>
                                <small className="text-muted">
                                  {new Date(employee.endDate).toLocaleDateString('fr-FR')}
                                </small>
                              </div>
                            </div>
                          ) : (
                            <Badge bg={employee.isActive ? "success" : "danger"}>
                              {employee.isActive ? "Actif" : "Archivé"}
                            </Badge>
                          )}
                        </td>
                        <td>
                          <div className="d-flex gap-1">
                            {employee.isActive && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline-secondary"
                                  onClick={() => handleEditEmployee(employee)}
                                  title="Modifier"
                                >
                                  <Icon icon="ri:edit-line" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline-primary"
                                  onClick={() => handleStartOnboarding(employee)}
                                  title="Continuer l'onboarding"
                                >
                                  <Icon icon="ri:file-list-3-line" />
                                </Button>
                                {employee.onboardingStatus.step4Completed && (
                                  <Button
                                    size="sm"
                                    variant="outline-success"
                                    onClick={() => handleViewContract(employee)}
                                    title="Voir le contrat"
                                  >
                                    <Icon icon="ri:file-text-line" />
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  variant="outline-danger"
                                  onClick={() => {
                                    setSelectedEmployee(employee);
                                    setEndContractDate("");
                                    setEndContractReason("");
                                    setShowResignModal(true);
                                  }}
                                  title="Fin de contrat"
                                >
                                  <Icon icon="ri:user-unfollow-line" />
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  ))
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* Modal de création - Step 1 */}
      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} size="xl" centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <Icon icon="ri:user-add-line" className="me-2" />
            Nouvel Employé - Étape 1/4 : Informations & Coordonnées
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {message && showCreateModal && (
            <Alert
              variant={message.type === "success" ? "success" : "danger"}
              dismissible
              onClose={() => setMessage(null)}
              className="mb-3"
            >
              {message.text}
            </Alert>
          )}
          <Form>
            {/* Informations personnelles */}
            <h6 className="mb-3 text-primary">
              <Icon icon="ri:user-line" className="me-2" />
              Informations Personnelles
            </h6>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Prénom *</Form.Label>
                  <Form.Control
                    type="text"
                    value={newEmployee.firstName}
                    onChange={(e) => setNewEmployee({ ...newEmployee, firstName: e.target.value })}
                    placeholder="Jean"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Nom *</Form.Label>
                  <Form.Control
                    type="text"
                    value={newEmployee.lastName}
                    onChange={(e) => setNewEmployee({ ...newEmployee, lastName: e.target.value })}
                    placeholder="Dupont"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Date de naissance *</Form.Label>
                  <Form.Control
                    type="date"
                    value={newEmployee.dateOfBirth}
                    onChange={(e) => setNewEmployee({ ...newEmployee, dateOfBirth: e.target.value })}
                    min="1900-01-01"
                    max={new Date().toISOString().split('T')[0]}
                  />
                  <Form.Text className="text-muted">
                    Format: JJ/MM/AAAA
                  </Form.Text>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Lieu de naissance *</Form.Label>
                  <Form.Control
                    type="text"
                    value={newEmployee.placeOfBirth}
                    onChange={(e) => setNewEmployee({ ...newEmployee, placeOfBirth: e.target.value })}
                    placeholder="Paris"
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>N° Sécurité Sociale (15 chiffres) *</Form.Label>
                  <Form.Control
                    type="text"
                    value={newEmployee.socialSecurityNumber}
                    onChange={(e) => setNewEmployee({ ...newEmployee, socialSecurityNumber: e.target.value.replace(/\s/g, '') })}
                    placeholder="123456789012345"
                    maxLength={15}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Adresse *</Form.Label>
                  <Form.Control
                    type="text"
                    value={newEmployee.address.street}
                    onChange={(e) => setNewEmployee({ ...newEmployee, address: { ...newEmployee.address, street: e.target.value } })}
                    placeholder="12 rue de la Paix"
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Code postal *</Form.Label>
                  <Form.Control
                    type="text"
                    value={newEmployee.address.postalCode}
                    onChange={(e) => setNewEmployee({ ...newEmployee, address: { ...newEmployee.address, postalCode: e.target.value } })}
                    placeholder="67000"
                    maxLength={5}
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Ville *</Form.Label>
                  <Form.Control
                    type="text"
                    value={newEmployee.address.city}
                    onChange={(e) => setNewEmployee({ ...newEmployee, address: { ...newEmployee.address, city: e.target.value } })}
                    placeholder="Strasbourg"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Téléphone *</Form.Label>
                  <Form.Control
                    type="tel"
                    value={newEmployee.phone}
                    onChange={(e) => setNewEmployee({ ...newEmployee, phone: e.target.value })}
                    placeholder="06 12 34 56 78"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Email *</Form.Label>
                  <Form.Control
                    type="email"
                    value={newEmployee.email}
                    onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
                    placeholder="jean.dupont@example.com"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-4">
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label>Code de pointage (4 chiffres) *</Form.Label>
                  <Form.Control
                    type="text"
                    value={newEmployee.clockingCode}
                    onChange={(e) => setNewEmployee({ ...newEmployee, clockingCode: e.target.value.replace(/\D/g, '') })}
                    placeholder="1234"
                    maxLength={4}
                  />
                  <Form.Text className="text-muted">
                    Code PIN pour le système de pointage
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>

            {/* Informations contractuelles */}
            <h6 className="mb-3 text-primary">
              <Icon icon="ri:file-text-line" className="me-2" />
              Informations Contractuelles
            </h6>
            <Row className="mb-3">
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Type de contrat *</Form.Label>
                  <Form.Select
                    value={newEmployee.contractType}
                    onChange={(e) => setNewEmployee({ ...newEmployee, contractType: e.target.value as 'CDI' | 'CDD' | 'Stage' })}
                  >
                    <option value="CDI">CDI</option>
                    <option value="CDD">CDD</option>
                    <option value="Stage">Stage</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Heures hebdomadaires *</Form.Label>
                  <Form.Select
                    value={newEmployee.contractualHours}
                    onChange={(e) => setNewEmployee({ ...newEmployee, contractualHours: parseInt(e.target.value) })}
                  >
                    <option value={12}>12h</option>
                    <option value={15}>15h</option>
                    <option value={18}>18h</option>
                    <option value={35}>35h</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Rôle *</Form.Label>
                  <Form.Select
                    value={newEmployee.employeeRole}
                    onChange={(e) => setNewEmployee({ ...newEmployee, employeeRole: e.target.value as 'Manager' | 'Employé' })}
                  >
                    <option value="Employé">Employé</option>
                    <option value="Manager">Manager</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-4">
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Date d'embauche *</Form.Label>
                  <Form.Control
                    type="date"
                    value={newEmployee.hireDate}
                    onChange={(e) => setNewEmployee({ ...newEmployee, hireDate: e.target.value })}
                    min="1900-01-01"
                    max="2100-12-31"
                  />
                  <Form.Text className="text-muted">
                    Format: JJ/MM/AAAA
                  </Form.Text>
                </Form.Group>
              </Col>
              <Col md={2}>
                <Form.Group className="mb-3">
                  <Form.Label>Heure d'entrée</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="9H30"
                    value={newEmployee.hireTime || ''}
                    onChange={(e) => setNewEmployee({ ...newEmployee, hireTime: e.target.value })}
                  />
                </Form.Group>
              </Col>
              {(newEmployee.contractType === 'CDD' || newEmployee.contractType === 'Stage') && (
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Date de fin de contrat *</Form.Label>
                    <Form.Control
                      type="date"
                      value={newEmployee.endDate || ''}
                      onChange={(e) => setNewEmployee({ ...newEmployee, endDate: e.target.value })}
                      min={newEmployee.hireDate || '1900-01-01'}
                      max="2100-12-31"
                    />
                    <Form.Text className="text-muted">
                      Format: JJ/MM/AAAA
                    </Form.Text>
                  </Form.Group>
                </Col>
              )}
            </Row>

            {/* Rémunération */}
            <h6 className="mb-3 text-primary mt-4">
              <Icon icon="ri:money-euro-circle-line" className="me-2" />
              Rémunération
            </h6>
            <Row className="mb-3">
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Niveau *</Form.Label>
                  <Form.Select
                    value={newEmployee.level}
                    onChange={(e) => setNewEmployee({ ...newEmployee, level: e.target.value })}
                  >
                    <option value="I">Niveau I</option>
                    <option value="II">Niveau II</option>
                    <option value="III">Niveau III</option>
                    <option value="IV">Niveau IV</option>
                    <option value="V">Niveau V</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Échelon *</Form.Label>
                  <Form.Control
                    type="number"
                    value={newEmployee.step}
                    onChange={(e) => setNewEmployee({ ...newEmployee, step: parseInt(e.target.value) || 1 })}
                    min={1}
                    max={10}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Taux horaire (€) *</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    value={newEmployee.hourlyRate}
                    onChange={(e) => setNewEmployee({ ...newEmployee, hourlyRate: parseFloat(e.target.value) || 0 })}
                    min={0}
                    placeholder="12.50"
                  />
                  <Form.Text className="text-muted">
                    Salaire mensuel brut estimé: {(newEmployee.hourlyRate * newEmployee.contractualHours * 4.33).toFixed(2)}€
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>

            {/* Disponibilités */}
            <h6 className="mb-3 text-primary mt-4">
              <Icon icon="ri:calendar-line" className="me-2" />
              Disponibilités Horaires
            </h6>
            <div className="border rounded p-3">
              {Object.keys(newEmployee.availability).map((day) => {
                const dayKey = day as keyof typeof newEmployee.availability;
                const dayData = newEmployee.availability[dayKey];

                return (
                  <div key={day} className="mb-3 pb-3 border-bottom">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <Form.Check
                        type="switch"
                        id={`available-${day}`}
                        label={<strong>{dayLabels[day]}</strong>}
                        checked={dayData.available}
                        onChange={(e) => updateAvailability(dayKey, e.target.checked)}
                      />
                      {dayData.available && (
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => addTimeSlot(dayKey)}
                        >
                          <Icon icon="ri:add-line" className="me-1" />
                          Ajouter un créneau
                        </Button>
                      )}
                    </div>

                    {dayData.available && dayData.slots.map((slot, slotIndex) => (
                      <Row key={slotIndex} className="mb-2 align-items-end">
                        <Col md={5}>
                          <Form.Group>
                            <Form.Label className="small">Début</Form.Label>
                            <Form.Control
                              type="time"
                              size="sm"
                              value={slot.start}
                              onChange={(e) => updateTimeSlot(dayKey, slotIndex, 'start', e.target.value)}
                            />
                          </Form.Group>
                        </Col>
                        <Col md={5}>
                          <Form.Group>
                            <Form.Label className="small">Fin</Form.Label>
                            <Form.Control
                              type="time"
                              size="sm"
                              value={slot.end}
                              onChange={(e) => updateTimeSlot(dayKey, slotIndex, 'end', e.target.value)}
                            />
                          </Form.Group>
                        </Col>
                        <Col md={2}>
                          {dayData.slots.length > 1 && (
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => removeTimeSlot(dayKey, slotIndex)}
                            >
                              <Icon icon="ri:delete-bin-line" />
                            </Button>
                          )}
                        </Col>
                      </Row>
                    ))}
                  </div>
                );
              })}
            </div>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setShowCreateModal(false)}>
            Annuler
          </Button>
          <Button variant="primary" onClick={handleCreateEmployee} disabled={saving}>
            {saving ? "Création en cours..." : "Créer l'employé"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal d'édition - Simplifié pour l'instant */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <Icon icon="ri:edit-line" className="me-2" />
            Modifier l'employé
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {message && showEditModal && (
            <Alert
              variant={message.type === "success" ? "success" : "danger"}
              dismissible
              onClose={() => setMessage(null)}
              className="mb-3"
            >
              {message.text}
            </Alert>
          )}
          {selectedEmployee && (
            <Form>
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Prénom</Form.Label>
                    <Form.Control
                      type="text"
                      value={selectedEmployee.firstName}
                      onChange={(e) => setSelectedEmployee({ ...selectedEmployee, firstName: e.target.value })}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Nom</Form.Label>
                    <Form.Control
                      type="text"
                      value={selectedEmployee.lastName}
                      onChange={(e) => setSelectedEmployee({ ...selectedEmployee, lastName: e.target.value })}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Date de naissance</Form.Label>
                    <Form.Control
                      type="date"
                      value={selectedEmployee.dateOfBirth}
                      onChange={(e) => setSelectedEmployee({ ...selectedEmployee, dateOfBirth: e.target.value })}
                      min="1900-01-01"
                      max="2100-12-31"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Lieu de naissance</Form.Label>
                    <Form.Control
                      type="text"
                      value={selectedEmployee.placeOfBirth || ''}
                      onChange={(e) => setSelectedEmployee({ ...selectedEmployee, placeOfBirth: e.target.value })}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md={12}>
                  <Form.Group className="mb-3">
                    <Form.Label>Adresse</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Rue"
                      value={selectedEmployee.address?.street || ''}
                      onChange={(e) => setSelectedEmployee({
                        ...selectedEmployee,
                        address: {
                          street: e.target.value,
                          postalCode: selectedEmployee.address?.postalCode || '',
                          city: selectedEmployee.address?.city || ''
                        }
                      })}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Code postal</Form.Label>
                    <Form.Control
                      type="text"
                      value={selectedEmployee.address?.postalCode || ''}
                      onChange={(e) => setSelectedEmployee({
                        ...selectedEmployee,
                        address: {
                          street: selectedEmployee.address?.street || '',
                          postalCode: e.target.value,
                          city: selectedEmployee.address?.city || ''
                        }
                      })}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Ville</Form.Label>
                    <Form.Control
                      type="text"
                      value={selectedEmployee.address?.city || ''}
                      onChange={(e) => setSelectedEmployee({
                        ...selectedEmployee,
                        address: {
                          street: selectedEmployee.address?.street || '',
                          postalCode: selectedEmployee.address?.postalCode || '',
                          city: e.target.value
                        }
                      })}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      value={selectedEmployee.email}
                      onChange={(e) => setSelectedEmployee({ ...selectedEmployee, email: e.target.value })}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Téléphone</Form.Label>
                    <Form.Control
                      type="tel"
                      value={selectedEmployee.phone}
                      onChange={(e) => setSelectedEmployee({ ...selectedEmployee, phone: e.target.value })}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Numéro de sécurité sociale (15 chiffres)</Form.Label>
                    <Form.Control
                      type="text"
                      value={selectedEmployee.socialSecurityNumber}
                      onChange={(e) => setSelectedEmployee({ ...selectedEmployee, socialSecurityNumber: e.target.value })}
                      maxLength={15}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Code de pointage (4 chiffres)</Form.Label>
                    <Form.Control
                      type="text"
                      value={selectedEmployee.clockingCode}
                      onChange={(e) => setSelectedEmployee({ ...selectedEmployee, clockingCode: e.target.value })}
                      maxLength={4}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Type de contrat</Form.Label>
                    <Form.Select
                      value={selectedEmployee.contractType}
                      onChange={(e) => setSelectedEmployee({ ...selectedEmployee, contractType: e.target.value as 'CDI' | 'CDD' | 'Stage' })}
                    >
                      <option value="CDI">CDI</option>
                      <option value="CDD">CDD</option>
                      <option value="Stage">Stage</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Heures hebdomadaires</Form.Label>
                    <Form.Select
                      value={selectedEmployee.contractualHours}
                      onChange={(e) => setSelectedEmployee({ ...selectedEmployee, contractualHours: parseInt(e.target.value) })}
                    >
                      <option value={12}>12h</option>
                      <option value={15}>15h</option>
                      <option value={18}>18h</option>
                      <option value={35}>35h</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>Date d'embauche</Form.Label>
                    <Form.Control
                      type="date"
                      value={selectedEmployee.hireDate}
                      onChange={(e) => setSelectedEmployee({ ...selectedEmployee, hireDate: e.target.value })}
                      min="1900-01-01"
                      max="2100-12-31"
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>Heure d'entrée</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="9H30"
                      value={selectedEmployee.hireTime || ''}
                      onChange={(e) => setSelectedEmployee({ ...selectedEmployee, hireTime: e.target.value })}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>Niveau</Form.Label>
                    <Form.Select
                      value={selectedEmployee.level || ''}
                      onChange={(e) => setSelectedEmployee({ ...selectedEmployee, level: e.target.value })}
                    >
                      <option value="">Sélectionner</option>
                      <option value="I">I</option>
                      <option value="II">II</option>
                      <option value="III">III</option>
                      <option value="IV">IV</option>
                      <option value="V">V</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>Échelon</Form.Label>
                    <Form.Control
                      type="number"
                      min="1"
                      value={selectedEmployee.step || ''}
                      onChange={(e) => setSelectedEmployee({ ...selectedEmployee, step: parseInt(e.target.value) || 0 })}
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>Taux horaire (€)</Form.Label>
                    <Form.Control
                      type="number"
                      step="0.01"
                      min="0"
                      value={selectedEmployee.hourlyRate || ''}
                      onChange={(e) => setSelectedEmployee({ ...selectedEmployee, hourlyRate: parseFloat(e.target.value) || 0 })}
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>Rôle</Form.Label>
                    <Form.Select
                      value={selectedEmployee.employeeRole}
                      onChange={(e) => setSelectedEmployee({ ...selectedEmployee, employeeRole: e.target.value as 'Manager' | 'Employé' })}
                    >
                      <option value="Employé">Employé</option>
                      <option value="Manager">Manager</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              {selectedEmployee.endDate && (
                <Alert variant="warning" className="mb-3">
                  <strong>
                    <Icon icon="ri:calendar-event-line" className="me-2" />
                    Fin de contrat programmée
                  </strong>
                  <div className="mt-2">
                    <small>
                      <strong>Date :</strong> {new Date(selectedEmployee.endDate).toLocaleDateString('fr-FR')}
                      {selectedEmployee.endContractReason && (
                        <>
                          <br />
                          <strong>Motif :</strong>{' '}
                          {selectedEmployee.endContractReason === 'démission' && 'Démission'}
                          {selectedEmployee.endContractReason === 'fin-periode-essai' && 'Fin de période d\'essai'}
                          {selectedEmployee.endContractReason === 'rupture' && 'Rupture'}
                        </>
                      )}
                    </small>
                  </div>
                </Alert>
              )}

              {/* Disponibilités Horaires */}
              <h6 className="mb-3 text-primary mt-4">
                <Icon icon="ri:calendar-line" className="me-2" />
                Disponibilités Horaires
              </h6>
              <div className="border rounded p-3">
                {Object.keys(selectedEmployee.availability || {}).map((day) => {
                  const availability = selectedEmployee.availability || {};
                  const dayData = availability[day as keyof typeof availability];

                  // Convertir l'ancien format si nécessaire
                  let slots = dayData?.slots || [];
                  if (slots.length === 0 && (dayData as any)?.start && (dayData as any)?.end) {
                    slots = [{ start: (dayData as any).start, end: (dayData as any).end }];
                  }

                  return (
                    <div key={day} className="mb-3 pb-3 border-bottom">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <Form.Check
                          type="switch"
                          id={`edit-available-${day}`}
                          label={<strong>{dayLabels[day]}</strong>}
                          checked={dayData?.available || false}
                          onChange={(e) => updateEditAvailability(day, e.target.checked)}
                        />
                        {dayData?.available && (
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => addEditTimeSlot(day)}
                          >
                            <Icon icon="ri:add-line" className="me-1" />
                            Ajouter un créneau
                          </Button>
                        )}
                      </div>

                      {dayData?.available && slots.map((slot, slotIndex) => (
                        <Row key={slotIndex} className="mb-2 align-items-end">
                          <Col md={5}>
                            <Form.Group>
                              <Form.Label className="small">Début</Form.Label>
                              <Form.Control
                                type="time"
                                size="sm"
                                value={slot.start}
                                onChange={(e) => updateEditTimeSlot(day, slotIndex, 'start', e.target.value)}
                              />
                            </Form.Group>
                          </Col>
                          <Col md={5}>
                            <Form.Group>
                              <Form.Label className="small">Fin</Form.Label>
                              <Form.Control
                                type="time"
                                size="sm"
                                value={slot.end}
                                onChange={(e) => updateEditTimeSlot(day, slotIndex, 'end', e.target.value)}
                              />
                            </Form.Group>
                          </Col>
                          <Col md={2}>
                            {slots.length > 1 && (
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => removeEditTimeSlot(day, slotIndex)}
                              >
                                <Icon icon="ri:delete-bin-line" />
                              </Button>
                            )}
                          </Col>
                        </Row>
                      ))}
                    </div>
                  );
                })}
              </div>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setShowEditModal(false)}>
            Annuler
          </Button>
          <Button variant="primary" onClick={handleUpdateEmployee} disabled={saving}>
            {saving ? "Mise à jour..." : "Enregistrer"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal d'onboarding */}
      {selectedEmployee && (
        <OnboardingWizard
          show={showOnboardingWizard}
          onHide={() => setShowOnboardingWizard(false)}
          employee={selectedEmployee}
          onComplete={handleOnboardingComplete}
          onGenerateContract={() => {
            setShowOnboardingWizard(false);
            setShowContractModal(true);
          }}
        />
      )}

      {/* Modal de génération du contrat */}
      {selectedEmployee && (
        <ContractTemplateCDI
          show={showContractModal}
          onHide={() => setShowContractModal(false)}
          employee={selectedEmployee}
          onValidate={handleContractGenerated}
        />
      )}

      {/* Modal de fin de contrat */}
      <Modal show={showResignModal} onHide={() => setShowResignModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <Icon icon="ri:user-unfollow-line" className="me-2" />
            Fin de contrat
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {message && showResignModal && (
            <Alert
              variant={message.type === "success" ? "success" : "danger"}
              dismissible
              onClose={() => setMessage(null)}
              className="mb-3"
            >
              {message.text}
            </Alert>
          )}
          {selectedEmployee && (
            <>
              <Alert variant="info">
                <Icon icon="ri:information-line" className="me-2" />
                <strong>Saisissez la date de fin de contrat :</strong>
                <ul className="mb-0 mt-2">
                  <li>Si la date est <strong>future</strong> : le contrat reste actif jusqu'à cette date, puis sera archivé automatiquement</li>
                  <li>Si la date est <strong>passée ou aujourd'hui</strong> : l'employé sera archivé immédiatement</li>
                </ul>
              </Alert>

              <p className="mb-3">
                Enregistrer la fin de contrat pour{" "}
                <strong>{selectedEmployee.firstName} {selectedEmployee.lastName}</strong>
              </p>

              <Form.Group className="mb-3">
                <Form.Label>Motif de fin de contrat *</Form.Label>
                <div className="d-flex flex-column gap-2">
                  <Form.Check
                    type="radio"
                    id="reason-demission"
                    name="endContractReason"
                    label="Démission"
                    checked={endContractReason === 'démission'}
                    onChange={() => setEndContractReason('démission')}
                  />
                  <Form.Check
                    type="radio"
                    id="reason-periode-essai"
                    name="endContractReason"
                    label="Fin de période d'essai"
                    checked={endContractReason === 'fin-periode-essai'}
                    onChange={() => setEndContractReason('fin-periode-essai')}
                  />
                  <Form.Check
                    type="radio"
                    id="reason-rupture"
                    name="endContractReason"
                    label="Rupture"
                    checked={endContractReason === 'rupture'}
                    onChange={() => setEndContractReason('rupture')}
                  />
                </div>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Date de fin de contrat *</Form.Label>
                <Form.Control
                  type="date"
                  value={endContractDate}
                  onChange={(e) => setEndContractDate(e.target.value)}
                  min="1900-01-01"
                  max="2100-12-31"
                />
                <Form.Text className="text-muted">
                  Date à laquelle le contrat de l'employé prendra fin
                </Form.Text>
              </Form.Group>

              {endContractDate && (
                <Alert variant={new Date(endContractDate) > new Date() ? "warning" : "danger"}>
                  {new Date(endContractDate) > new Date() ? (
                    <>
                      <Icon icon="ri:calendar-line" className="me-2" />
                      Le contrat restera actif jusqu'au{" "}
                      <strong>{new Date(endContractDate).toLocaleDateString('fr-FR')}</strong>
                    </>
                  ) : (
                    <>
                      <Icon icon="ri:archive-line" className="me-2" />
                      L'employé sera archivé immédiatement
                    </>
                  )}
                </Alert>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setShowResignModal(false)}>
            Annuler
          </Button>
          <Button variant="danger" onClick={handleResignEmployee} disabled={saving || !endContractDate || !endContractReason}>
            {saving ? "Enregistrement..." : "Confirmer la fin de contrat"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
