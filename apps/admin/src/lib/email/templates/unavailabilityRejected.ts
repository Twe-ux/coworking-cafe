/**
 * Template email : Indisponibilité refusée
 * Couleur : ROUGE (#EF4444)
 *
 * Utilise le même design professionnel que les emails de booking
 */

import { formatDateFr, calculateDays } from '@/lib/utils/format-date';

interface UnavailabilityRejectedEmailData {
  employeeName: string;
  type: 'vacation' | 'sick' | 'personal' | 'other';
  startDate: string;
  endDate: string;
  reason?: string;
  rejectionReason: string;
}

const typeLabels = {
  vacation: 'Congés',
  sick: 'Maladie',
  personal: 'Personnel',
  other: 'Autre',
};

export function generateUnavailabilityRejectedEmail(
  data: UnavailabilityRejectedEmailData
): string {
  const { employeeName, type, startDate, endDate, reason, rejectionReason } = data;
  const days = calculateDays(startDate, endDate);

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
        background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%) !important;
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
        border-color: #EF4444 !important;
      }
      .details-box h3 {
        color: #EF4444 !important;
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
        background: #7f1d1d !important;
        border-color: #EF4444 !important;
      }
      .info-box p,
      .info-box strong,
      .info-box-text {
        color: #fecaca !important;
      }
      .name-highlight {
        color: #fca5a5 !important;
      }
      .rejection-box {
        background: #7f1d1d !important;
        border-color: #EF4444 !important;
      }
      .rejection-box p,
      .rejection-box h4 {
        color: #fecaca !important;
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
      .info-box, .rejection-box {
        padding: 16px !important;
      }
      .footer {
        padding: 20px !important;
      }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; background-color: #fff;">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f3f4f6; padding: 20px 0;">
    <tr>
      <td align="center">
        <div class="email-container" style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; border: 1px solid #e5e7eb;">

          <!-- Header ROUGE -->
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td class="email-header" style="background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%); color: white; padding: 40px 24px; text-align: center;">
                <h1 style="margin: 0 0 12px 0; font-size: 32px; font-weight: 700; letter-spacing: -0.5px; color: white;">❌ Demande refusée</h1>
                <p style="margin: 0; font-size: 17px; opacity: 0.95; font-weight: 500; color: white;">Votre indisponibilité n'a pas pu être approuvée</p>
              </td>
            </tr>
          </table>

          <!-- Contenu -->
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td class="email-content" style="padding: 36px 24px; line-height: 1.7; color: #1f2937;">
                <p class="text-body" style="margin: 0 0 16px 0; font-size: 16px; color: #1f2937;">
                  Bonjour <strong class="name-highlight" style="color: #EF4444;">${employeeName}</strong>,
                </p>

                <p class="text-body" style="margin: 0 0 24px 0; font-size: 16px; color: #1f2937;">
                  Nous sommes désolés de vous informer que votre demande d'indisponibilité n'a <strong>pas pu être approuvée</strong>.
                </p>

                <!-- Info Box Refusé -->
                <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin: 28px 0;">
                  <tr>
                    <td class="info-box" style="background: #fef2f2; border-left: 4px solid #EF4444; padding: 20px; border-radius: 8px;">
                      <p class="info-box-text" style="margin: 0 0 12px 0; font-weight: 700; color: #991b1b; font-size: 16px;">
                        ✗ Demande refusée
                      </p>
                      <p class="info-box-text" style="margin: 0; color: #991b1b; font-size: 15px; line-height: 1.7;">
                        Votre demande ne peut pas être validée pour le moment. Consultez le motif du refus ci-dessous pour plus de détails.
                      </p>
                    </td>
                  </tr>
                </table>

                <!-- Détails de la demande -->
                <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin: 28px 0;">
                  <tr>
                    <td class="details-box" style="background: #f9fafb; padding: 24px; border-radius: 12px; border: 1px solid #EF4444;">
                      <h3 style="margin: 0 0 20px 0; color: #EF4444; font-size: 19px; font-weight: 700; letter-spacing: -0.3px;">
                        📋 Détails de votre demande
                      </h3>

                      <!-- Detail: Type -->
                      <table role="presentation" cellpadding="0" cellspacing="0" width="100%" class="detail-row" style="padding: 14px 0; border-bottom: 1px solid #e5e7eb;">
                        <tr>
                          <td class="detail-label" style="font-weight: 600; color: #6b7280; font-size: 15px; padding: 4px 0;">Type</td>
                          <td class="detail-value" style="text-align: right; color: #111827; font-size: 15px; font-weight: 500; padding: 4px 0;">${typeLabels[type]}</td>
                        </tr>
                      </table>

                      <!-- Detail: Date début -->
                      <table role="presentation" cellpadding="0" cellspacing="0" width="100%" class="detail-row" style="padding: 14px 0; border-bottom: 1px solid #e5e7eb;">
                        <tr>
                          <td class="detail-label" style="font-weight: 600; color: #6b7280; font-size: 15px; padding: 4px 0;">Du</td>
                          <td class="detail-value" style="text-align: right; color: #111827; font-size: 15px; font-weight: 500; padding: 4px 0;">${formatDateFr(startDate)}</td>
                        </tr>
                      </table>

                      <!-- Detail: Date fin -->
                      <table role="presentation" cellpadding="0" cellspacing="0" width="100%" class="detail-row" style="padding: 14px 0; border-bottom: 1px solid #e5e7eb;">
                        <tr>
                          <td class="detail-label" style="font-weight: 600; color: #6b7280; font-size: 15px; padding: 4px 0;">Au</td>
                          <td class="detail-value" style="text-align: right; color: #111827; font-size: 15px; font-weight: 500; padding: 4px 0;">${formatDateFr(endDate)}</td>
                        </tr>
                      </table>

                      <!-- Detail: Durée -->
                      <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="padding: 16px 0 0 0;">
                        <tr>
                          <td class="detail-label" style="font-weight: 700; color: #111827; font-size: 16px; padding: 4px 0;">Durée</td>
                          <td style="text-align: right; color: #EF4444; font-weight: 700; font-size: 22px; letter-spacing: -0.5px; padding: 4px 0;">${days} jour${days > 1 ? 's' : ''}</td>
                        </tr>
                      </table>

                      ${
                        reason
                          ? `
                      <!-- Detail: Votre motif -->
                      <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-top: 20px; padding: 16px; background: #fff; border-radius: 8px;">
                        <tr>
                          <td>
                            <p style="margin: 0 0 8px 0; font-weight: 600; color: #6b7280; font-size: 14px;">VOTRE MOTIF</p>
                            <p style="margin: 0; color: #111827; font-size: 15px; line-height: 1.6;">${reason}</p>
                          </td>
                        </tr>
                      </table>
                      `
                          : ''
                      }
                    </td>
                  </tr>
                </table>

                <!-- Motif du refus -->
                <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin: 28px 0;">
                  <tr>
                    <td class="rejection-box" style="background: #fef2f2; border-left: 4px solid #EF4444; padding: 20px; border-radius: 8px;">
                      <h4 style="margin: 0 0 12px 0; color: #991b1b; font-size: 16px; font-weight: 700;">
                        📝 Motif du refus
                      </h4>
                      <p style="margin: 0; color: #7f1d1d; font-size: 15px; line-height: 1.7;">${rejectionReason}</p>
                    </td>
                  </tr>
                </table>

                <p class="text-body" style="margin: 28px 0 0 0; font-size: 16px; line-height: 1.7; color: #1f2937;">
                  Si vous avez des questions concernant ce refus ou souhaitez discuter d'alternatives, n'hésitez pas à contacter votre responsable.
                </p>

                <!-- Contact -->
                <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin: 28px 0;">
                  <tr>
                    <td class="info-box" style="background: #fef2f2 !important; border-left: 4px solid #EF4444; padding: 20px; border-radius: 8px;">
                      <p class="info-box-text" style="margin: 0 0 12px 0; font-weight: 700; color: #991b1b !important; font-size: 16px;">
                        📞 Pour toute question :
                      </p>
                      <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                        <tr>
                          <td class="info-box-text" style="padding: 4px 0; font-size: 15px; color: #991b1b !important;">
                            <strong style="color: #991b1b !important;">Téléphone :</strong> <a href="tel:0987334519" style="color: #EF4444 !important; text-decoration: none;">09 87 33 45 19</a>
                          </td>
                        </tr>
                        <tr>
                          <td class="info-box-text" style="padding: 4px 0; font-size: 15px; color: #991b1b !important;">
                            <strong style="color: #991b1b !important;">Email :</strong> <a href="mailto:strasbourg@coworkingcafe.fr" style="color: #EF4444 !important; text-decoration: none;">strasbourg@coworkingcafe.fr</a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>

                <p class="text-body" style="margin: 32px 0 0 0; font-size: 16px; line-height: 1.8; color: #1f2937;">
                  Cordialement,<br>
                  <strong style="color: #EF4444; font-size: 17px;">L'équipe CoworKing Café by Anticafé</strong>
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
