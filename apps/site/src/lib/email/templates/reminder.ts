/**
 * Template email : Rappel de réservation
 * Couleur : YELLOW (#F59E0B)
 *
 * Pour modifier ce template, éditez directement ce fichier.
 */

import { getSpaceDisplayName } from "@coworking-cafe/email";
import type { ReminderEmailData } from "@/types/cron";

export function generateReminderEmail(data: ReminderEmailData): string {
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
      .email-header { background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%) !important; }
      .email-content { background: #1f2937 !important; color: #f3f4f6 !important; }
      .email-content p, .email-content strong { color: #f3f4f6 !important; }
      .details-box { background: #78350f !important; border-color: #d97706 !important; }
      .details-box h3 { color: #fcd34d !important; }
      .detail-row { border-color: #92400e !important; }
      .detail-label { color: #fcd34d !important; }
      .detail-value { color: #fef3c7 !important; }
      .contact-list li { color: #f3f4f6 !important; }
      .footer { background: #111827 !important; color: #9ca3af !important; }
      .footer p { color: #9ca3af !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; background-color: #fff;">
  <div class="email-container" style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; border: 1px solid #e5e7eb;">

    <!-- Header YELLOW -->
    <div class="email-header" style="background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%); color: white; padding: 40px 24px; text-align: center;">
      <h1 style="margin: 0 0 12px 0; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">🔔 Rappel de réservation</h1>
      <p style="margin: 0; font-size: 17px; opacity: 0.95; font-weight: 500;">Votre réservation est demain</p>
    </div>

    <!-- Contenu -->
    <div class="email-content" style="padding: 36px 24px; line-height: 1.7; color: #1f2937;">
      <p style="margin: 0 0 16px 0; font-size: 16px;">Bonjour <strong style="color: #F59E0B;">${data.name}</strong>,</p>

      <p style="margin: 0 0 24px 0; font-size: 16px;">Nous vous rappelons que vous avez une réservation prévue demain dans nos locaux.</p>

      <!-- Détails de la réservation - Highlighted -->
      <div class="details-box" style="background: #FFFBEB; border: 1px solid #F59E0B; padding: 24px; border-radius: 12px; margin: 28px 0;">
        <h3 style="margin: 0 0 20px 0; color: #D97706; text-align: center; font-size: 19px; font-weight: 700; letter-spacing: -0.3px; border-bottom: 2px solid #F59E0B; padding-bottom: 10px;">📅 Détails de votre réservation</h3>

        <div class="detail-row" style="padding: 14px 0; border-bottom: 1px solid #FCD34D;">
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td class="detail-label" style="font-weight: 600; color: #92400E; font-size: 15px;">Espace</td>
              <td class="detail-value" style="text-align: right; color: #111827; font-size: 15px; font-weight: 500;">${displaySpaceName}</td>
            </tr>
          </table>
        </div>

        <div class="detail-row" style="padding: 14px 0; border-bottom: 1px solid #FCD34D;">
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td class="detail-label" style="font-weight: 600; color: #92400E; font-size: 15px;">Date</td>
              <td class="detail-value" style="text-align: right; color: #111827; font-size: 15px; font-weight: 700;">${data.date}</td>
            </tr>
          </table>
        </div>

        <div class="detail-row" style="padding: 14px 0;">
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td class="detail-label" style="font-weight: 600; color: #92400E; font-size: 15px;">Horaires</td>
              <td class="detail-value" style="text-align: right; color: #111827; font-size: 15px; font-weight: 700;">${data.time}</td>
            </tr>
          </table>
        </div>
      </div>

      <p style="margin: 28px 0 0 0; font-size: 16px; line-height: 1.7;">Nous nous réjouissons de vous accueillir ! Si vous avez des questions ou si vous souhaitez modifier votre réservation, n'hésitez pas à nous contacter.</p>

      <!-- Contact -->
      <div style="background: #fffbeb; border-left: 4px solid #F59E0B; padding: 20px; border-radius: 8px; margin: 28px 0;">
        <p style="margin: 0 0 12px 0; font-weight: 700; color: #92400E !important; font-size: 16px;">📞 Pour toute question :</p>
        <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%;">
          <tr>
            <td style="padding: 4px 0; font-size: 15px; color: #92400E;">
              <strong style="color: #92400E !important;">Téléphone :</strong> <a href="tel:0987334519" style="color: #F59E0B; text-decoration: none;">09 87 33 45 19</a>
            </td>
          </tr>
          <tr>
            <td style="padding: 4px 0; font-size: 15px; color: #92400E;">
              <strong style="color: #92400E !important;">Email :</strong> <a href="mailto:${data.contactEmail}" style="color: #F59E0B; text-decoration: none;">${data.contactEmail}</a>
            </td>
          </tr>
        </table>
      </div>

      <p style="margin: 32px 0 0 0; font-size: 16px; line-height: 1.8;">
        À très bientôt dans nos locaux,<br>
        <strong style="color: #F59E0B; font-size: 17px;">L'équipe CoworKing Café by Anticafé</strong>
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
