/**
 * Template email : Empreinte bancaire encaissée (no-show)
 * Couleur : ROUGE (#EF4444)
 *
 * Pour modifier ce template, éditez directement ce fichier.
 */

import { getSpaceDisplayName } from "./helpers";
import type { DepositCapturedEmailData } from "@/types/cron";

export function generateDepositCapturedEmail(
  data: DepositCapturedEmailData
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
      .email-header { background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%) !important; }
      .email-content { background: #1f2937 !important; color: #f3f4f6 !important; }
      .email-content p, .email-content strong { color: #f3f4f6 !important; }
      .warning-box { background: #7f1d1d !important; border-color: #dc2626 !important; }
      .warning-box p { color: #fecaca !important; }
      .details-box { background: #111827 !important; border-color: #EF4444 !important; }
      .details-box h3 { color: #EF4444 !important; }
      .detail-row { border-color: #374151 !important; }
      .detail-label { color: #9ca3af !important; }
      .detail-value { color: #f3f4f6 !important; }
      .price-value { color: #EF4444 !important; }
      .contact-list li { color: #f3f4f6 !important; }
      .footer { background: #111827 !important; color: #9ca3af !important; }
      .footer p { color: #9ca3af !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; background-color: #fff;">
  <div class="email-container" style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; border: 1px solid #e5e7eb;">

    <!-- Header ROUGE -->
    <div class="email-header" style="background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%); color: white; padding: 40px 24px; text-align: center;">
      <h1 style="margin: 0 0 12px 0; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">⚠️ Absence constatée</h1>
      <p style="margin: 0; font-size: 17px; opacity: 0.95; font-weight: 500;">Prélèvement effectué</p>
    </div>

    <!-- Contenu -->
    <div class="email-content" style="padding: 36px 24px; line-height: 1.7; color: #1f2937;">
      <p style="margin: 0 0 16px 0; font-size: 16px;">Bonjour <strong style="color: #EF4444;">${
        data.name
      }</strong>,</p>

      <p style="margin: 0 0 24px 0; font-size: 16px;">Nous constatons que vous ne vous êtes pas présenté à votre réservation.</p>

      <!-- Warning Box -->
      <div class="warning-box" style="background: #FEE2E2; border-left: 4px solid #EF4444; padding: 20px; border-radius: 8px; margin: 28px 0;">
        <p style="margin: 0 0 12px 0; font-weight: 700; color: #991B1B; font-size: 16px;">
          L'empreinte bancaire de ${data.depositAmount.toFixed(
            2
          )}€ a été encaissée.
        </p>
        <p style="margin: 0; color: #991B1B; font-size: 15px; line-height: 1.7;">
          Ce montant correspond aux frais de non-présentation conformément à nos conditions générales de vente.
        </p>
      </div>

      <!-- Détails de la réservation manquée -->
      <div class="details-box" style="background: #f9fafb; padding: 24px; border-radius: 12px; margin: 28px 0; border: 1px solid #EF4444;">
        <h3 style="margin: 0 0 20px 0; color: #EF4444; font-size: 19px; font-weight: 700; letter-spacing: -0.3px;">📋 Réservation concernée</h3>

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
              <td class="detail-label" style="font-weight: 700; color: #111827; font-size: 16px;">Montant prélevé</td>
              <td class="price-value" style="text-align: right; color: #EF4444; font-weight: 700; font-size: 22px; letter-spacing: -0.5px;">${data.depositAmount.toFixed(
                2
              )}€</td>
            </tr>
          </table>
        </div>
      </div>

      <p style="margin: 28px 0 16px 0; font-size: 16px; line-height: 1.7;">Nous comprenons que des imprévus peuvent survenir. Si vous souhaitez nous faire part de votre situation, n'hésitez pas à nous contacter.</p>

      <p style="margin: 0 0 28px 0; font-size: 16px; line-height: 1.7;">Nous restons à votre disposition pour toute future réservation.</p>

      <!-- Contact -->
      <div style="background: #fee2e2; border-left: 4px solid #EF4444 !important; padding: 20px; border-radius: 8px; margin: 28px 0;">
        <p style="margin: 0 0 12px 0; font-weight: 700; color: #991B1B !important; font-size: 16px;">📞 Pour toute question :</p>
        <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%;">
          <tr>
            <td style="padding: 4px 0; font-size: 15px; color: #991B1B !important;">
              <strong style="color: #991B1B !important;">Téléphone :</strong> <a href="tel:0987334519" style="color: #EF4444 !important; text-decoration: none;">09 87 33 45 19</a>
            </td>
          </tr>
          <tr>
            <td style="padding: 4px 0; font-size: 15px; color: #991B1B;">
              <strong style="color: #991B1B !important;">Email :</strong> <a href="mailto:${data.contactEmail}" style="color: #EF4444; text-decoration: none;">${data.contactEmail}</a>
            </td>
          </tr>
        </table>
      </div>

      <p style="margin: 32px 0 0 0; font-size: 16px; line-height: 1.8;">
        Cordialement,<br>
        <strong style="color: #EF4444; font-size: 17px;">L'équipe CoworKing Café by Anticafé</strong>
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
  `;
}
