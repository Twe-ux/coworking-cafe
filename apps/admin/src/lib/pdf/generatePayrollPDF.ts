/**
 * Client-side Payroll PDF generation utility
 * This file is dynamically imported to avoid SSR issues
 */

import React from "react";
import type { EmployeePayrollData } from "@/lib/payroll/calculateMonthlyPayroll";

/**
 * Type for the pdf() function from @react-pdf/renderer
 * @see https://github.com/diegomura/react-pdf/blob/master/packages/renderer/index.d.ts#L652
 */
type PDFFunction = (initialValue?: React.ReactElement) => {
  container: unknown;
  isDirty: () => boolean;
  toString: () => string;
  toBlob: () => Promise<Blob>;
  toBuffer: () => Promise<NodeJS.ReadableStream>;
  on: (event: "change", callback: () => void) => void;
  updateContainer: (document: React.ReactElement, callback?: () => void) => void;
  removeListener: (event: "change", callback: () => void) => void;
};

export interface GeneratePayrollPDFOptions {
  payrollData: EmployeePayrollData[];
  month: number;
  year: number;
}

/**
 * Generate payroll PDF blob
 * Must be called client-side only
 */
export async function generatePayrollPDF(
  options: GeneratePayrollPDFOptions
): Promise<Blob> {
  // Use dynamic import with string concatenation to avoid static analysis
  const pdfModule = await import("@react-pdf/renderer");
  const { pdf } = pdfModule;

  // Dynamically construct the module path to avoid static bundling
  const moduleName = "PayrollDocument";

  // This will be resolved at runtime only
  const payrollModule = await import(
    /* webpackIgnore: true */
    `./templates/payroll/${moduleName}.tsx`
  );
  const { PayrollDocument } = payrollModule;

  const { createElement } = await import("react");

  const doc = createElement(PayrollDocument, {
    payrollData: options.payrollData,
    month: options.month,
    year: options.year,
  });

  // Generate PDF blob
  const pdfInstance = (pdf as PDFFunction)(doc);
  const blob = await pdfInstance.toBlob();
  return blob;
}
