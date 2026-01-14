"use client";

import { Icon } from "@iconify/react";
import { Form, Alert, Badge } from "react-bootstrap";
import { EmployeeAvailability } from "../types";

interface Step3PlanningProps {
  availability: EmployeeAvailability;
  contractualHours: number;
  weeklyDistributionData: { [key: string]: { [week: string]: string } };
  onDistributionChange: (data: { [key: string]: { [week: string]: string } }) => void;
}

const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const dayNames: { [key: string]: string } = {
  monday: "Lundi",
  tuesday: "Mardi",
  wednesday: "Mercredi",
  thursday: "Jeudi",
  friday: "Vendredi",
  saturday: "Samedi",
  sunday: "Dimanche",
};

export default function Step3Planning({
  availability,
  contractualHours,
  weeklyDistributionData,
  onDistributionChange,
}: Step3PlanningProps) {
  const calculateWeekTotal = (week: string) => {
    return days.reduce((total, day) => {
      const hours = parseFloat(weeklyDistributionData[day]?.[week] || '0');
      return total + hours;
    }, 0);
  };

  const calculateGrandTotal = () => {
    return ['week1', 'week2', 'week3', 'week4'].reduce((sum, week) => {
      return sum + calculateWeekTotal(week);
    }, 0);
  };

  const expectedTotal = contractualHours * 4;
  const grandTotal = calculateGrandTotal();
  const isValid = Math.abs(grandTotal - expectedTotal) < 0.1;

  const weeklySchedule = availability || {
    monday: { available: false, slots: [] },
    tuesday: { available: false, slots: [] },
    wednesday: { available: false, slots: [] },
    thursday: { available: false, slots: [] },
    friday: { available: false, slots: [] },
    saturday: { available: false, slots: [] },
    sunday: { available: false, slots: [] },
  };

  const calculateDayHours = (day: string) => {
    const schedule = weeklySchedule[day as keyof typeof weeklySchedule];
    if (!schedule?.available || !schedule.slots) return 0;

    return schedule.slots.reduce((total, slot) => {
      const start = new Date(`2000-01-01T${slot.start}`);
      const end = new Date(`2000-01-01T${slot.end}`);
      const diff = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      return total + (diff > 0 ? diff : 0);
    }, 0);
  };

  return (
    <div>
      <h5 className="mb-4">
        <Icon icon="ri:calendar-line" className="me-2" />
        Planning de Travail
      </h5>

      {/* Article 4 - Disponibilités */}
      <div className="mb-4">
        <h6 className="mb-3">Article 4 - Disponibilités de l'employé</h6>
        <p className="text-muted small mb-3">
          Récapitulatif des disponibilités horaires par jour de la semaine.
        </p>

        <div className="table-responsive">
          <table className="table table-bordered">
            <thead className="table-light">
              <tr>
                <th>Jour</th>
                <th>Disponibilité</th>
                <th>Créneaux horaires</th>
                <th className="text-end">Total heures</th>
              </tr>
            </thead>
            <tbody>
              {days.map(day => {
                const schedule = weeklySchedule[day as keyof typeof weeklySchedule];
                const availableHours = calculateDayHours(day);

                return (
                  <tr key={day} className={!schedule?.available ? 'table-secondary' : ''}>
                    <td className="fw-bold">{dayNames[day]}</td>
                    <td>
                      {schedule?.available ? (
                        <Badge bg="success">Disponible</Badge>
                      ) : (
                        <Badge bg="secondary">Repos</Badge>
                      )}
                    </td>
                    <td>
                      {schedule?.available && schedule.slots && schedule.slots.length > 0 ? (
                        <span className="small">
                          {schedule.slots.map((slot, idx) => (
                            <span key={idx} className="d-block">
                              {slot.start} - {slot.end}
                            </span>
                          ))}
                        </span>
                      ) : (
                        <span className="text-muted">-</span>
                      )}
                    </td>
                    <td className="text-end">
                      {schedule?.available && schedule.slots && schedule.slots.length > 0 ? (
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

      {/* Article 5 - Répartition hebdomadaire */}
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
                  <tr key={day} className={!schedule?.available ? 'table-secondary' : ''}>
                    <td className="fw-bold">{dayNames[day]}</td>
                    {['week1', 'week2', 'week3', 'week4'].map(week => (
                      <td key={week}>
                        {schedule?.available ? (
                          <Form.Control
                            type="number"
                            size="sm"
                            min="0"
                            max="12"
                            step="0.5"
                            value={weeklyDistributionData[day]?.[week] || ''}
                            onChange={(e) => onDistributionChange({
                              ...weeklyDistributionData,
                              [day]: {
                                ...weeklyDistributionData[day],
                                [week]: e.target.value
                              }
                            })}
                            placeholder="0"
                            className="onboarding-hours-input"
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
                <td>{calculateWeekTotal('week1').toFixed(1)}h</td>
                <td>{calculateWeekTotal('week2').toFixed(1)}h</td>
                <td>{calculateWeekTotal('week3').toFixed(1)}h</td>
                <td>{calculateWeekTotal('week4').toFixed(1)}h</td>
                <td className={`table-${isValid ? 'success' : 'danger'}`}>
                  {grandTotal.toFixed(1)}h
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        <Alert variant={isValid ? "success" : "warning"} className="mt-3">
          <div className="d-flex align-items-center">
            <Icon
              icon={isValid ? "ri:checkbox-circle-line" : "ri:error-warning-line"}
              className="me-2"
              style={{ fontSize: '1.5rem' }}
            />
            <div>
              <strong>Total mensuel : {grandTotal.toFixed(1)}h</strong>
              <div className="small">
                Attendu : {expectedTotal.toFixed(1)}h ({contractualHours}h/semaine × 4 semaines)
              </div>
              {!isValid && (
                <div className="small text-danger mt-1">
                  ⚠️ Le total ne correspond pas aux heures contractuelles
                </div>
              )}
            </div>
          </div>
        </Alert>
      </div>
    </div>
  );
}
