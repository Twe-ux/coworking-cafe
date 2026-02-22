"use client";

import { PDFViewer } from "@react-pdf/renderer";
import ContractDocument from "@/lib/pdf/templates/contract/ContractDocument";
import type { Employee } from "@/types/hr";

/**
 * Page de développement pour prévisualiser le PDF de contrat
 * Accès: http://localhost:3001/dev/contract-preview
 *
 * ⚠️ ATTENTION: Cette page est pour le développement uniquement
 * À supprimer avant déploiement en production
 */
export default function ContractPreviewPage() {
  // Données de test pour visualiser le contrat
  const mockEmployee: Employee = {
    _id: "mock-id-123",
    firstName: "Jean",
    lastName: "Dupont",
    email: "jean.dupont@example.com",
    phone: "06 12 34 56 78",
    dateOfBirth: "1987-05-15",
    placeOfBirth: {
      city: "Strasbourg",
      department: "67",
      country: "France",
    },
    nationality: "Française",
    address: {
      street: "123 Rue de la Paix",
      postalCode: "67000",
      city: "Strasbourg",
    },
    socialSecurityNumber: "187056712345678",

    // Contrat
    contractType: "CDI",
    contractualHours: 35,
    hireDate: "2026-03-01",
    hireTime: "09:00",
    employeeRole: "Employé polyvalent",
    level: "Niveau II",
    step: 1,
    hourlyRate: 12.08,

    // Disponibilités
    availability: {
      monday: { available: true, slots: [{ start: "09:00", end: "17:00" }] },
      tuesday: { available: true, slots: [{ start: "09:00", end: "17:00" }] },
      wednesday: { available: true, slots: [{ start: "09:00", end: "17:00" }] },
      thursday: { available: true, slots: [{ start: "09:00", end: "17:00" }] },
      friday: { available: true, slots: [{ start: "09:00", end: "17:00" }] },
      saturday: { available: false, slots: [] },
      sunday: { available: false, slots: [] },
    },

    // Admin
    clockingCode: "1234",
    color: "#3b82f6",
    status: "active",
    createdAt: new Date("2026-02-22"),
    updatedAt: new Date("2026-02-22"),
  };

  return (
    <div className="h-screen w-full flex flex-col">
      <div className="bg-yellow-100 border-b border-yellow-400 p-4">
        <p className="text-sm font-semibold text-yellow-800">
          ⚠️ Page de développement - À supprimer avant production
        </p>
        <p className="text-xs text-yellow-700 mt-1">
          Modifiez le template dans{" "}
          <code className="bg-yellow-200 px-1 rounded">
            /lib/pdf/templates/contract/ContractDocument.tsx
          </code>{" "}
          et les changements apparaîtront automatiquement.
        </p>
      </div>

      <div className="flex-1">
        <PDFViewer width="100%" height="100%" showToolbar={true}>
          <ContractDocument
            employee={mockEmployee}
            monthlySalary="2094.67"
            monthlyHours="151.67"
          />
        </PDFViewer>
      </div>
    </div>
  );
}
