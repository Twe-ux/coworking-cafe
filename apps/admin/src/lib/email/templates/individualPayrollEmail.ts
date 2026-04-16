/**
 * Email template for individual employee monthly hours recap
 * Sent to each employee with their personal hours summary
 */

const MONTH_NAMES = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

function formatHours(decimal: number): string {
  const h = Math.floor(decimal);
  const min = Math.round((decimal - h) * 60);
  if (min === 0) return `${h}h`;
  return `${h}h${min.toString().padStart(2, "0")}`;
}

interface IndividualPayrollEmailOptions {
  firstName: string;
  monthlyContractualHours: number;
  hoursWorked: number;
  paidLeaveHours: number;
  sickLeaveHours: number;
  overtimeHours: number;
  month: number;
  year: number;
}

function buildRow(label: string, value: string, highlight?: string): string {
  const color = highlight ?? "#374151";
  return `
    <tr>
      <td style="padding: 10px 16px; border-bottom: 1px solid #f3f4f6; color: #6b7280; font-size: 14px;">${label}</td>
      <td style="padding: 10px 16px; border-bottom: 1px solid #f3f4f6; font-weight: bold; font-size: 14px; color: ${color}; text-align: right;">${value}</td>
    </tr>
  `;
}

export function buildIndividualPayrollSubject(month: number, year: number): string {
  return `Récapitulatif de vos heures - ${MONTH_NAMES[month - 1]} ${year}`;
}

export function buildIndividualPayrollHtml({
  firstName,
  monthlyContractualHours,
  hoursWorked,
  paidLeaveHours,
  sickLeaveHours,
  overtimeHours,
  month,
  year,
}: IndividualPayrollEmailOptions): string {
  const monthName = MONTH_NAMES[month - 1];

  const cpRow = paidLeaveHours > 0
    ? buildRow("Congés payés (CP)", formatHours(paidLeaveHours), "#059669")
    : "";

  const amRow = sickLeaveHours > 0
    ? buildRow("Arrêt maladie (AM)", formatHours(sickLeaveHours), "#dc2626")
    : "";

  const supRow = overtimeHours > 0
    ? buildRow("Heures supplémentaires", formatHours(overtimeHours), "#d97706")
    : "";

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #111827;">
      <div style="background-color: #059669; padding: 24px 32px; border-radius: 8px 8px 0 0;">
        <h2 style="margin: 0; color: #ffffff; font-size: 20px;">
          Récapitulatif de vos heures
        </h2>
        <p style="margin: 4px 0 0 0; color: #d1fae5; font-size: 14px;">${monthName} ${year}</p>
      </div>

      <div style="background-color: #ffffff; border: 1px solid #e5e7eb; border-top: none; padding: 24px 32px; border-radius: 0 0 8px 8px;">
        <p style="margin: 0 0 20px 0;">Bonjour <strong>${firstName}</strong>,</p>
        <p style="margin: 0 0 20px 0; color: #6b7280; font-size: 14px;">
          Voici votre récapitulatif de pointage pour le mois de <strong>${monthName} ${year}</strong>.
        </p>

        <table style="width: 100%; border-collapse: collapse; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
          ${buildRow("Heures contractuelles", formatHours(monthlyContractualHours))}
          ${buildRow("Heures réalisées", formatHours(hoursWorked))}
          ${supRow}
          ${cpRow}
          ${amRow}
        </table>

        <p style="margin: 24px 0 0 0; font-size: 12px; color: #9ca3af;">
          En cas de question, contactez votre responsable RH.
        </p>
      </div>

      <p style="font-size: 11px; color: #9ca3af; text-align: center; margin-top: 16px;">
        Message automatique — CoworKing Café
      </p>
    </div>
  `;
}
