"use client";

import { useEffect, useState } from "react";
import { Row, Col, Spinner, Alert } from "react-bootstrap";
import { useTopbarContext } from "@/context/useTopbarContext";
import { Icon } from "@iconify/react";
import EmployeeClockingCard from "@/components/hr/EmployeeClockingCard";
import PinCodeModal from "@/components/hr/PinCodeModal";
import StaffScheduleView from "@/components/hr/StaffScheduleView";

interface Employee {
  _id: string;
  firstName: string;
  lastName: string;
  employeeRole?: string;
  employeeColor?: string;
  clockingCode: string;
}

export default function ClockingPage() {
  const { setPageTitle } = useTopbarContext();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [showPinModal, setShowPinModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    setPageTitle("Pointage des Employés");

    return () => {
      setPageTitle("Dashboard");
    };
  }, [setPageTitle]);

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      setError(null);

      // Récupérer tous les employés actifs
      const response = await fetch("/api/hr/employees");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors du chargement des employés");
      }

      if (!data.success || !data.data || data.data.length === 0) {
        throw new Error("Aucun employé trouvé");
      }

      // Filtrer les employés actifs uniquement
      const activeEmployees = data.data
        .filter((emp: any) => emp.isActive)
        .map((emp: any) => ({
          _id: emp._id,
          firstName: emp.firstName,
          lastName: emp.lastName,
          employeeRole: emp.employeeRole,
          employeeColor: emp.employeeColor,
          clockingCode: emp.clockingCode,
        }));

      if (activeEmployees.length === 0) {
        throw new Error("Aucun employé actif trouvé");
      }

      setEmployees(activeEmployees);
    } catch (err: any) {      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePinRequest = (employee: Employee) => {
    setSelectedEmployee(employee);
    setShowPinModal(true);
  };

  const handlePinValidate = async (pin: string) => {
    if (!selectedEmployee) return;

    // Vérifier le code PIN
    if (pin !== selectedEmployee.clockingCode) {
      alert("Code PIN incorrect");
      return;
    }

    // Fermer la modale
    setShowPinModal(false);

    // Effectuer le clock-in
    try {
      const response = await fetch("/api/hr/time-entries/clock-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeId: selectedEmployee._id }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors du pointage");
      }

      // Rafraîchir l'affichage
      setRefreshKey((prev) => prev + 1);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSelectedEmployee(null);
    }
  };

  if (loading) {
    return (
      <div className="container-fluid">
        <div className="text-center mt-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Chargement...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-fluid">
        <Alert variant="danger">
          <Icon icon="eva:alert-circle-outline" width={20} className="me-2" />
          {error}
        </Alert>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      {/* Cartes de pointage */}
      <Row className="g-4 mb-5">
        {employees.map((employee) => (
          <Col key={employee._id} lg={4} md={6}>
            <EmployeeClockingCard
              employee={employee}
              onPinRequest={handlePinRequest}
              refreshTrigger={refreshKey}
            />
          </Col>
        ))}
      </Row>

      {/* Planning */}
      <Row>
        <Col lg={12}>
          <StaffScheduleView key={refreshKey} employees={employees} />
        </Col>
      </Row>

      {/* Modale de saisie PIN */}
      {selectedEmployee && (
        <PinCodeModal
          show={showPinModal}
          onHide={() => {
            setShowPinModal(false);
            setSelectedEmployee(null);
          }}
          employeeName={`${selectedEmployee.firstName} ${selectedEmployee.lastName}`}
          onValidate={handlePinValidate}
        />
      )}
    </div>
  );
}
