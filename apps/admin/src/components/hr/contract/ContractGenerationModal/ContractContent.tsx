/**
 * Contract content component
 * Assembles all contract sections into the printable document
 */

import type { ContractContentProps } from './types'
import { CONTRACT_STYLES } from './constants'
import { ContractHeader } from './ContractHeader'
import { ContractParties } from './ContractParties'
import { ContractArticles } from './ContractArticles'
import { ContractSignature } from './ContractSignature'

export function ContractContent({
  employee,
  isEditing,
  monthlySalary,
  monthlyHours,
  contractRef,
  viewMode = 'edit',
}: ContractContentProps) {
  const isFullTime = employee.contractualHours >= 35

  // Styles A4 pour aperçu (210mm x 297mm)
  const previewStyles = viewMode === 'preview' ? {
    width: '210mm',
    minHeight: '297mm',
    padding: '20mm 25mm',
    backgroundColor: 'white',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    margin: '0 auto',
    position: 'relative' as const,
    border: '1px solid #ddd',
  } : {}

  const containerStyles = viewMode === 'preview'
    ? { ...CONTRACT_STYLES.container, ...previewStyles }
    : CONTRACT_STYLES.container

  return (
    <div style={{ position: 'relative' }}>
      <div
        ref={contractRef}
        contentEditable={isEditing && viewMode !== 'preview'}
        suppressContentEditableWarning
        style={containerStyles}
      >
        {/* Title */}
        <ContractHeader isFullTime={isFullTime} />

        {/* Parties (employer + employee) */}
        <ContractParties employee={employee} />

        {/* All articles */}
        <ContractArticles
          employee={employee}
          monthlySalary={monthlySalary}
          monthlyHours={monthlyHours}
        />

        {/* Signature */}
        <ContractSignature employee={employee} />

        {/* Page indicator in preview mode */}
        {viewMode === 'preview' && (
          <div
            style={{
              position: 'absolute',
              bottom: '10mm',
              left: '0',
              right: '0',
              textAlign: 'center',
              fontSize: '9pt',
              color: '#666',
            }}
          >
            Page 1
          </div>
        )}
      </div>

      {/* Helper text in preview mode */}
      {viewMode === 'preview' && (
        <div
          style={{
            textAlign: 'center',
            padding: '1rem',
            fontSize: '0.875rem',
            color: '#666',
            backgroundColor: '#f3f4f6',
            borderRadius: '0.375rem',
            marginTop: '1rem',
          }}
        >
          ℹ️ Ceci est un aperçu du format A4. Le PDF final sera généré avec cette mise en page.
        </div>
      )}
    </div>
  )
}
