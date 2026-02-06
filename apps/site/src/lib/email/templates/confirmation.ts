/**
 * Template email : Confirmation de réservation
 * Couleur : VERT (#10B981)
 *
 * Pour modifier ce template, éditez directement ce fichier.
 */

import { getSpaceDisplayName } from "./helpers";

interface ConfirmationEmailData {
  name: string;
  spaceName: string;
  date: string;
  startTime: string;
  endTime: string;
  numberOfPeople: number;
  totalPrice: number;
  depositAmount?: number;
  confirmationNumber?: string;
  contactEmail: string;
}

export function generateConfirmationEmail(data: ConfirmationEmailData): string {
  const displaySpaceName = getSpaceDisplayName(data.spaceName);
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
  <meta name="x-apple-disable-message-reformatting">
  <style>
    /* Reset */
    body, table, td, p, a, li {
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
    }
    table, td {
      mso-table-lspace: 0pt;
      mso-table-rspace: 0pt;
    }
    img {
      -ms-interpolation-mode: bicubic;
      border: 0;
      height: auto;
      line-height: 100%;
      outline: none;
      text-decoration: none;
    }

    /* Dark mode support */
    @media (prefers-color-scheme: dark) {
      .email-container {
        background: #1f2937 !important;
        border-color: #374151 !important;
      }
      .email-header {
        background: linear-gradient(135deg, #10B981 0%, #059669 100%) !important;
      }
      .email-content {
        background: #1f2937 !important;
        color: #f3f4f6 !important;
      }
      .email-content p,
      .email-content li,
      .email-content strong,
      .text-body {
        color: #f3f4f6 !important;
      }
      .details-box {
        background: #111827 !important;
        border-color: #10B981 !important;
      }
      .details-box h3 {
        color: #10B981 !important;
      }
      .detail-row {
        border-color: #374151 !important;
      }
      .detail-label {
        color: #9ca3af !important;
      }
      .detail-value {
        color: #f3f4f6 !important;
      }
      .price-value {
        color: #10B981 !important;
      }
      .footer {
        background: #111827 !important;
        color: #9ca3af !important;
        border-color: #374151 !important;
      }
      .footer p,
      .footer-text {
        color: #9ca3af !important;
      }
      .info-box {
        background: #064e3b !important;
        border-color: #10B981 !important;
      }
      .info-box p,
      .info-box strong,
      .info-box-text {
        color: #d1fae5 !important;
      }
      .info-box a {
        color: #6ee7b7 !important;
      }
      .name-highlight {
        color: #6ee7b7 !important;
      }
    }

    /* Mobile responsiveness */
    @media only screen and (max-width: 600px) {
      .email-container {
        width: 100% !important;
        margin: 0 !important;
        border-radius: 0 !important;
      }
      .email-header {
        padding: 32px 20px !important;
      }
      .email-header h1 {
        font-size: 26px !important;
      }
      .email-content {
        padding: 28px 20px !important;
      }
      .details-box {
        padding: 20px !important;
      }
      .details-box h3 {
        font-size: 17px !important;
      }
      .info-box {
        padding: 16px !important;
      }
      .footer {
        padding: 20px !important;
      }
      .price-value {
        font-size: 20px !important;
      }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; background-color: #fff;">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f3f4f6; padding: 20px 0;">
    <tr>
      <td align="center">
        <div class="email-container" style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; border: 1px solid #e5e7eb;">

          <!-- Header VERT -->
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td class="email-header" style="background: linear-gradient(135deg, #10B981 0%, #059669 100%); color: white; padding: 40px 24px; text-align: center;">
                <h1 style="margin: 0 0 12px 0; font-size: 32px; font-weight: 700; letter-spacing: -0.5px; color: white;">✅ Réservation confirmée</h1>
                <p style="margin: 0; font-size: 17px; opacity: 0.95; font-weight: 500; color: white;">Merci pour votre confiance</p>
              </td>
            </tr>
          </table>

          <!-- Contenu -->
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td class="email-content" style="padding: 36px 24px; line-height: 1.7; color: #1f2937;">
                <p class="text-body" style="margin: 0 0 16px 0; font-size: 16px; color: #1f2937;">
                  Bonjour <strong class="name-highlight" style="color: #10B981;">${
                    data.name
                  }</strong>,
                </p>

                <p class="text-body" style="margin: 0 0 24px 0; font-size: 16px; color: #1f2937;">
                  Nous avons bien reçu votre réservation. Vous trouverez ci-dessous tous les détails.
                </p>

                ${
                  data.depositAmount
                    ? `
                <!-- Info Box Empreinte -->
                <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin: 28px 0;">
                  <tr>
                    <td class="info-box" style="background: #f0fdf4; border-left: 4px solid #10B981; padding: 20px; border-radius: 8px;">
                      <p class="info-box-text" style="margin: 0 0 12px 0; font-weight: 700; color: #065f46; font-size: 16px;">
                        💳 Empreinte bancaire effectuée
                      </p>
                      <p class="info-box-text" style="margin: 0; color: #065f46; font-size: 15px; line-height: 1.7;">
                        Une empreinte bancaire de <strong style="color: #065f46;">${(
                          data.depositAmount / 100
                        ).toFixed(
                          2
                        )}€</strong> soit <strong style="color: #065f46;">70%</strong> du montant de la réservation a été effectuée sur votre carte. Cette empreinte sera automatiquement annulée lors de votre venue.
                      </p>
                      <p class="info-box-text" style="margin: 12px 0 0 0; color: #065f46; font-size: 14px; line-height: 1.6;">
                        Si vous annulez votre réservation ou ne vous présentez pas le jour de votre réservation, des frais d'annulation seront débités selon nos <a href="https://new.coworkingcafe.fr/cgv" style="color: #10B981; text-decoration: underline;">CGVs</a>.
                      </p>
                    </td>
                  </tr>
                </table>
                `
                    : ""
                }

                <!-- Détails de la réservation -->
                <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin: 28px 0;">
                  <tr>
                    <td class="details-box" style="background: #f9fafb; padding: 24px; border-radius: 12px; border: 1px solid #10B981;">
                      <h3 style="margin: 0 0 20px 0; color: #10B981; font-size: 19px; font-weight: 700; letter-spacing: -0.3px;">
                        📋 Détails de votre réservation
                      </h3>

                      <!-- Detail: Espace -->
                      <table role="presentation" cellpadding="0" cellspacing="0" width="100%" class="detail-row" style="padding: 14px 0; border-bottom: 1px solid #e5e7eb;">
                        <tr>
                          <td class="detail-label" style="font-weight: 600; color: #6b7280; font-size: 15px; padding: 4px 0;">Espace</td>
                          <td class="detail-value" style="text-align: right; color: #111827; font-size: 15px; font-weight: 500; padding: 4px 0;">${displaySpaceName}</td>
                        </tr>
                      </table>

                      <!-- Detail: Nombre de personnes -->
                      <table role="presentation" cellpadding="0" cellspacing="0" width="100%" class="detail-row" style="padding: 14px 0; border-bottom: 1px solid #e5e7eb;">
                        <tr>
                          <td class="detail-label" style="font-weight: 600; color: #6b7280; font-size: 15px; padding: 4px 0;">Nombre de personnes</td>
                          <td class="detail-value" style="text-align: right; color: #111827; font-size: 15px; font-weight: 500; padding: 4px 0;">${
                            data.numberOfPeople
                          } ${
    data.numberOfPeople > 1 ? "personnes" : "personne"
  }</td>
                        </tr>
                      </table>

                      <!-- Detail: Date -->
                      <table role="presentation" cellpadding="0" cellspacing="0" width="100%" class="detail-row" style="padding: 14px 0; border-bottom: 1px solid #e5e7eb;">
                        <tr>
                          <td class="detail-label" style="font-weight: 600; color: #6b7280; font-size: 15px; padding: 4px 0;">Date</td>
                          <td class="detail-value" style="text-align: right; color: #111827; font-size: 15px; font-weight: 500; padding: 4px 0;">${
                            data.date
                          }</td>
                        </tr>
                      </table>

                      <!-- Detail: Horaires -->
                      <table role="presentation" cellpadding="0" cellspacing="0" width="100%" class="detail-row" style="padding: 14px 0; border-bottom: 1px solid #e5e7eb;">
                        <tr>
                          <td class="detail-label" style="font-weight: 600; color: #6b7280; font-size: 15px; padding: 4px 0;">Horaires</td>
                          <td class="detail-value" style="text-align: right; color: #111827; font-size: 15px; font-weight: 500; padding: 4px 0;">${
                            data.startTime
                          } - ${data.endTime}</td>
                        </tr>
                      </table>

                      <!-- Detail: Prix -->
                      <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="padding: 16px 0 0 0;">
                        <tr>
                          <td class="detail-label" style="font-weight: 700; color: #111827; font-size: 16px; padding: 4px 0;">Prix total</td>
                          <td class="price-value" style="text-align: right; color: #10B981; font-weight: 700; font-size: 22px; letter-spacing: -0.5px; padding: 4px 0;">${data.totalPrice.toFixed(
                            2
                          )}€</td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>

                <p class="text-body" style="margin: 28px 0 0 0; font-size: 16px; line-height: 1.7; color: #1f2937;">
                  Nous vous attendons avec plaisir dans nos locaux !
                </p>

                <!-- Contact -->
                <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin: 28px 0;">
                  <tr>
                    <td class="info-box" style="background: #f0fdf4 !important; border-left: 4px solid #10B981; padding: 20px; border-radius: 8px;">
                      <p class="info-box-text" style="margin: 0 0 12px 0; font-weight: 700; color: #065f46 !important; font-size: 16px;">
                        📞 Pour toute question :
                      </p>
                      <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                        <tr>
                          <td class="info-box-text" style="padding: 4px 0; font-size: 15px; color: #065f46 !important;">
                            <strong style="color: #065f46 !important;">Téléphone :</strong> <a href="tel:0987334519" style="color: #10B981 !important; text-decoration: none;">09 87 33 45 19</a>
                          </td>
                        </tr>
                        <tr>
                          <td class="info-box-text" style="padding: 4px 0; font-size: 15px; color: #065f46 !important;">
                            <strong style="color: #065f46 !important;">Email :</strong> <a href="mailto:${data.contactEmail}" style="color: #10B981 !important; text-decoration: none;">${data.contactEmail}</a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>

                <p class="text-body" style="margin: 32px 0 0 0; font-size: 16px; line-height: 1.8; color: #1f2937;">
                  À très bientôt,<br>
                  <strong style="color: #10B981; font-size: 17px;">L'équipe CoworKing Café by Anticafé</strong>
                </p>
              </td>
            </tr>
          </table>

          <!-- Footer -->
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td class="footer" style="background: #f9fafb; padding: 24px; text-align: center; color: #6b7280; font-size: 14px; border-top: 1px solid #e5e7eb;">
                <p class="footer-text" style="margin: 0 0 8px 0; font-weight: 700; color: #111827; font-size: 15px;">CoworKing Café by Anticafé</p>
                <p class="footer-text" style="margin: 0 0 4px 0; color: #6b7280;">1 rue de la Division Leclerc, 67000 Strasbourg</p>
                <p class="footer-text" style="margin: 0; color: #6b7280;">L-V: 09h-20h | S-D & JF: 10h-20h</p>
              </td>
            </tr>
          </table>

        </div>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}
