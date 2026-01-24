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

        {/* Edit mode toggle */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Switch
              id="edit-mode"
              checked={isEditing}
              onCheckedChange={setIsEditing}
            />
            <Label htmlFor="edit-mode">
              {isEditing ? 'Mode edition active' : 'Mode lecture seule'}
            </Label>
          </div>
          <span className="text-sm text-muted-foreground">
            {isEditing
              ? 'Vous pouvez modifier le contrat avant de le generer'
              : 'Previsualisation finale'}
          </span>
        </div>

        {/* Contract content */}
        <ContractContent
          employee={employee}
          isEditing={isEditing}
          monthlySalary={monthlySalary}
          monthlyHours={monthlyHours}
          contractRef={contractRef}
        />

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
