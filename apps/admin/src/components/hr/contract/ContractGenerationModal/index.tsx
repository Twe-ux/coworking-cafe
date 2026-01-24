'use client'

/**
 * ContractGenerationModal
 * Modal for generating employment contracts as PDF
 *
 * Structure:
 * - index.tsx (this file): Main modal component (<150 lines)
 * - types.ts: TypeScript interfaces
 * - constants.ts: Configuration (days, company info, styles)
 * - hooks/useContractCalculations.ts: Salary/hours calculations
 * - hooks/useContractGeneration.ts: PDF generation logic
 * - ContractContent.tsx: Assembles all sections
 * - ContractHeader.tsx: Title section
 * - ContractParties.tsx: Employer/employee info
 * - ContractArticles.tsx: Legal articles
 * - AvailabilityTable.tsx: Work schedule table
 * - DistributionTable.tsx: Weekly distribution table
 * - ContractSignature.tsx: Signature section
 */

import { useRef, useState } from 'react'
import { FileText, FileDown } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'

import type { ContractGenerationModalProps } from './types'
import { useContractGeneration } from './hooks/useContractGeneration'
import { useContractCalculations } from './hooks/useContractCalculations'
import { ContractContent } from './ContractContent'

// Re-export for backward compatibility
export type { ContractGenerationModalProps } from './types'

export function ContractGenerationModal({
  open,
  onOpenChange,
  employee,
}: ContractGenerationModalProps) {
  const [isEditing, setIsEditing] = useState(true)
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit')
  const [zoom, setZoom] = useState(100)
  const contractRef = useRef<HTMLDivElement>(null)

  const { monthlySalary, monthlyHours } = useContractCalculations({ employee })

  const { generating, generatePDF } = useContractGeneration({
    employee,
    contractRef,
    onSuccess: () => onOpenChange(false),
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Contrat de Travail - {employee.firstName} {employee.lastName}
          </DialogTitle>
        </DialogHeader>

        {/* View mode toggle */}
        <div className="flex items-center justify-between mb-4 gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Switch
                id="edit-mode"
                checked={isEditing}
                onCheckedChange={setIsEditing}
              />
              <Label htmlFor="edit-mode">
                {isEditing ? 'Mode édition' : 'Lecture seule'}
              </Label>
            </div>

            <div className="flex items-center gap-2 border-l pl-4">
              <Label htmlFor="view-mode" className="text-sm">Affichage:</Label>
              <select
                id="view-mode"
                value={viewMode}
                onChange={(e) => setViewMode(e.target.value as 'edit' | 'preview')}
                className="text-sm border rounded px-2 py-1"
              >
                <option value="edit">Normal</option>
                <option value="preview">Aperçu A4</option>
              </select>
            </div>

            {viewMode === 'preview' && (
              <div className="flex items-center gap-2 border-l pl-4">
                <Label htmlFor="zoom" className="text-sm">Zoom:</Label>
                <select
                  id="zoom"
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="text-sm border rounded px-2 py-1"
                >
                  <option value="75">75%</option>
                  <option value="100">100%</option>
                  <option value="125">125%</option>
                  <option value="150">150%</option>
                </select>
              </div>
            )}
          </div>
          <span className="text-sm text-muted-foreground">
            {viewMode === 'preview'
              ? 'Aperçu final avec pagination A4'
              : isEditing
              ? 'Vous pouvez modifier le contrat'
              : 'Prévisualisation'}
          </span>
        </div>

        {/* Contract content */}
        <div
          className={viewMode === 'preview' ? 'bg-gray-100 p-4' : ''}
          style={{
            transform: viewMode === 'preview' ? `scale(${zoom / 100})` : undefined,
            transformOrigin: 'top center',
            transition: 'transform 0.2s ease'
          }}
        >
          <ContractContent
            employee={employee}
            isEditing={isEditing}
            monthlySalary={monthlySalary}
            monthlyHours={monthlyHours}
            contractRef={contractRef}
            viewMode={viewMode}
          />
        </div>

        {/* Footer actions */}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={generatePDF} disabled={generating}>
            {generating ? (
              <>Generation en cours...</>
            ) : (
              <>
                <FileDown className="w-4 h-4 mr-2" />
                Generer le PDF
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Default export for convenience
export default ContractGenerationModal
