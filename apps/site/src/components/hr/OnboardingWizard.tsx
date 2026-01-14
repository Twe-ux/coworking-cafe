"use client";

import { useState, useEffect } from "react";
import { Modal, Button, Form, Row, Col, Alert, ProgressBar } from "react-bootstrap";
import { Icon } from "@iconify/react";

interface Employee {
  _id: string;
  firstName: string;
  lastName: string;
  contractualHours: number;
  onboardingStatus: {
    step1Completed?: boolean;
    step2Completed?: boolean;
    step3Completed?: boolean;
    step4Completed?: boolean;
    dpaeCompleted?: boolean;
    dpaeCompletedAt?: Date;
    medicalVisitCompleted?: boolean;
    medicalVisitCompletedAt?: Date;
    mutuelleCompleted?: boolean;
    mutuelleCompletedAt?: Date;
    bankDetailsProvided?: boolean;
    bankDetailsProvidedAt?: Date;
    registerCompleted?: boolean;
    registerCompletedAt?: Date;
  };
  workSchedule?: {
    weeklyDistribution: string;
    timeSlots: string;
    weeklyDistributionData?: {
      [key: string]: { [week: string]: string };
    };
  };
  availability?: {
    monday?: { available: boolean; slots: Array<{ start: string; end: string }> };
    tuesday?: { available: boolean; slots: Array<{ start: string; end: string }> };
    wednesday?: { available: boolean; slots: Array<{ start: string; end: string }> };
    thursday?: { available: boolean; slots: Array<{ start: string; end: string }> };
    friday?: { available: boolean; slots: Array<{ start: string; end: string }> };
    saturday?: { available: boolean; slots: Array<{ start: string; end: string }> };
    sunday?: { available: boolean; slots: Array<{ start: string; end: string }> };
  };
}

interface OnboardingWizardProps {
  show: boolean;
  onHide: () => void;
  employee: Employee;
  onComplete: () => void;
  onGenerateContract: () => void;
}

export default function OnboardingWizard({
  show,
  onHide,
  employee,
  onComplete,
  onGenerateContract
}: OnboardingWizardProps) {
  // Constante des jours de la semaine
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  // Déterminer la step actuelle en fonction de ce qui a été complété
  const determineCurrentStep = () => {
    if (!employee.onboardingStatus.step2Completed) return 2;
    if (!employee.onboardingStatus.step3Completed) return 3;
    return 4;
  };

  const [currentStep, setCurrentStep] = useState(determineCurrentStep());
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Step 2: Documents administratifs
  const [step2Data, setStep2Data] = useState({
    dpaeCompleted: employee.onboardingStatus.dpaeCompleted,
    dpaeDate: employee.onboardingStatus.dpaeCompletedAt ? new Date(employee.onboardingStatus.dpaeCompletedAt).toISOString().split('T')[0] : '',
    medicalVisitCompleted: employee.onboardingStatus.medicalVisitCompleted,
    medicalVisitDate: employee.onboardingStatus.medicalVisitCompletedAt ? new Date(employee.onboardingStatus.medicalVisitCompletedAt).toISOString().split('T')[0] : '',
    mutuelleCompleted: employee.onboardingStatus.mutuelleCompleted,
    mutuelleDate: employee.onboardingStatus.mutuelleCompletedAt ? new Date(employee.onboardingStatus.mutuelleCompletedAt).toISOString().split('T')[0] : '',
    bankDetailsProvided: employee.onboardingStatus.bankDetailsProvided,
    bankDetailsDate: employee.onboardingStatus.bankDetailsProvidedAt ? new Date(employee.onboardingStatus.bankDetailsProvidedAt).toISOString().split('T')[0] : '',
    registerCompleted: employee.onboardingStatus.registerCompleted,
    registerDate: employee.onboardingStatus.registerCompletedAt ? new Date(employee.onboardingStatus.registerCompletedAt).toISOString().split('T')[0] : '',
  });

  // Step 3: Planning - Initialiser avec les disponibilités de l'employé
  const initializeWeeklySchedule = () => {
    const schedule: any = {};

    days.forEach(day => {
      const availability = employee.availability?.[day as keyof typeof employee.availability];

      // Rétrocompatibilité: si l'ancien format avec start/end existe, le convertir en slots
      let slots = availability?.slots || [];
      if (slots.length === 0 && (availability as any)?.start && (availability as any)?.end) {
        slots = [{ start: (availability as any).start, end: (availability as any).end }];
      }

      schedule[day] = {
        available: availability?.available || false,
        slots: slots,
      };
    });

    return schedule;
  };

  const [weeklySchedule, setWeeklySchedule] = useState(initializeWeeklySchedule());

  // Répartition par semaine du mois - Format tableau
  const initializeWeeklyDistributionData = () => {
    const defaultData = {
      monday: { week1: '', week2: '', week3: '', week4: '' },
      tuesday: { week1: '', week2: '', week3: '', week4: '' },
      wednesday: { week1: '', week2: '', week3: '', week4: '' },
      thursday: { week1: '', week2: '', week3: '', week4: '' },
      friday: { week1: '', week2: '', week3: '', week4: '' },
      saturday: { week1: '', week2: '', week3: '', week4: '' },
      sunday: { week1: '', week2: '', week3: '', week4: '' },
    };

    // Charger les données depuis employee.workSchedule.weeklyDistributionData si elles existent
    if (employee.workSchedule?.weeklyDistributionData) {
      return employee.workSchedule.weeklyDistributionData;
    }

    return defaultData;
  };

  const [weeklyDistributionData, setWeeklyDistributionData] = useState<{
    [key: string]: { [week: string]: string };
  }>(initializeWeeklyDistributionData());

  // Réinitialiser l'étape courante quand l'employé change ou le modal s'ouvre
  useEffect(() => {
    if (show) {
      setCurrentStep(determineCurrentStep());
      setMessage(null);
      setWeeklySchedule(initializeWeeklySchedule());
      setWeeklyDistributionData(initializeWeeklyDistributionData());
    }
  }, [show, employee._id]);

  const calculateSlotHours = (startTime: string, endTime: string): number => {
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);

    const startInMinutes = startHour * 60 + startMin;
    const endInMinutes = endHour * 60 + endMin;

    return (endInMinutes - startInMinutes) / 60;
  };

  const calculateDayAvailableHours = (slots: Array<{ start: string; end: string }>): number => {
    return slots.reduce((total, slot) => total + calculateSlotHours(slot.start, slot.end), 0);
  };


  const generateScheduleText = () => {
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const dayNames: Record<string, string> = {
      monday: 'Lundi',
      tuesday: 'Mardi',
      wednesday: 'Mercredi',
      thursday: 'Jeudi',
      friday: 'Vendredi',
      saturday: 'Samedi',
      sunday: 'Dimanche',
    };

    // Article 4 : Plages horaires (gérer plusieurs créneaux par jour)
    const timeSlots = days
      .filter(day => weeklySchedule[day as keyof typeof weeklySchedule].available)
      .map(day => {
        const schedule = weeklySchedule[day as keyof typeof weeklySchedule];
        const slotsText = schedule.slots
          .map((slot: { start: string; end: string }) => `${slot.start} - ${slot.end}`)
          .join(' et ');
        return `${dayNames[day]}: ${slotsText}`;
      })
      .join('\n');

    // Article 5 : Répartition par semaine - Format tableau
    const weeks = ['week1', 'week2', 'week3', 'week4'];
    const weekLabels = { week1: 'Semaine 1', week2: 'Semaine 2', week3: 'Semaine 3', week4: 'Semaine 4' };

    const weeklyDistribution = weeks.map(week => {
      const weekData = days
        .map(day => {
          const hours = weeklyDistributionData[day]?.[week];
          if (!hours || hours === '0') return null;
          return `${dayNames[day]} ${hours}h`;
        })
        .filter(Boolean)
        .join(', ');

      return weekData ? `${weekLabels[week as keyof typeof weekLabels]}: ${weekData}` : '';
    }).filter(Boolean).join('\n');

    return { timeSlots, weeklyDistribution };
  };

  const handleSaveStep2 = async () => {
    try {
      setSaving(true);
      setMessage(null);

      const response = await fetch(`/api/hr/employees/${employee._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          onboardingStatus: {
            ...employee.onboardingStatus,
            step2Completed: true,
            dpaeCompleted: step2Data.dpaeCompleted,
            dpaeCompletedAt: step2Data.dpaeDate ? new Date(step2Data.dpaeDate) : null,
            medicalVisitCompleted: step2Data.medicalVisitCompleted,
            medicalVisitCompletedAt: step2Data.medicalVisitDate ? new Date(step2Data.medicalVisitDate) : null,
            mutuelleCompleted: step2Data.mutuelleCompleted,
            mutuelleCompletedAt: step2Data.mutuelleDate ? new Date(step2Data.mutuelleDate) : null,
            bankDetailsProvided: step2Data.bankDetailsProvided,
            bankDetailsProvidedAt: step2Data.bankDetailsDate ? new Date(step2Data.bankDetailsDate) : null,
            registerCompleted: step2Data.registerCompleted,
            registerCompletedAt: step2Data.registerDate ? new Date(step2Data.registerDate) : null,
          },
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: "success", text: "Documents administratifs enregistrés" });
        setTimeout(() => {
          setCurrentStep(3);
          setMessage(null);
        }, 1000);
      } else {
        setMessage({ type: "error", text: data.error || "Erreur lors de l'enregistrement" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Erreur lors de l'enregistrement" });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveStep3 = async () => {
    try {
      setSaving(true);
      setMessage(null);

      // Vérifier qu'au moins une semaine a des heures renseignées
      const hasAnyData = Object.values(weeklyDistributionData).some(dayData =>
        Object.values(dayData).some(hours => hours && hours !== '0')
      );

      if (!hasAnyData) {
        setMessage({ type: "error", text: "Veuillez renseigner au moins quelques heures dans le planning" });
        setSaving(false);
        return;
      }

      // Générer automatiquement les textes depuis le calendrier
      const { timeSlots, weeklyDistribution } = generateScheduleText();

      const response = await fetch(`/api/hr/employees/${employee._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          onboardingStatus: {
            ...employee.onboardingStatus,
            step3Completed: true,
          },
          workSchedule: {
            timeSlots,
            weeklyDistribution,
            weeklyDistributionData,
          },
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: "success", text: "Planning enregistré" });
        setTimeout(() => {
          setCurrentStep(4);
          setMessage(null);
        }, 1000);
      } else {
        setMessage({ type: "error", text: data.error || "Erreur lors de l'enregistrement" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Erreur lors de l'enregistrement" });
    } finally {
      setSaving(false);
    }
  };

  const renderStep2 = () => (
    <div>
      <h5 className="mb-4">
        <Icon icon="ri:file-list-3-line" className="me-2" />
        Documents Administratifs
      </h5>

      {message && (
        <Alert variant={message.type === "success" ? "success" : "danger"} dismissible onClose={() => setMessage(null)}>
          {message.text}
        </Alert>
      )}

      <Form>
        <div className="mb-4 p-3 bg-light rounded">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <Form.Check
              type="checkbox"
              id="dpae"
              label="DPAE (Déclaration Préalable À l'Embauche)"
              checked={step2Data.dpaeCompleted}
              onChange={(e) => setStep2Data({ ...step2Data, dpaeCompleted: e.target.checked })}
            />
            <a
              href="https://www.due.urssaf.fr/declarant/index.jsf"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-sm btn-outline-primary"
            >
              <Icon icon="ri:external-link-line" className="me-1" />
              Accéder à la DUE
            </a>
          </div>
          {step2Data.dpaeCompleted && (
            <Form.Group className="mt-2 ms-4">
              <Form.Label>Date de la DPAE *</Form.Label>
              <Form.Control
                type="date"
                value={step2Data.dpaeDate}
                onChange={(e) => setStep2Data({ ...step2Data, dpaeDate: e.target.value })}
                required
              />
            </Form.Group>
          )}
        </div>

        <div className="mb-3">
          <Form.Check
            type="checkbox"
            id="medicalVisit"
            label="Visite médicale"
            checked={step2Data.medicalVisitCompleted}
            onChange={(e) => setStep2Data({ ...step2Data, medicalVisitCompleted: e.target.checked })}
          />
        </div>

        <div className="mb-3">
          <Form.Check
            type="checkbox"
            id="mutuelle"
            label="Allianz Mutuelle"
            checked={step2Data.mutuelleCompleted}
            onChange={(e) => setStep2Data({ ...step2Data, mutuelleCompleted: e.target.checked })}
          />
        </div>

        <div className="mb-3">
          <Form.Check
            type="checkbox"
            id="rib"
            label="RIB (Relevé d'Identité Bancaire)"
            checked={step2Data.bankDetailsProvided}
            onChange={(e) => setStep2Data({ ...step2Data, bankDetailsProvided: e.target.checked })}
          />
        </div>

        <div className="mb-3">
          <Form.Check
            type="checkbox"
            id="register"
            label="Registre unique du personnel"
            checked={step2Data.registerCompleted}
            onChange={(e) => setStep2Data({ ...step2Data, registerCompleted: e.target.checked })}
          />
        </div>
      </Form>
    </div>
  );

  const renderStep3 = () => {
    const dayNames: Record<string, string> = {
      monday: 'Lundi',
      tuesday: 'Mardi',
      wednesday: 'Mercredi',
      thursday: 'Jeudi',
      friday: 'Vendredi',
      saturday: 'Samedi',
      sunday: 'Dimanche',
    };

    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

    return (
      <div>
        <h5 className="mb-4">
          <Icon icon="ri:calendar-line" className="me-2" />
          Planning de Travail
        </h5>

        {message && (
          <Alert variant={message.type === "success" ? "success" : "danger"} dismissible onClose={() => setMessage(null)}>
            {message.text}
          </Alert>
        )}

        <Alert variant="info" className="mb-4">
          <Icon icon="ri:information-line" className="me-2" />
          Les plages horaires sont basées sur les disponibilités saisies lors de la création de l'employé.
          Les heures disponibles sont calculées automatiquement.
        </Alert>

        <div className="mb-4">
          <h6 className="mb-3">Article 4 - Plages horaires de planification</h6>
          <div className="table-responsive">
            <table className="table table-bordered">
              <thead className="table-light">
                <tr>
                  <th>Jour</th>
                  <th>Disponible</th>
                  <th>Plage horaire</th>
                  <th>Heures disponibles</th>
                </tr>
              </thead>
              <tbody>
                {days.map(day => {
                  const schedule = weeklySchedule[day as keyof typeof weeklySchedule];
                  const availableHours = schedule.available && schedule.slots.length > 0
                    ? calculateDayAvailableHours(schedule.slots)
                    : 0;

                  return (
                    <tr key={day} className={!schedule.available ? 'table-secondary' : ''}>
                      <td className="fw-bold">{dayNames[day]}</td>
                      <td>
                        {schedule.available ? (
                          <span className="badge bg-success">
                            <Icon icon="ri:check-line" className="me-1" />
                            Oui
                          </span>
                        ) : (
                          <span className="badge bg-secondary">
                            <Icon icon="ri:close-line" className="me-1" />
                            Non
                          </span>
                        )}
                      </td>
                      <td>
                        {schedule.available && schedule.slots.length > 0 ? (
                          <span>
                            {schedule.slots.map((slot: { start: string; end: string }, idx: number) => (
                              <div key={idx}>{slot.start} - {slot.end}</div>
                            ))}
                          </span>
                        ) : (
                          <span className="text-muted">-</span>
                        )}
                      </td>
                      <td>
                        {schedule.available && schedule.slots.length > 0 ? (
                          <span className="fw-bold">{availableHours.toFixed(1)}h</span>
                        ) : (
                          <span className="text-muted">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mb-4">
          <h6 className="mb-3">Article 5 - Répartition de la durée du travail par semaine</h6>
          <p className="text-muted small mb-3">
            Indiquez le nombre d'heures de travail pour chaque jour et chaque semaine du mois.
            Les jours non disponibles sont marqués comme "Repos".
          </p>

          <div className="table-responsive">
            <table className="table table-bordered">
              <thead className="table-light">
                <tr>
                  <th>Jour</th>
                  <th>Semaine 1</th>
                  <th>Semaine 2</th>
                  <th>Semaine 3</th>
                  <th>Semaine 4</th>
                  <th className="table-primary">Total</th>
                </tr>
              </thead>
              <tbody>
                {days.map(day => {
                  const schedule = weeklySchedule[day as keyof typeof weeklySchedule];

                  return (
                    <tr key={day} className={!schedule.available ? 'table-secondary' : ''}>
                      <td className="fw-bold">{dayNames[day]}</td>
                      {['week1', 'week2', 'week3', 'week4'].map(week => (
                        <td key={week}>
                          {schedule.available ? (
                            <Form.Control
                              type="number"
                              size="sm"
                              min="0"
                              max="12"
                              step="0.5"
                              value={weeklyDistributionData[day]?.[week] || ''}
                              onChange={(e) => setWeeklyDistributionData({
                                ...weeklyDistributionData,
                                [day]: {
                                  ...weeklyDistributionData[day],
                                  [week]: e.target.value
                                }
                              })}
                              placeholder="0"
                              style={{ width: '80px' }}
                            />
                          ) : (
                            <span className="text-muted">Repos</span>
                          )}
                        </td>
                      ))}
                      <td className="table-primary"></td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="table-light">
                <tr className="fw-bold">
                  <td>Total</td>
                  {['week1', 'week2', 'week3', 'week4'].map(week => {
                    const total = days.reduce((sum, day) => {
                      const hours = parseFloat(weeklyDistributionData[day]?.[week] || '0');
                      return sum + hours;
                    }, 0);
                    return <td key={week}>{total.toFixed(1)}h</td>;
                  })}
                  <td className="table-primary">
                    {(() => {
                      const grandTotal = ['week1', 'week2', 'week3', 'week4'].reduce((sum, week) => {
                        const weekTotal = days.reduce((total, day) => {
                          const hours = parseFloat(weeklyDistributionData[day]?.[week] || '0');
                          return total + hours;
                        }, 0);
                        return sum + weekTotal;
                      }, 0);
                      const expectedTotal = employee.contractualHours * 4;
                      const isValid = Math.abs(grandTotal - expectedTotal) < 0.1;
                      return (
                        <span className={isValid ? 'text-success' : 'text-danger'}>
                          {grandTotal.toFixed(1)}h
                        </span>
                      );
                    })()}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderStep4 = () => (
    <div>
      <h5 className="mb-4">
        <Icon icon="ri:file-text-line" className="me-2" />
        Génération du Contrat
      </h5>

      <Alert variant="success">
        <Icon icon="ri:checkbox-circle-line" className="me-2" />
        Toutes les étapes précédentes sont complétées !
      </Alert>

      <p>Vous pouvez maintenant générer le contrat de travail avec toutes les informations collectées.</p>

      <ul className="mb-4">
        <li>Informations personnelles complètes</li>
        <li>Documents administratifs validés</li>
        <li>Planning de travail défini</li>
      </ul>
    </div>
  );

  const getProgress = () => {
    return ((currentStep - 1) / 3) * 100;
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>
          <Icon icon="ri:user-add-line" className="me-2" />
          Onboarding - {employee.firstName} {employee.lastName}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <ProgressBar now={getProgress()} label={`Étape ${currentStep}/4`} className="mb-4" />

        {/* Navigation entre les étapes */}
        <div className="d-flex gap-2 mb-3">
          <Button
            size="sm"
            variant={currentStep === 2 ? "primary" : "outline-secondary"}
            onClick={() => setCurrentStep(2)}
          >
            Étape 2
          </Button>
          <Button
            size="sm"
            variant={currentStep === 3 ? "primary" : "outline-secondary"}
            onClick={() => setCurrentStep(3)}
            disabled={!employee.onboardingStatus.step2Completed}
          >
            Étape 3
          </Button>
          <Button
            size="sm"
            variant={currentStep === 4 ? "primary" : "outline-secondary"}
            onClick={() => setCurrentStep(4)}
            disabled={!employee.onboardingStatus.step3Completed}
          >
            Étape 4
          </Button>
        </div>

        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
        {currentStep === 4 && renderStep4()}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-secondary" onClick={onHide}>
          Fermer
        </Button>
        {currentStep > 2 && (
          <Button
            variant="outline-primary"
            onClick={() => setCurrentStep(currentStep - 1)}
          >
            <Icon icon="ri:arrow-left-line" className="me-1" />
            Précédent
          </Button>
        )}
        {currentStep === 2 && (
          <Button
            variant="primary"
            onClick={handleSaveStep2}
            disabled={
              saving ||
              !step2Data.dpaeCompleted ||
              !step2Data.dpaeDate ||
              !step2Data.medicalVisitCompleted ||
              !step2Data.mutuelleCompleted ||
              !step2Data.bankDetailsProvided ||
              !step2Data.registerCompleted
            }
          >
            {saving ? "Enregistrement..." : "Suivant"}
            <Icon icon="ri:arrow-right-line" className="ms-1" />
          </Button>
        )}
        {currentStep === 3 && (
          <Button
            variant="primary"
            onClick={handleSaveStep3}
            disabled={(() => {
              if (saving) return true;
              const grandTotal = ['week1', 'week2', 'week3', 'week4'].reduce((sum, week) => {
                const weekTotal = days.reduce((total, day) => {
                  const hours = parseFloat(weeklyDistributionData[day]?.[week] || '0');
                  return total + hours;
                }, 0);
                return sum + weekTotal;
              }, 0);
              const expectedTotal = employee.contractualHours * 4;
              return Math.abs(grandTotal - expectedTotal) >= 0.1;
            })()}
          >
            {saving ? "Enregistrement..." : "Suivant"}
            <Icon icon="ri:arrow-right-line" className="ms-1" />
          </Button>
        )}
        {currentStep === 4 && (
          <Button
            variant="success"
            onClick={() => {
              onHide();
              onGenerateContract();
            }}
          >
            <Icon icon="ri:file-text-line" className="me-1" />
            Générer le contrat
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
}
