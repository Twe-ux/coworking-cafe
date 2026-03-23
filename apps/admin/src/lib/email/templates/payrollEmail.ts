/**
 * Email template for monthly payroll with optional contract/resignation/trial termination attachments
 * Blue theme (#1e40af) for payroll communications
 */

interface PayrollEmailOptions {
  monthName: string;
  year: number;
  hasContract: boolean;
  hasResignation: boolean;
  hasTrialTermination?: boolean;
  hasDpae?: boolean;
}

/**
 * Build email subject with indicators for extra attachments
 */
export function buildPayrollSubject({
  monthName,
  year,
  hasContract,
  hasResignation,
  hasTrialTermination,
  hasDpae,
}: PayrollEmailOptions): string {
  let subject = `Récapitulatif Paie - ${monthName} ${year}`;
  if (hasContract) subject += " [+ Contrat]";
  if (hasDpae) subject += " [+ DPAE]";
  if (hasResignation) subject += " [+ Démission]";
  if (hasTrialTermination) subject += " [+ Rupture P.E.]";
  return subject;
}

/**
 * Build supplementary documents section (shown only when extra attachments exist)
 */
function buildAttachmentSection(
  hasContract: boolean,
  hasResignation: boolean,
  hasTrialTermination?: boolean,
  hasDpae?: boolean
): string {
  if (!hasContract && !hasResignation && !hasTrialTermination && !hasDpae) return "";

  const sections: string[] = [];

  // New employee section (contract + DPAE)
  if (hasContract || hasDpae) {
    const newEmployeeDocs: string[] = [];
    if (hasContract) {
      newEmployeeDocs.push("<li><strong>Contrat de travail</strong></li>");
    }
    if (hasDpae) {
      newEmployeeDocs.push("<li><strong>DPAE (Déclaration Préalable À l'Embauche)</strong></li>");
    }

    sections.push(`
      <div style="margin: 20px 0; padding: 15px; background-color: #ecfdf5; border-left: 4px solid #10b981; border-radius: 4px;">
        <p style="margin: 0 0 8px 0; font-weight: bold; color: #10b981;">
          ✅ Nouvel employé embauché ce mois-ci
        </p>
        <p style="margin: 0 0 8px 0; color: #374151;">
          Un nouveau salarié a rejoint l'équipe. Vous trouverez en pièces jointes :
        </p>
        <ul style="margin: 0; padding-left: 20px; line-height: 1.8; color: #374151;">
          ${newEmployeeDocs.join("\n          ")}
        </ul>
      </div>
    `);
  }

  // Resignation section
  if (hasResignation) {
    sections.push(`
      <div style="margin: 20px 0; padding: 15px; background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px;">
        <p style="margin: 0 0 8px 0; font-weight: bold; color: #f59e0b;">
          ⚠️ Démission enregistrée ce mois-ci
        </p>
        <p style="margin: 0 0 8px 0; color: #374151;">
          Un employé a donné sa démission. Vous trouverez en pièce jointe :
        </p>
        <ul style="margin: 0; padding-left: 20px; line-height: 1.8; color: #374151;">
          <li><strong>Lettre de démission</strong> (scan original)</li>
        </ul>
      </div>
    `);
  }

  // Trial period termination section
  if (hasTrialTermination) {
    sections.push(`
      <div style="margin: 20px 0; padding: 15px; background-color: #fee2e2; border-left: 4px solid #ef4444; border-radius: 4px;">
        <p style="margin: 0 0 8px 0; font-weight: bold; color: #ef4444;">
          🚫 Rupture de période d'essai ce mois-ci
        </p>
        <p style="margin: 0 0 8px 0; color: #374151;">
          Un employé a été licencié durant sa période d'essai. Vous trouverez en pièce jointe :
        </p>
        <ul style="margin: 0; padding-left: 20px; line-height: 1.8; color: #374151;">
          <li><strong>Lettre de rupture de période d'essai</strong> (scan original)</li>
        </ul>
      </div>
    `);
  }

  return sections.join("\n");
}

/**
 * Build the full payroll email HTML
 */
export function buildPayrollEmailHtml({
  monthName,
  year,
  hasContract,
  hasResignation,
  hasTrialTermination,
  hasDpae,
}: PayrollEmailOptions): string {
  const attachmentSection = buildAttachmentSection(hasContract, hasResignation, hasTrialTermination, hasDpae);

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #1e40af;">Récapitulatif Paie - ${monthName} ${year}</h2>

      <p>Bonjour,</p>

      <p>Veuillez trouver ci-joint le récapitulatif de paie pour le mois de <strong>${monthName} ${year}</strong>.</p>

      <p>Ce document contient :</p>
      <ul>
        <li>Informations complètes des employés (nom, adresse, N° sécu)</li>
        <li>Dates de contrat (début et fin si applicable)</li>
        <li>Heures contractuelles et heures réalisées</li>
        <li>Heures supplémentaires calculées</li>
        <li>Statut mutuelle</li>
      </ul>
      ${attachmentSection}
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;" />

      <p style="font-size: 12px; color: #6b7280;">
        Ce message a été envoyé automatiquement depuis le système de gestion RH de CoworKing Café.
      </p>
    </div>
  `;
}
