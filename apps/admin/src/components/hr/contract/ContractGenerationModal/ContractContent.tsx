/**
 * Contract content component
 * Assembles all contract sections into the printable document
 */

import type { ContractContentProps } from './types'
import { CONTRACT_STYLES } from './constants'
import { useContractCalculations } from './hooks/useContractCalculations'
import { ContractHeader } from './ContractHeader'
import { ContractParties } from './ContractParties'
import { ContractArticles } from './ContractArticles'
import { ContractSignature } from './ContractSignature'

export function ContractContent({
  employee,
  isEditing,
  contractRef,
}: ContractContentProps) {
  const { monthlySalary, monthlyHours, isFullTime } = useContractCalculations({ employee })

  return (
    <div
      ref={contractRef}
      contentEditable={isEditing}
      suppressContentEditableWarning
      style={CONTRACT_STYLES.container}
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
    </div>
  )
}
