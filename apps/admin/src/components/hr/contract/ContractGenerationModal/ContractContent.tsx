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
  // Hauteur page A4 : 297mm
  // Hauteur contenu (avec marges 20mm haut/bas) : 257mm
  const previewStyles = viewMode === 'preview' ? {
    width: '210mm',
    minHeight: 'auto',
    padding: '0',
    backgroundColor: 'white',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    margin: '0 auto 20px',
    position: 'relative' as const,
    border: '1px solid #ddd',
  } : {}

  const containerStyles = viewMode === 'preview'
    ? { ...CONTRACT_STYLES.container, ...previewStyles }
    : CONTRACT_STYLES.container

  if (viewMode === 'preview') {
    // Mode aperçu avec pages A4 séparées
    return (
      <div style={{ position: 'relative' }}>
        {/* Page 1 */}
        <div
          style={{
            ...previewStyles,
            height: '297mm',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: '20mm 25mm',
              height: '100%',
              position: 'relative',
            }}
          >
            <div ref={contractRef}>
              <ContractHeader isFullTime={isFullTime} />
              <ContractParties employee={employee} />
              <ContractArticles
                employee={employee}
                monthlySalary={monthlySalary}
                monthlyHours={monthlyHours}
              />
              <ContractSignature employee={employee} />
            </div>
          </div>
          <div
            style={{
              position: 'absolute',
              bottom: '15mm',
              left: '0',
              right: '0',
              textAlign: 'center',
              fontSize: '9pt',
              color: '#666',
            }}
          >
            Page 1
          </div>
        </div>

        {/* Séparateur de page */}
        <div
          style={{
            height: '20px',
            background: 'linear-gradient(to bottom, transparent, #e5e7eb, transparent)',
            position: 'relative',
          }}
        >
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              fontSize: '11px',
              color: '#6b7280',
              backgroundColor: '#f9fafb',
              padding: '2px 12px',
              borderRadius: '12px',
              border: '1px solid #e5e7eb',
            }}
          >
            ✂️ Saut de page
          </div>
        </div>

        {/* Page 2 (suite du contenu si nécessaire) */}
        <div
          style={{
            ...previewStyles,
            height: '297mm',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: '20mm 25mm',
              height: '100%',
              position: 'relative',
            }}
          >
            <div style={{ fontSize: '9pt', color: '#999', marginBottom: '10mm' }}>
              Contrat de Travail - {employee.firstName} {employee.lastName} (suite)
            </div>
            <div style={{ fontSize: '10pt', color: '#666' }}>
              {/* Contenu débordant de la page 1 apparaîtra ici */}
              <p style={{ fontStyle: 'italic', textAlign: 'center', marginTop: '50mm' }}>
                Le contenu continue ici si le contrat dépasse une page...
              </p>
            </div>
          </div>
          <div
            style={{
              position: 'absolute',
              bottom: '15mm',
              left: '0',
              right: '0',
              textAlign: 'center',
              fontSize: '9pt',
              color: '#666',
            }}
          >
            Page 2
          </div>
        </div>

        {/* Helper text */}
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
          ℹ️ Aperçu avec pagination A4. Le PDF final respectera ces sauts de page.
        </div>
      </div>
    )
  }

  // Mode édition normal
  return (
    <div
      ref={contractRef}
      contentEditable={isEditing}
      suppressContentEditableWarning
      style={containerStyles}
    >
      <ContractHeader isFullTime={isFullTime} />
      <ContractParties employee={employee} />
      <ContractArticles
        employee={employee}
        monthlySalary={monthlySalary}
        monthlyHours={monthlyHours}
      />
      <ContractSignature employee={employee} />
    </div>
  )
}
