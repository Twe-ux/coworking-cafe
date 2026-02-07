/**
 * Template email : Annulation de réservation
 * Couleur : ROUGE (#EF4444)
 *
 * Pour modifier ce template, éditez directement ce fichier.
 */

import { getSpaceDisplayName } from "./helpers";

interface CancellationEmailData {
  name: string;
  spaceName: string;
  date: string;
  startTime: string;
  endTime: string;
  confirmationNumber?: string;
  contactEmail: string;
  cancellationFees: number;
  refundAmount: number;
  isPending?: boolean; // true = annulation avant validation admin
}

export function generateCancellationEmail(data: CancellationEmailData): string {
  const displaySpaceName = getSpaceDisplayName(data.spaceName);
  const totalAmount = data.cancellationFees + data.refundAmount;

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
      .email-content p, .email-content strong, .email-content td { color: #f3f4f6 !important; }
      .success-box { background: #065f46 !important; border-color: #10b981 !important; }
      .success-box p, .success-box strong { color: #d1fae5 !important; }
      .warning-box { background: #78350f !important; border-color: #f59e0b !important; }
      .warning-box p, .warning-box strong { color: #fef3c7 !important; }
      .details-box { background: #111827 !important; border-color: #EF4444 !important; }
      .details-box h3 { color: #EF4444 !important; }
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
      <h1 style="margin: 0 0 12px 0; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">❌ Réservation annulée</h1>
      <p style="margin: 0; font-size: 17px; opacity: 0.95; font-weight: 500;">Confirmation d'annulation</p>
    </div>

    <!-- Contenu -->
    <div class="email-content" style="padding: 36px 24px; line-height: 1.7; color: #1f2937;">
      <p style="margin: 0 0 16px 0; font-size: 16px;">Bonjour <strong style="color: #EF4444;">${
        data.name
      }</strong>,</p>

      <p style="margin: 0 0 24px 0; font-size: 16px;">Votre réservation a bien été annulée.</p>

      ${
        data.isPending
          ? `
      <!-- Success Box Empreinte annulée -->
      <div class="success-box" style="background: #D1FAE5; border-left: 4px solid #10B981; padding: 20px; border-radius: 8px; margin: 28px 0;">
        <p style="margin: 0 0 12px 0; font-weight: 700; color: #065F46; font-size: 16px;">✅ Empreinte bancaire annulée</p>
        <p style="margin: 0; color: #065F46; font-size: 15px; line-height: 1.7;">
          L'empreinte bancaire de <strong>${totalAmount.toFixed(
            2
          )}€</strong> effectuée sur votre carte a été annulée. Aucun montant ne sera prélevé.
        </p>
      </div>
      `
          : `
        ${
          data.cancellationFees > 0
            ? `
        <!-- Warning Box Frais d'annulation -->
        <div class="warning-box" style="background-color: #FEF3C7; border-radius: 8px; padding: 20px; margin: 28px 0; border-left: 4px solid #F59E0B;">
          <p style="margin: 0 0 12px 0; font-weight: 700; color: #92400E; font-size: 16px;">⚠️ Frais d'annulation appliqués</p>
          <p style="margin: 0; color: #92400E; font-size: 15px; line-height: 1.7;">
            Des frais d'annulation de <strong>${data.cancellationFees.toFixed(
              2
            )}€</strong> ont été prélevés sur l'empreinte bancaire conformément à nos conditions d'annulation.
          </p>
        </div>`
            : ""
        }

        ${
          data.refundAmount > 0
            ? `
        <!-- Success Box Remboursement -->
        <div class="success-box" style="background-color: #D1FAE5; border-radius: 8px; padding: 20px; margin: 28px 0; border-left: 4px solid #10B981;">
          <p style="margin: 0 0 12px 0; font-weight: 700; color: #065F46; font-size: 16px;">✅ Annulation de l'empreinte</p>
          <p style="margin: 0; color: #065F46; font-size: 15px; line-height: 1.7;">
            Le montant de <strong>${data.refundAmount.toFixed(
              2
            )}€</strong> de l'empreinte bancaire ne sera pas prélevé. L'empreinte sera automatiquement annulée.
          </p>
        </div>
        `
            : ""
        }
      `
      }

      <!-- Détails de la réservation annulée -->
      <div class="details-box" style="background: #f9fafb; padding: 24px; border-radius: 12px; margin: 28px 0; border: 1px solid #EF4444;">
        <h3 style="margin: 0 0 20px 0; color: #EF4444; font-size: 19px; font-weight: 700; letter-spacing: -0.3px; border-bottom: 2px solid #EF4444; padding-bottom: 10px;">📋 Réservation annulée</h3>

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

        ${
          data.cancellationFees > 0
            ? `
        <div class="detail-row" style="padding: 14px 0; border-bottom: 1px solid #e5e7eb;">
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td class="detail-label" style="font-weight: 600; color: #6b7280; font-size: 15px;">Frais d'annulation</td>
              <td class="detail-value" style="text-align: right; color: #EF4444 !important; font-size: 15px; font-weight: 500;">${data.cancellationFees.toFixed(
                2
              )}€</td>
            </tr>
          </table>
        </div>
        `
            : ""
        }

        ${
          data.refundAmount > 0 || data.isPending
            ? `
        <div style="padding: 16px 0 0 0;">
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td class="detail-label" style="font-weight: 700; color: #065F46; font-size: 16px; padding: 16px 0;">${
                data.isPending ? "Empreinte annulée" : "Montant non prélevé"
              }</td>
              <td class="price-value" style="text-align: right; color: #10B981 !important; font-weight: 700; font-size: 22px; letter-spacing: -0.5px; padding: 16px 0;">${
                data.isPending
                  ? totalAmount.toFixed(2)
                  : data.refundAmount.toFixed(2)
              }€</td>
            </tr>
          </table>
        </div>
        `
            : `
        <div style="padding: 16px 0 0 0; background: #fef2f2;">
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td class="detail-label" style="font-weight: 700; color: #991B1B; font-size: 16px; padding: 16px 0;">Montant prélevé</td>
              <td class="price-value" style="text-align: right; color: #EF4444; font-weight: 700; font-size: 22px; letter-spacing: -0.5px; padding: 16px 0;">${data.cancellationFees.toFixed(
                2
              )}€</td>
            </tr>
          </table>
        </div>
        `
        }
      </div>

      <p style="margin: 28px 0 0 0; font-size: 16px; line-height: 1.7;">Nous espérons vous accueillir prochainement dans nos locaux.</p>

      <!-- Contact -->
      <div style="background: #fee2e2; border-left: 4px solid #EF4444; padding: 20px; border-radius: 8px; margin: 28px 0;">
        <p style="margin: 0 0 12px 0; font-weight: 700; color: #991B1B !important; font-size: 16px;">📞 Pour toute question :</p>
        <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%;">
          <tr>
            <td style="padding: 4px 0; font-size: 15px; color: #991B1B !important;">
              <strong style="color: #991B1B !important;">Téléphone :</strong> <a href="tel:0987334519" style="color: #EF4444 !important; text-decoration: none;">09 87 33 45 19</a>
            </td>
          </tr>
          <tr>
            <td style="padding: 4px 0; font-size: 15px; color: #991B1B !important;">
              <strong style="color: #991B1B !important;">Email :</strong> <a href="mailto:${data.contactEmail}" style="color: #EF4444 !important; text-decoration: none;">${data.contactEmail}</a>
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
