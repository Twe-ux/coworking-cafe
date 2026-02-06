/**
 * Email template for deposit released notification
 * Sent when a deposit hold is released (e.g., when reservation is marked as present)
 * Green theme (#10B981) to indicate success
 */

import { getSpaceDisplayName } from "./helpers";

interface DepositReleasedData {
  name: string;
  spaceName: string;
  date: string;
  depositAmount: number;
}

export function generateDepositReleasedEmail(
  data: DepositReleasedData
): string {
  const displaySpaceName = getSpaceDisplayName(data.spaceName);

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
  <style>
    @media (prefers-color-scheme: dark) {
      .email-container { background: #1f2937 !important; border-color: #374151 !important; }
      .email-header { background: linear-gradient(135deg, #10B981 0%, #059669 100%) !important; }
      .email-content { background: #1f2937 !important; color: #f3f4f6 !important; }
      .email-content p, .email-content strong { color: #f3f4f6 !important; }
      .details-box { background: #111827 !important; border-color: #10B981 !important; }
      .details-box h2 { color: #10B981 !important; }
      .details-box td { color: #f3f4f6 !important; }
      .detail-label { color: #9ca3af !important; }
      .detail-value { color: #f3f4f6 !important; }
      .success-box { background: #065f46 !important; border-color: #10b981 !important; }
      .success-box p, .success-box strong { color: #d1fae5 !important; }
      .info-box { background: #1e3a8a !important; border-color: #3b82f6 !important; }
      .info-box p, .info-box strong { color: #dbeafe !important; }
      .footer { background: #111827 !important; color: #9ca3af !important; }
      .footer p { color: #9ca3af !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; background-color: #fff;">
  <div class="email-container" style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; border: 1px solid #e5e7eb;">

    <!-- Header GREEN -->
    <div class="email-header" style="background: linear-gradient(135deg, #10B981 0%, #059669 100%); color: white; padding: 40px 24px; text-align: center;">
      <h1 style="margin: 0 0 12px 0; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">✅ Empreinte bancaire libérée</h1>
      <p style="margin: 0; font-size: 17px; opacity: 0.95; font-weight: 500;">Votre empreinte a été annulée</p>
    </div>

    <!-- Contenu -->
    <div class="email-content" style="padding: 36px 24px; line-height: 1.7; color: #1f2937;">
      <p style="margin: 0 0 16px 0; font-size: 16px;">
        Bonjour <strong style="color: #10B981;">${data.name}</strong>,
      </p>

      <p style="margin: 0 0 24px 0; font-size: 16px;">
        Bonne nouvelle ! L'empreinte bancaire pour votre réservation a été automatiquement libérée.
      </p>

      <!-- Success Box -->
      <div class="success-box" style="background: #ecfdf5; border-left: 4px solid #10B981; padding: 20px; border-radius: 8px; margin: 28px 0;">
        <p style="margin: 0 0 12px 0; font-weight: 700; color: #065f46 ; font-size: 16px;">💳 Montant libéré</p>
        <p style="margin: 0; color: #065f46 ; font-size: 15px; line-height: 1.7;">
          L'empreinte bancaire de <strong style="color: #065f46 ;">${data.depositAmount.toFixed(
            2
          )} €</strong> a été annulée. Aucun montant n'a été prélevé sur votre carte.
        </p>
      </div>

      <!-- Booking details box -->
      <div class="details-box" style="background-color: #f9fafb; border-radius: 12px; padding: 24px; margin: 28px 0; border: 1px solid #10B981;">
        <h2 style="margin: 0 0 20px 0; color: #10B981; font-size: 19px; font-weight: 700; letter-spacing: -0.3px; border-bottom: 2px solid #10B981; padding-bottom: 10px;">
          📋 Détails de la réservation
        </h2>

        <div class="detail-row" style="padding: 14px 0; border-bottom: 1px solid #e5e7eb;">
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td class="detail-label" style="font-weight: 600; color: #6b7280; font-size: 15px;">Espace</td>
              <td class="detail-value" style="text-align: right; color: #111827; font-size: 15px; font-weight: 500;">${displaySpaceName}</td>
            </tr>
          </table>
        </div>

        <div class="detail-row" style="padding: 14px 0; border-bottom: 1px solid #e5e7eb;">
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td class="detail-label" style="font-weight: 600; color: #6b7280; font-size: 15px;">Date</td>
              <td class="detail-value" style="text-align: right; color: #111827; font-size: 15px; font-weight: 500;">${
                data.date
              }</td>
            </tr>
          </table>
        </div>

        <div style="padding: 16px 0 0 0;">
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td class="detail-label" style="font-weight: 700; color: #10B981; font-size: 16px;">Montant libéré</td>
              <td class="price-value" style="text-align: right; color: #10B981; font-weight: 700; font-size: 22px; letter-spacing: -0.5px;">${data.depositAmount.toFixed(
                2
              )} €</td>
            </tr>
          </table>
        </div>
      </div>

      <!-- Info Box -->
      <div class="info-box" style="background: #eff6ff; border-left: 4px solid #3B82F6; padding: 20px; border-radius: 8px; margin: 28px 0;">
        <p style="margin: 0 0 12px 0; font-weight: 700; color: #1e40af; font-size: 16px;">ℹ️ Information</p>
        <p style="margin: 0; color: #1e40af ; font-size: 15px; line-height: 1.7;">
          L'empreinte bancaire a été automatiquement levée car vous avez été marqué(e) comme présent(e) à votre réservation. Aucun montant n'a été débité de votre carte.
        </p>
      </div>

      <p style="margin: 28px 0 16px 0; font-size: 16px; line-height: 1.7;">
        Merci d'avoir choisi notre espace de coworking !
      </p>

      <!-- Contact -->
      <div style="background: #f0fdf4; border-left: 4px solid #10B981; padding: 20px; border-radius: 8px; margin: 28px 0;">
        <p style="margin: 0 0 12px 0; font-weight: 700; color: #065f46 !important; font-size: 16px;">📞 Pour toute question :</p>
        <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%;">
          <tr>
            <td style="padding: 4px 0; font-size: 15px; color: #065f46 !important;">
              <strong style="color: #065f46 !important;">Téléphone :</strong> <a href="tel:0987334519" style="color: #10B981 !important; text-decoration: none;">09 87 33 45 19</a>
            </td>
          </tr>
          <tr>
            <td style="padding: 4px 0; font-size: 15px; color: #065f46 !important;">
              <strong style="color: #065f46 !important;">Email :</strong> <a href="mailto:${data.contactEmail}" style="color: #10B981 !important; text-decoration: none;">${data.contactEmail}</a>
            </td>
          </tr>
        </table>
      </div>

      <p style="margin: 32px 0 0 0; font-size: 16px; line-height: 1.8;">
        À très bientôt,<br>
        <strong style="color: #10B981; font-size: 17px;">L'équipe CoworKing Café by Anticafé</strong>
      </p>
    </div>

    <!-- Footer -->
    <div class="footer" style="background: #f9fafb; padding: 24px; text-align: center; color: #6b7280; font-size: 14px; border-top: 1px solid #e5e7eb;">
      <p style="margin: 0 0 8px 0; font-weight: 700; color: #111827; font-size: 15px;">CoworKing Café by Anticafé</p>
      <p style="margin: 0 0 4px 0; color: #6b7280;">1 rue de la Division Leclerc, 67000 Strasbourg</p>
      <p style="margin: 0; color: #6b7280;">L-V: 09h-20h | S-D & JF: 10h-20h</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}
