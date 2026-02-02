/**
 * Client-side PDF generation utility
 * This file is dynamically imported to avoid SSR issues
 */

import React from 'react'
import type { Employee } from '@/types/hr'

export interface GenerateContractPDFOptions {
  employee: Employee
  monthlySalary: string
  monthlyHours: string
}

/**
 * Generate contract PDF blob
 * Must be called client-side only
 */
export async function generateContractPDF(options: GenerateContractPDFOptions): Promise<Blob> {
  // Use dynamic import with string concatenation to avoid static analysis
  const pdfModule = await import('@react-pdf/renderer')
  const { pdf } = pdfModule

  // Dynamically construct the module path to avoid static bundling
  const basePath = '@/lib/pdf/templates/contract/'
  const moduleName = 'ContractDocument'
  const fullPath = `${basePath}${moduleName}`

  // This will be resolved at runtime only
  const contractModule = await import(
    /* webpackIgnore: true */
    `./templates/contract/${moduleName}.tsx`
  )
  const { ContractDocument } = contractModule

  const { createElement } = await import('react')

  const doc = createElement(ContractDocument, {
    employee: options.employee,
    monthlySalary: options.monthlySalary,
    monthlyHours: options.monthlyHours,
  })

  // Generate PDF blob
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const blob = await pdf(doc as any).toBlob()
  return blob
}
