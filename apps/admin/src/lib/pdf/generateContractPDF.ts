/**
 * Client-side PDF generation utility
 * This file is dynamically imported to avoid SSR issues
 */

import React from 'react'
import type { Employee } from '@/types/hr'

/**
 * Type for the pdf() function from @react-pdf/renderer
 * @see https://github.com/diegomura/react-pdf/blob/master/packages/renderer/index.d.ts#L652
 */
type PDFFunction = (initialValue?: React.ReactElement) => {
  container: unknown
  isDirty: () => boolean
  toString: () => string
  toBlob: () => Promise<Blob>
  toBuffer: () => Promise<NodeJS.ReadableStream>
  on: (event: 'change', callback: () => void) => void
  updateContainer: (document: React.ReactElement, callback?: () => void) => void
  removeListener: (event: 'change', callback: () => void) => void
}

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
  const pdfInstance = (pdf as PDFFunction)(doc)
  const blob = await pdfInstance.toBlob()
  return blob
}
