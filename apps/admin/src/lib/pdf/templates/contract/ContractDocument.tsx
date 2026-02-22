"use client";

/**
 * Contract PDF Document Template
 * Uses @react-pdf/renderer for PDF generation
 *
 * Structure: 7 pages
 * - Page 1: Header + Company/Employee info
 * - Page 2: Article 1 (Trial period) + Article 2 (Functions)
 * - Page 3: Articles 3-4 (Location + Monthly hours + Availability)
 * - Page 4: Article 5 (Schedule distribution)
 * - Page 5: Articles 6-10 (Overtime + Salary + Employment rules)
 * - Page 6: Articles 11-13 (Final articles)
 * - Page 7: Article 14 (Termination) + Signatures
 */

import type { Employee } from "@/types/hr";
import { Document as PDFDocument } from "@react-pdf/renderer";
import { ContractHeader } from "./components/ContractHeader";
import { Article1 } from "./components/Article1";
import { Articles3And4 } from "./components/Articles3And4";
import { Article5 } from "./components/Articles5";
import { Articles6To10 } from "./components/Articles6To10";
import { Articles11To13 } from "./components/Articles11To13";
import { Article14AndSignatures } from "./components/Article14AndSignatures";

interface ContractDocumentProps {
  employee: Employee;
  monthlySalary: string;
  monthlyHours: string;
}

export default function ContractDocument({
  employee,
  monthlySalary,
  monthlyHours,
}: ContractDocumentProps) {
  // Helper: Check if full-time
  const isFullTime = employee.contractualHours >= 35;

  // Helper: Format date
  const formatDate = (date: Date | string | undefined): string => {
    if (!date) return "";
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Helper: Format social security number with spaces
  const formatSocialSecurity = (ssn: string | undefined): string => {
    if (!ssn) return "";
    // Remove existing spaces
    const cleaned = ssn.replace(/\s/g, "");
    // Format: 1 23 45 67 890 123 45
    if (cleaned.length === 15) {
      return `${cleaned[0]} ${cleaned.slice(1, 3)} ${cleaned.slice(3, 5)} ${cleaned.slice(5, 7)} ${cleaned.slice(7, 10)} ${cleaned.slice(10, 13)} ${cleaned.slice(13, 15)}`;
    }
    return ssn; // Return as-is if not 15 digits
  };

  // Employee data
  const birthDate = formatDate(employee.dateOfBirth);
  const hireDate = formatDate(employee.hireDate);
  const dpaeDate = formatDate(employee.onboardingStatus?.dpaeCompletedAt);
  const formattedSSN = formatSocialSecurity(employee.socialSecurityNumber);

  // Place of birth formatting
  const placeOfBirth = employee.placeOfBirth
    ? typeof employee.placeOfBirth === "string"
      ? employee.placeOfBirth
      : `${employee.placeOfBirth.city || ""}${
          employee.placeOfBirth.department
            ? ` (${employee.placeOfBirth.department})`
            : ""
        }${employee.placeOfBirth.country ? ` ${employee.placeOfBirth.country}` : ""}`
    : "";

  return (
    <PDFDocument>
      {/* Page 1: Header + Company/Employee info */}
      <ContractHeader
        employee={employee}
        isFullTime={isFullTime}
        birthDate={birthDate}
        hireDate={hireDate}
        dpaeDate={dpaeDate}
        formattedSSN={formattedSSN}
        placeOfBirth={placeOfBirth}
      />

      {/* Page 2: Article 1 (Trial period) + Article 2 (Functions) */}
      <Article1
        employee={employee}
        isFullTime={isFullTime}
        dpaeDate={dpaeDate}
        hireDate={hireDate}
      />

      {/* Page 3: Articles 3-4 (Location + Monthly hours + Availability) */}
      <Articles3And4 employee={employee} monthlyHours={monthlyHours} />

      {/* Page 4: Article 5 (Schedule distribution) */}
      <Article5 employee={employee} monthlyHours={monthlyHours} />

      {/* Page 5: Articles 6-10 (Overtime + Salary + Employment rules) */}
      <Articles6To10
        employee={employee}
        monthlySalary={monthlySalary}
        monthlyHours={monthlyHours}
      />

      {/* Page 6: Articles 11-13 */}
      <Articles11To13 employee={employee} />

      {/* Page 7: Article 14 + Signatures */}
      <Article14AndSignatures employee={employee} />
    </PDFDocument>
  );
}
