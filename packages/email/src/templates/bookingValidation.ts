/**
 * Template email : Réservation validée/confirmée
 * Couleur : VERT FONCÉ (#059669)
 *
 * Template unifié pour validation de réservation CLIENT ou ADMIN
 * - variant 'client' : Ton chaleureux, "validée"
 * - variant 'admin' : Ton neutre, "confirmée"
 */

import { getSpaceDisplayName, getPriceDisclaimerNote } from "./helpers";

export interface BookingValidationEmailData {
  name: string;
  spaceName: string;
  date: string;
  startTime: string;
  endTime: string;
  numberOfPeople: number;
  totalPrice: number;
  confirmationNumber?: string;
  contactEmail: string;
}

export type BookingValidationVariant = 'client' | 'admin';

export function generateBookingValidationEmail(
  data: BookingValidationEmailData,
  variant: BookingValidationVariant = 'client'
): string {
  const displaySpaceName = getSpaceDisplayName(data.spaceName);

  // Wording adapté au variant
  const title = variant === 'client' ? '🎉 Réservation validée !' : '✅ Réservation confirmée';
  const subtitle = variant === 'client' ? 'Votre réservation est confirmée' : 'Tout est en ordre';
  const mainMessage = variant === 'client'
    ? 'Excellente nouvelle ! Votre réservation a été <strong>validée par notre équipe</strong>.'
    : 'Votre réservation a été <strong>confirmée</strong>.';
  const badge = variant === 'client' ? '✓ Réservation validée' : '✓ Réservation confirmée';
  const closingMessage = variant === 'client'
    ? 'Tout est prêt pour votre venue ! Nous sommes impatients de vous accueillir dans nos locaux.'
    : 'Tout est prêt pour votre venue. Nous vous attendons.';

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
      .email-header { background: linear-gradient(135deg, #059669 0%, #047857 100%) !important; }
      .email-content { background: #1f2937 !important; color: #f3f4f6 !important; }
      .email-content p, .email-content li, .email-content strong { color: #f3f4f6 !important; }
      .details-box { background: #111827 !important; border-color: #10B981 !important; }
      .details-box h3 { color: #10b981 !important; }
      .detail-row { border-color: #374151 !important; }
      .detail-label { color: #9ca3af !important; }
      .detail-value { color: #f3f4f6 !important; }
      .price-value { color: #10b981 !important; }
      .footer { background: #111827 !important; color: #9ca3af !important; }
      .footer p { color: #9ca3af !important; }
      .success-badge { background: #065f46 !important; color: #d1fae5 !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; background-color: #fff;">
  <div class="email-container" style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; border: 1px solid #e5e7eb;">

    <!-- Header VERT FONCÉ -->
    <div class="email-header" style="background: linear-gradient(135deg, #059669 0%, #047857 100%); color: white; padding: 40px 24px; text-align: center;">
      <h1 style="margin: 0 0 12px 0; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">${title}</h1>
      <p style="margin: 0; font-size: 17px; opacity: 0.95; font-weight: 500;">${subtitle}</p>
    </div>

    <!-- Contenu -->
    <div class="email-content" style="padding: 36px 24px; line-height: 1.7; color: #1f2937;">
      <p style="margin: 0 0 16px 0; font-size: 16px;">Bonjour <strong style="color: #059669;">${data.name}</strong>,</p>

      <p style="margin: 0 0 24px 0; font-size: 16px;">${mainMessage}</p>

      <!-- Success Badge -->
      <div style="text-align: center; margin: 28px 0;">
        <div class="success-badge" style="display: inline-block; background: #D1FAE5; color: #065F46; padding: 14px 28px; border-radius: 25px; font-weight: 700; font-size: 17px; letter-spacing: 0.3px;">
          ${badge}
        </div>
      </div>

      <!-- Détails de la réservation -->
      <div class="details-box" style="background: #f9fafb; padding: 24px; border-radius: 12px; margin: 28px 0; border: 1px solid #10B981;">
        <h3 style="margin: 0 0 20px 0; color: #059669; font-size: 19px; font-weight: 700; letter-spacing: -0.3px;">📋 Détails de votre réservation</h3>

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
              <td class="detail-label" style="font-weight: 600; color: #6b7280; font-size: 15px;">Nombre de personnes</td>
              <td class="detail-value" style="text-align: right; color: #111827; font-size: 15px; font-weight: 500;">${data.numberOfPeople} ${data.numberOfPeople > 1 ? "personnes" : "personne"}</td>
            </tr>
          </table>
        </div>

        <div class="detail-row" style="padding: 14px 0; border-bottom: 1px solid #e5e7eb;">
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td class="detail-label" style="font-weight: 600; color: #6b7280; font-size: 15px;">Date</td>
              <td class="detail-value" style="text-align: right; color: #111827; font-size: 15px; font-weight: 500;">${data.date}</td>
            </tr>
          </table>
        </div>

        <div class="detail-row" style="padding: 14px 0; border-bottom: 1px solid #e5e7eb;">
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td class="detail-label" style="font-weight: 600; color: #6b7280; font-size: 15px;">Horaires</td>
              <td class="detail-value" style="text-align: right; color: #111827; font-size: 15px; font-weight: 500;">${data.startTime} - ${data.endTime}</td>
            </tr>
          </table>
        </div>

        <div style="padding: 16px 0 0 0;">
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td class="detail-label" style="font-weight: 700; color: #111827; font-size: 16px;">Prix total</td>
              <td class="price-value" style="text-align: right; color: #059669; font-weight: 700; font-size: 22px; letter-spacing: -0.5px;">${data.totalPrice.toFixed(2)}€*</td>
            </tr>
          </table>
        </div>
      </div>

      <!-- Price disclaimer -->
      ${getPriceDisclaimerNote()}

      <p style="margin: 28px 0 0 0; font-size: 16px; line-height: 1.7;">${closingMessage}</p>

      <!-- Contact -->
      <div style="background: #f0fdf4; border-left: 4px solid #059669; padding: 20px; border-radius: 8px; margin: 28px 0;">
        <p style="margin: 0 0 12px 0; font-weight: 700; color: #065f46 !important; font-size: 16px;">📞 Pour toute question :</p>
        <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%;">
          <tr>
            <td style="padding: 4px 0; font-size: 15px; color: #065f46 !important;">
              <strong style="color: #065f46 !important;">Téléphone :</strong> <a href="tel:0987334519" style="color: #059669 !important; text-decoration: none;">09 87 33 45 19</a>
            </td>
          </tr>
          <tr>
            <td style="padding: 4px 0; font-size: 15px; color: #065f46 !important;">
              <strong style="color: #065f46 !important;">Email :</strong> <a href="mailto:${data.contactEmail}" style="color: #059669 !important; text-decoration: none;">${data.contactEmail}</a>
            </td>
          </tr>
        </table>
      </div>

      <p style="margin: 32px 0 0 0; font-size: 16px; line-height: 1.8;">
        À très bientôt,<br>
        <strong style="color: #059669; font-size: 17px;">L'équipe CoworKing Café by Anticafé</strong>
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
