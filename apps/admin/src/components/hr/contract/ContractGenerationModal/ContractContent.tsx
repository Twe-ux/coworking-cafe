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
    // Mode aperçu avec contenu continu et indicateurs de pagination dynamiques
    // Génère autant de pages que nécessaire
    const PAGE_HEIGHT_MM = 297
    const TOP_MARGIN_MM = 20
    const BOTTOM_MARGIN_MM = 20
    const SEPARATOR_HEIGHT_MM = 20
    const PRINTABLE_HEIGHT_MM = PAGE_HEIGHT_MM - TOP_MARGIN_MM - BOTTOM_MARGIN_MM // 257mm

    // Nombre de pages à afficher (on en met 4 par défaut, le contenu déterminera le nombre réel)
    const maxPages = 4
    const pageIndicators = []

    for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
      const endOfPagePosition = (PAGE_HEIGHT_MM * pageNum) - BOTTOM_MARGIN_MM
      const pageNumberPosition = (PAGE_HEIGHT_MM * pageNum) - (BOTTOM_MARGIN_MM / 2)
      const separatorPosition = PAGE_HEIGHT_MM * pageNum
      const nextPageHeaderPosition = separatorPosition + SEPARATOR_HEIGHT_MM + TOP_MARGIN_MM

      // Indicateur de fin de page
      pageIndicators.push(
        <div
          key={`end-${pageNum}`}
          style={{
            position: 'absolute',
            top: `${endOfPagePosition}mm`,
            left: '25mm',
            right: '25mm',
            height: '2px',
            backgroundColor: '#ef4444',
            zIndex: 1000,
          }}
        >
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              fontSize: '10px',
              color: '#ef4444',
              backgroundColor: 'white',
              padding: '4px 12px',
              borderRadius: '12px',
              border: '2px solid #ef4444',
              whiteSpace: 'nowrap',
              fontWeight: 'bold',
            }}
          >
            ✂️ FIN PAGE {pageNum} ({endOfPagePosition}mm)
          </div>
        </div>
      )

      // Numéro de page
      pageIndicators.push(
        <div
          key={`number-${pageNum}`}
          style={{
            position: 'absolute',
            top: `${pageNumberPosition}mm`,
            left: '0',
            right: '0',
            textAlign: 'center',
            fontSize: '9pt',
            color: '#666',
            zIndex: 999,
          }}
        >
          Page {pageNum}
        </div>
      )

      // Séparateur de page (sauf pour la dernière page)
      if (pageNum < maxPages) {
        pageIndicators.push(
          <div
            key={`separator-${pageNum}`}
            style={{
              position: 'absolute',
              top: `${separatorPosition}mm`,
              left: '0',
              right: '0',
              height: `${SEPARATOR_HEIGHT_MM}mm`,
              backgroundColor: '#f3f4f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 999,
              borderTop: '3px dashed #9ca3af',
              borderBottom: '3px dashed #9ca3af',
            }}
          >
            <div
              style={{
                fontSize: '12px',
                color: '#6b7280',
                fontWeight: 'bold',
                padding: '6px 20px',
                borderRadius: '16px',
                backgroundColor: 'white',
                border: '2px solid #9ca3af',
              }}
            >
              📄 SAUT DE PAGE - Début Page {pageNum + 1}
            </div>
          </div>
        )

        // En-tête de la page suivante (sauf page 1)
        if (pageNum > 0) {
          pageIndicators.push(
            <div
              key={`header-${pageNum + 1}`}
              style={{
                position: 'absolute',
                top: `${nextPageHeaderPosition}mm`,
                left: '25mm',
                right: '25mm',
                fontSize: '9pt',
                color: '#999',
                zIndex: 998,
              }}
            >
              Contrat de Travail - {employee.firstName} {employee.lastName} (suite)
            </div>
          )
        }
      }
    }

    return (
      <div style={{ position: 'relative' }}>
        {/* Contenu complet affiché de manière continue */}
        <div
          style={{
            ...previewStyles,
            minHeight: `${PAGE_HEIGHT_MM * maxPages}mm`,
            position: 'relative',
          }}
        >
          <div
            style={{
              padding: '20mm 25mm',
              position: 'relative',
              backgroundColor: 'white',
            }}
          >
            {/* Tout le contenu du contrat - CAPTURE ICI (sans padding) */}
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

            {/* Indicateurs de pagination générés dynamiquement */}
            {pageIndicators}
          </div>
        </div>

        {/* Helper text avec légende */}
        <div
          style={{
            textAlign: 'left',
            padding: '1rem',
            fontSize: '0.875rem',
            color: '#666',
            backgroundColor: '#f3f4f6',
            borderRadius: '0.375rem',
            marginTop: '1rem',
          }}
        >
          <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
            ℹ️ Aperçu de pagination A4 (210×297mm) - {maxPages} pages max
          </p>
          <ul style={{ marginLeft: '1.5rem', marginTop: '0.5rem', lineHeight: '1.6' }}>
            <li><span style={{ color: '#ef4444', fontWeight: 'bold' }}>Lignes rouges</span> : Limites de chaque page</li>
            <li><span style={{ color: '#6b7280', fontWeight: 'bold' }}>Bandes grises</span> : Sauts de page</li>
            <li>Marges actuelles : Haut/Bas = 20mm, Gauche/Droite = 25mm</li>
            <li>Zone imprimable par page : {PRINTABLE_HEIGHT_MM}mm hauteur × 160mm largeur</li>
            <li>Le système génère automatiquement {maxPages} pages d'indicateurs</li>
          </ul>
          <p style={{ marginTop: '0.5rem', fontStyle: 'italic', fontSize: '0.8rem' }}>
            Ajustez les marges dans constants.ts (padding: '20mm 25mm') si besoin.
          </p>
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
