/**
 * Contract signature component
 * Displays signature area for employer and employee
 */

import type { ContractSignatureProps } from './types'

export function ContractSignature({ employee }: ContractSignatureProps) {
  const currentDate = new Date().toLocaleDateString('fr-FR')

  return (
    <div style={{ marginTop: '40px', pageBreakInside: 'avoid' }}>
      {/* Statement */}
      <p style={{ marginBottom: '20px' }}>
        Fait en deux exemplaires originaux dont chaque partie reconnait avoir recu le sien.
      </p>

      {/* Date and place */}
      <p style={{ marginBottom: '40px' }}>
        <span>A </span>
        <span
          style={{
            borderBottom: '1px solid #000',
            paddingBottom: '2px',
            paddingLeft: '5px',
            paddingRight: '50px',
            marginRight: '40px',
          }}
        >
          STRASBOURG
        </span>
        <span>Le </span>
        <span
          style={{
            borderBottom: '1px solid #000',
            paddingBottom: '2px',
            paddingLeft: '5px',
            paddingRight: '50px',
          }}
        >
          {currentDate}
        </span>
      </p>

      {/* Signatures */}
      <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '80px' }}>
        {/* Employer signature */}
        <div style={{ textAlign: 'center' }}>
          <p style={{ marginBottom: '10px', fontWeight: 'bold' }}>Pour la Societe</p>
          <p style={{ marginBottom: '80px' }}>ILY SARL</p>
          <p
            style={{
              borderTop: '1px solid #000',
              paddingTop: '5px',
              display: 'inline-block',
              minWidth: '200px',
            }}
          >
            Signature
          </p>
        </div>

        {/* Employee signature */}
        <div style={{ textAlign: 'center' }}>
          <p style={{ marginBottom: '10px', fontWeight: 'bold' }}>Le Salarie</p>
          <p style={{ marginBottom: '80px' }}>
            {employee.lastName} {employee.firstName}
          </p>
          <p
            style={{
              borderTop: '1px solid #000',
              paddingTop: '5px',
              display: 'inline-block',
              minWidth: '200px',
            }}
          >
            Signature
            <br />
            <span style={{ fontSize: '9pt', fontStyle: 'italic' }}>Lu et approuve</span>
          </p>
        </div>
      </div>
    </div>
  )
}
