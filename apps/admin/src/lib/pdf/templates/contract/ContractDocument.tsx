"use client";

/**
 * Contract PDF Document Template
 * Uses @react-pdf/renderer for PDF generation
 *
 * Structure: 6 pages
 * - Page 1: Header + Company/Employee info
 * - Page 2: Article 1 (Trial period) + Article 2 (Functions)
 * - Page 3: Article 3 (Location)
 * - Page 4-5: Articles 4-5 (Hours + Schedule tables)
 * - Page 6: Articles 6-7 (Overtime + Salary)
 * - Page 7: Articles 8-10 + Signatures
 */

import type { Employee } from "@/types/hr";
import { Document as PDFDocument } from "@react-pdf/renderer";
import { ContractHeader } from "./components/ContractHeader";
import { Article1 } from "./components/Article1";
import { Article3 } from "./components/Article3";
import { Article4And5 } from "./components/Article4And5";
import { Articles6And7 } from "./components/Articles6And7";
import { FinalArticlesAndSignatures } from "./components/FinalArticlesAndSignatures";

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

      {/* Page 3: Article 3 (Location) */}
      <Article3 />

      {/* Pages 4-5: Articles 4-5 (Hours + Schedule tables) */}
      <Article4And5 employee={employee} monthlyHours={monthlyHours} />

      {/* Page 6: Articles 6-7 (Overtime + Salary) */}
      <Articles6And7
        employee={employee}
        monthlySalary={monthlySalary}
        monthlyHours={monthlyHours}
      />

      {/* Page 7: Articles 8-10 + Signatures */}
      <FinalArticlesAndSignatures employee={employee} />
    </PDFDocument>
  );
}
