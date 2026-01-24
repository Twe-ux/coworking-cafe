/**
 * Contract parties component
 * Displays employer and employee information tables
 */

import type { ContractPartiesProps } from "./types";
import { COMPANY_INFO, CONTRACT_STYLES, TABLE_STYLES } from "./constants";

// Table row component for cleaner code
interface TableRowProps {
  label: React.ReactNode;
  value: React.ReactNode;
}

function TableRow({ label, value }: TableRowProps) {
  return (
    <tr>
      <td
        style={{
          ...TABLE_STYLES.cell,
          width: "40%",
          fontWeight: "bold",
          textAlign: "left",
        }}
      >
        {label}
      </td>
      <td style={{ ...TABLE_STYLES.cell, textAlign: "left" }}>{value}</td>
    </tr>
  );
}

// Employer information table
function EmployerTable() {
  return (
    <table style={{ ...TABLE_STYLES.table, marginBottom: "15px" }}>
      <tbody>
        <TableRow label="Société (raison sociale)" value={COMPANY_INFO.name} />
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
              Représentée par
              <br />
              Agissant en qualité de
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
              Immatriculée a l&apos;URSSAF de
              <br />
              Numéro d&apos;immatriculation
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
  );
}

// Employee information table
interface EmployeeTableProps {
  employee: ContractPartiesProps["employee"];
}

function EmployeeTable({ employee }: EmployeeTableProps) {
  // Format date properly - handle both Date objects and string dates
  let birthDate = "";
  try {
    if (employee.dateOfBirth) {
      const date = typeof employee.dateOfBirth === 'string'
        ? new Date(employee.dateOfBirth)
        : employee.dateOfBirth;
      birthDate = date.toLocaleDateString("fr-FR");
    }
  } catch (error) {
    console.error("Error formatting birth date:", error);
    birthDate = "";
  }

  // Format place of birth
  const placeOfBirthStr = employee.placeOfBirth
    ? [
        employee.placeOfBirth.city,
        employee.placeOfBirth.department ? `(${employee.placeOfBirth.department})` : "",
        employee.placeOfBirth.country
      ].filter(Boolean).join(" ")
    : "";

  return (
    <table style={{ ...TABLE_STYLES.table, marginBottom: "15px" }}>
      <tbody>
        <TableRow
          label={
            <>
              Nom
              <br />
              Prénom(s)
            </>
          }
          value={
            <>
              {employee.lastName || ""}
              <br />
              {employee.firstName || ""}
            </>
          }
        />
        <TableRow
          label="Date et lieu de naissance"
          value={
            <>
              {birthDate}
              <br />
              {placeOfBirthStr}
            </>
          }
        />
        <TableRow
          label="Numéro de sécurité sociale"
          value={employee.socialSecurityNumber || ""}
        />
        <TableRow
          label="Adresse du domicile"
          value={employee.address?.street || ""}
        />
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
              {employee.address?.postalCode || ""}
              <br />
              {employee.address?.city || ""}
            </>
          }
        />
        <TableRow label="Nationalité" value="FRANCAISE" />
        <TableRow
          label={
            <>
              N° Titre de séjour - travail
              <br />
              Date d&apos;expiration
            </>
          }
          value=""
        />
      </tbody>
    </table>
  );
}

export function ContractParties({ employee }: ContractPartiesProps) {
  const isFullTime = employee.contractualHours >= 35;

  return (
    <div style={CONTRACT_STYLES.section}>
      <h3 style={CONTRACT_STYLES.sectionTitle}>Entre les soussignés</h3>

      {/* Employer */}
      <EmployerTable />
      <p style={{ fontStyle: "italic", marginBottom: "20px" }}>
        Ci-après l&apos;Employeur
      </p>

      {/* Employee */}
      <EmployeeTable employee={employee} />
      <p style={{ fontStyle: "italic", marginBottom: "20px" }}>
        Ci-après le Salarié
      </p>

      {/* Contract introduction */}
      <p style={{ marginTop: "20px", lineHeight: "1.6" }}>
        Le présent contrat est conclu à durée indéterminée à temps{" "}
        {isFullTime ? "complet" : "partiel"}. Il est régi par les dispositions
        générales de la{" "}
        <strong>
          Convention Collective Nationale des Hotels, Cafés, Restaurants
        </strong>{" "}
        du 30 avril 1997, dont le Salarie reconnaît avoir pris connaissance et
        les conditions particulières ci-après :
      </p>
    </div>
  );
}
