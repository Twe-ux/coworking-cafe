/**
 * Template email : Admin annule une réservation admin (usage interne)
 * Couleur : ROUGE (#EF4444)
 *
 * Envoyé quand l'admin annule une réservation créée par l'admin (usage interne).
 * Sans mention de libération d'empreinte bancaire (pas de paiement).
 */

import { getSpaceDisplayName, getPriceDisclaimerNote } from "./helpers";

export interface AdminCancelAdminBookingData {
  name: string;
  spaceName: string;
  date: string;
  startTime: string;
  endTime: string;
  numberOfPeople: number;
  totalPrice: number;
  reason?: string;
  contactEmail: string;
}

export function generateAdminCancelAdminBookingEmail(data: AdminCancelAdminBookingData): string {
  const displaySpaceName = getSpaceDisplayName(data.spaceName);
  const timeRange = data.startTime && data.endTime
    ? `${data.startTime} - ${data.endTime}`
    : "Journée complète";

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
      .details-box { background: #7f1d1d !important; border-color: #dc2626 !important; }
      .details-box h2 { color: #fecaca !important; }
      .details-box td { color: #fecaca !important; }
      .detail-value { color: #fef2f2 !important; }
      .reason-box { background: #7f1d1d !important; border-color: #dc2626 !important; }
      .reason-box p, .reason-box strong { color: #fecaca !important; }
      .footer { background: #111827 !important; color: #9ca3af !important; }
      .footer p, .footer strong { color: #9ca3af !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; background-color: #fff;">
  <div class="email-container" style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; border: 1px solid #e5e7eb;">

    <!-- Header RED -->
    <div class="email-header" style="background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%); color: white; padding: 40px 24px; text-align: center;">
      <h1 style="margin: 0 0 12px 0; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">❌ Réservation Annulée</h1>
      <p style="margin: 0; font-size: 17px; opacity: 0.95; font-weight: 500;">Votre réservation a été annulée</p>
    </div>

    <!-- Contenu -->
    <div class="email-content" style="padding: 36px 24px; line-height: 1.7; color: #1f2937;">
      <p style="margin: 0 0 16px 0; font-size: 16px;">
        Bonjour <strong style="color: #EF4444;">${data.name}</strong>,
      </p>

      <p style="margin: 0 0 24px 0; font-size: 16px;">
        Nous vous informons que votre réservation a été annulée par notre équipe.
      </p>

      ${
        data.reason
          ? `
      <!-- Reason Box -->
      <div class="reason-box" style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 20px; border-radius: 8px; margin: 28px 0;">
        <p style="margin: 0 0 12px 0; font-weight: 700; color: #991B1B; font-size: 16px;">Raison de l'annulation :</p>
        <p style="margin: 0; color: #991B1B; font-size: 15px; line-height: 1.7;">
          ${data.reason}
        </p>
      </div>
      `
          : ""
      }

      <!-- Booking details box -->
      <div class="details-box" style="background-color: #fef2f2; border-radius: 12px; padding: 24px; margin: 28px 0; border: 2px solid #EF4444;">
        <h2 style="margin: 0 0 20px 0; color: #991B1B; font-size: 19px; font-weight: 700; letter-spacing: -0.3px;">
          📋 Détails de la réservation annulée
        </h2>

        <div class="detail-row" style="padding: 14px 0; border-bottom: 1px solid #fecaca;">
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td class="detail-label" style="font-weight: 500; color: #6b7280; font-size: 15px; width: 40%;">Espace</td>
              <td class="detail-value" style="text-align: right; color: #1F2937; font-size: 15px; font-weight: 600;">${displaySpaceName}</td>
            </tr>
          </table>
        </div>

        <div class="detail-row" style="padding: 14px 0; border-bottom: 1px solid #fecaca;">
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td class="detail-label" style="font-weight: 500; color: #6b7280; font-size: 15px; width: 40%;">Nombre de personnes</td>
              <td class="detail-value" style="text-align: right; color: #1F2937; font-size: 15px; font-weight: 600;">${data.numberOfPeople} ${data.numberOfPeople > 1 ? "personnes" : "personne"}</td>
            </tr>
          </table>
        </div>

        <div class="detail-row" style="padding: 14px 0; border-bottom: 1px solid #fecaca;">
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td class="detail-label" style="font-weight: 500; color: #6b7280; font-size: 15px; width: 40%;">Date</td>
              <td class="detail-value" style="text-align: right; color: #1F2937; font-size: 15px; font-weight: 600;">${data.date}</td>
            </tr>
          </table>
        </div>

        <div class="detail-row" style="padding: 14px 0; border-bottom: 1px solid #fecaca;">
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td class="detail-label" style="font-weight: 500; color: #6b7280; font-size: 15px; width: 40%;">Horaires</td>
              <td class="detail-value" style="text-align: right; color: #1F2937; font-size: 15px; font-weight: 600;">${timeRange}</td>
            </tr>
          </table>
        </div>

        <div style="padding: 16px 0 0 0;">
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td class="detail-label" style="font-weight: 600; color: #111827; font-size: 17px; width: 40%;">Prix total</td>
              <td class="price-value" style="text-align: right; color: #991B1B; font-weight: 700; font-size: 24px; letter-spacing: -0.5px;">${data.totalPrice.toFixed(2)} €*</td>
            </tr>
          </table>
        </div>
      </div>

      <!-- Price disclaimer -->
      ${getPriceDisclaimerNote()}

      <p style="margin: 28px 0 16px 0; font-size: 16px; line-height: 1.7;">
        Si vous souhaitez effectuer une nouvelle réservation pour une autre date ou obtenir plus d'informations, n'hésitez pas à nous contacter ou à consulter notre site web.
      </p>

      <p style="margin: 0 0 28px 0; font-size: 16px; line-height: 1.7;">
        Nous espérons avoir le plaisir de vous accueillir prochainement au CoworKing Café by Anticafé.
      </p>

      <!-- Contact -->
      <div style="background: #fee2e2; border-left: 4px solid #EF4444; padding: 20px; border-radius: 8px; margin: 28px 0;">
        <p style="margin: 0 0 12px 0; font-weight: 700; color: #991B1B !important; font-size: 16px;">📞 Pour toute question :</p>
        <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%;">
          <tr>
            <td style="padding: 4px 0; font-size: 15px; color: #991B1D !important;">
              <strong style="color: #991B1D !important;">Téléphone :</strong> <a href="tel:0987334519" style="color: #EF4444 !important; text-decoration: none;">09 87 33 45 19</a>
            </td>
          </tr>
          <tr>
            <td style="padding: 4px 0; font-size: 15px; color: #991B1D !important;">
              <strong style="color: #991B1D !important;">Email :</strong> <a href="mailto:${data.contactEmail}" style="color: #EF4444 !important; text-decoration: none;">${data.contactEmail}</a>
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
