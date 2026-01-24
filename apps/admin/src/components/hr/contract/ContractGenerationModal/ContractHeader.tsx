/**
 * Contract header component
 * Displays title and subtitle of the employment contract
 */

import { CONTRACT_STYLES } from "./constants";

interface ContractHeaderProps {
  isFullTime: boolean;
}

export function ContractHeader({ isFullTime }: ContractHeaderProps) {
  const contractType = isFullTime ? "COMPLET" : "PARTIEL";

  return (
    <div style={{ textAlign: "center", marginBottom: "40px" }}>
      <h1 style={CONTRACT_STYLES.title}>
        CONTRAT DE TRAVAIL MENSUEL A TEMPS {contractType} A DUREE INDETERMINEE
      </h1>
      <p style={CONTRACT_STYLES.subtitle}>
        Durée du travail répartie sur les semaines du mois
      </p>
    </div>
  );
}
