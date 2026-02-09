/**
 * Template email : Réservation client annulée par l'administrateur
 * Couleur : RED (#EF4444)
 *
 * Envoyé quand l'admin annule une réservation client (avec paiement/empreinte).
 * Inclut information de remboursement.
 */

import { getSpaceDisplayName } from "./helpers";

export interface AdminCancelClientBookingData {
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

export function generateAdminCancelClientBookingEmail(
  data: AdminCancelClientBookingData
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
      .price-value { color: #f3f4f6 !important; }
      .info-box { background: #1e3a8a !important; border-color: #3b82f6 !important; }
      .info-box p { color: #dbeafe !important; }
      .contact-list li { color: #f3f4f6 !important; }
      .footer { background: #111827 !important; color: #9ca3af !important; }
      .footer p { color: #9ca3af !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; background-color: #fff;">
  <div class="email-container" style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; border: 1px solid #e5e7eb;">

    <!-- Header RED -->
    <div class="email-header" style="background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%); color: white; padding: 40px 24px; text-align: center;">
      <h1 style="margin: 0 0 12px 0; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">❌ Réservation annulée</h1>
      <p style="margin: 0; font-size: 17px; opacity: 0.95; font-weight: 500;">Annulation administrative</p>
    </div>

    <!-- Contenu -->
    <div class="email-content" style="padding: 36px 24px; line-height: 1.7; color: #1f2937;">
      <p style="margin: 0 0 16px 0; font-size: 16px;">Bonjour <strong style="color: #EF4444;">${
        data.name
      }</strong>,</p>

      <p style="margin: 0 0 24px 0; font-size: 16px;">Nous vous informons que votre réservation a été annulée par notre équipe.</p>

      <!-- Badge Annulation -->
      <div class="warning-box" style="background: #FEF2F2; border-left: 4px solid #EF4444; padding: 20px; border-radius: 8px; margin: 28px 0;">
        <p style="margin: 0 0 12px 0; font-weight: 700; color: #991B1B; font-size: 16px;">⚠️ Annulation administrative</p>
        <p style="margin: 0; color: #991B1B; font-size: 15px; line-height: 1.7;">
          Cette annulation peut être due à un problème technique, une indisponibilité de l'espace ou une autre raison indépendante de notre volonté. Nous nous excusons pour le désagrément occasionné.
        </p>
      </div>

      <!-- Détails de la réservation annulée -->
      <div class="details-box" style="background: #f9fafb; padding: 24px; border-radius: 12px; margin: 28px 0; border: 1px solid #EF4444;">
        <h3 style="margin: 0 0 20px 0; color: #EF4444; font-size: 19px; font-weight: 700; letter-spacing: -0.3px; border-bottom: 2px solid #EF4444; padding-bottom: 10px;">📋 Détails de la réservation annulée</h3>

        ${
          data.confirmationNumber
            ? `
        <div class="detail-row" style="padding: 14px 0; border-bottom: 1px solid #e5e7eb;">
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td class="detail-label" style="font-weight: 600; color: #6b7280; font-size: 15px;">N° de confirmation</td>
              <td class="detail-value" style="text-align: right; color: #111827; font-size: 15px; font-weight: 500;">${data.confirmationNumber}</td>
            </tr>
          </table>
        </div>
        `
            : ""
        }

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

        <div class="detail-row" style="padding: 14px 0; border-bottom: 1px solid #e5e7eb;">
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td class="detail-label" style="font-weight: 600; color: #6b7280; font-size: 15px;">Horaires</td>
              <td class="detail-value" style="text-align: right; color: #111827; font-size: 15px; font-weight: 500;">${
                data.startTime
              } - ${data.endTime}</td>
            </tr>
          </table>
        </div>

        <div class="detail-row" style="padding: 14px 0; border-bottom: 1px solid #e5e7eb;">
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td class="detail-label" style="font-weight: 600; color: #6b7280; font-size: 15px;">Nombre de personnes</td>
              <td class="detail-value" style="text-align: right; color: #111827; font-size: 15px; font-weight: 500;">${
                data.numberOfPeople
              }</td>
            </tr>
          </table>
        </div>

        <div style="padding: 16px 0 0 0;">
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td class="detail-label" style="font-weight: 700; color: #111827; font-size: 16px;">Montant</td>
              <td class="price-value" style="text-align: right; color: #111827; font-weight: 700; font-size: 22px; letter-spacing: -0.5px;">${data.totalPrice.toFixed(
                2
              )}€</td>
            </tr>
          </table>
        </div>
      </div>

      <!-- Info Remboursement -->
      <div class="info-box" style="background: #EFF6FF; border-left: 4px solid #3B82F6; padding: 20px; border-radius: 8px; margin: 28px 0;">
        <p style="margin: 0 0 12px 0; font-weight: 700; color: #1E40AF; font-size: 16px;">💰 Remboursement</p>
        <p style="margin: 0; color: #1E40AF; font-size: 15px; line-height: 1.7;">
          Si un paiement a été effectué, vous serez intégralement remboursé sous 5 à 10 jours ouvrés. Le remboursement sera effectué sur le même moyen de paiement utilisé lors de la réservation.
        </p>
      </div>

      <p style="margin: 28px 0 0 0; font-size: 16px; line-height: 1.7;">Nous vous invitons à effectuer une nouvelle réservation selon vos disponibilités. Notre équipe reste à votre disposition pour vous accompagner.</p>

      <!-- Contact -->
      <div style="background: #fee2e2; border-left: 4px solid #EF4444; padding: 20px; border-radius: 8px; margin: 28px 0;">
        <p style="margin: 0 0 12px 0; font-weight: 700; color: #991B1B !important; font-size: 16px;">📞 Pour toute question :</p>
        <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%;">
          <tr>
            <td style="padding: 4px 0; font-size: 15px; color: #991B1B;">
              <strong style="color: #991B1B !important;">Téléphone :</strong> <a href="tel:0987334519" style="color: #EF4444; text-decoration: none;">09 87 33 45 19</a>
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
        Nous vous prions d'accepter nos excuses pour ce désagrément,<br>
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
