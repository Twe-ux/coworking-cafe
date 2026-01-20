/**
 * Contract parties component
 * Displays employer and employee information tables
 */

import type { ContractPartiesProps } from './types'
import { COMPANY_INFO, CONTRACT_STYLES, TABLE_STYLES } from './constants'

// Table row component for cleaner code
interface TableRowProps {
  label: React.ReactNode
  value: React.ReactNode
}

function TableRow({ label, value }: TableRowProps) {
  return (
    <tr>
      <td style={{ ...TABLE_STYLES.cell, width: '40%', fontWeight: 'bold', textAlign: 'left' }}>
        {label}
      </td>
      <td style={{ ...TABLE_STYLES.cell, textAlign: 'left' }}>{value}</td>
    </tr>
  )
}

// Employer information table
function EmployerTable() {
  return (
    <table style={{ ...TABLE_STYLES.table, marginBottom: '15px' }}>
      <tbody>
        <TableRow label="Societe (raison sociale)" value={COMPANY_INFO.name} />
        <TableRow
          label="Adresse"
          value={
            <>
              {COMPANY_INFO.address.street}
              <br />
              {COMPANY_INFO.address.postalCode} {COMPANY_INFO.address.city}
            </>
          }
        />
        <TableRow
          label={
            <>
              Representee par
              <br />
              Agissant en qualite de
            </>
          }
          value={
            <>
              {COMPANY_INFO.representative.name}
              <br />
              {COMPANY_INFO.representative.role}
            </>
          }
        />
        <TableRow label="Code NAF" value={COMPANY_INFO.nafCode} />
        <TableRow
          label={
            <>
              Immatriculee a l&apos;URSSAF de
              <br />
              Numero d&apos;immatriculation
            </>
          }
          value={
            <>
              {COMPANY_INFO.urssaf.name}
              <br />
              {COMPANY_INFO.urssaf.number}
            </>
          }
        />
      </tbody>
    </table>
  )
}

// Employee information table
interface EmployeeTableProps {
  employee: ContractPartiesProps['employee']
}

function EmployeeTable({ employee }: EmployeeTableProps) {
  const birthDate = new Date(employee.dateOfBirth).toLocaleDateString('fr-FR')

  return (
    <table style={{ ...TABLE_STYLES.table, marginBottom: '15px' }}>
      <tbody>
        <TableRow
          label={
            <>
              Nom
              <br />
              Prenom(s)
            </>
          }
          value={
            <>
              {employee.lastName}
              <br />
              {employee.firstName}
            </>
          }
        />
        <TableRow
          label="Date et lieu de naissance"
          value={
            <>
              {birthDate}
              <br />
              {employee.placeOfBirth ?? ''}
            </>
          }
        />
        <TableRow label="Numero de securite sociale" value={employee.socialSecurityNumber} />
        <TableRow label="Adresse du domicile" value={employee.address?.street ?? ''} />
        <TableRow
          label={
            <>
              Code postal
              <br />
              Ville
            </>
          }
          value={
            <>
              {employee.address?.postalCode ?? ''}
              <br />
              {employee.address?.city ?? ''}
            </>
          }
        />
        <TableRow label="Nationalite" value="FRANCAISE" />
        <TableRow
          label={
            <>
              N Titre de sejour - travail
              <br />
              Date d&apos;expiration
            </>
          }
          value=""
        />
      </tbody>
    </table>
  )
}

export function ContractParties({ employee }: ContractPartiesProps) {
  const isFullTime = employee.contractualHours >= 35

  return (
    <div style={CONTRACT_STYLES.section}>
      <h3 style={CONTRACT_STYLES.sectionTitle}>Entre les soussignes</h3>

      {/* Employer */}
      <EmployerTable />
      <p style={{ fontStyle: 'italic', marginBottom: '20px' }}>Ci-apres l&apos;Employeur</p>

      {/* Employee */}
      <EmployeeTable employee={employee} />
      <p style={{ fontStyle: 'italic', marginBottom: '20px' }}>Ci-apres le Salarie</p>

      {/* Contract introduction */}
      <p style={{ marginTop: '20px', lineHeight: '1.6' }}>
        Le present contrat est conclu a duree indeterminee a temps{' '}
        {isFullTime ? 'complet' : 'partiel'}. Il est regi par les dispositions generales de la{' '}
        <strong>Convention Collective Nationale des Hotels, Cafes, Restaurants</strong> du 30
        avril 1997, dont le Salarie reconnait avoir pris connaissance et les conditions
        particulieres ci-apres :
      </p>
    </div>
  )
}
