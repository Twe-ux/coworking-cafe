/**
 * Template email : Confirmation initiale de réservation
 * Couleur : TEAL (#10B981)
 *
 * Pour modifier ce template, éditez directement ce fichier.
 */

import { getSpaceDisplayName } from "./helpers";

export interface BookingInitialEmailData {
  name: string;
  spaceName: string;
  date: string;
  time: string;
  price: number;
  bookingId: string;
  requiresPayment: boolean;
  depositAmount?: number; // in cents
  captureMethod?: "manual" | "automatic";
  additionalServices?: string[];
  numberOfPeople?: number;
}

export function generateBookingInitialEmail(
  data: BookingInitialEmailData
): string {
  const bookingType = data.requiresPayment
    ? "réservation"
    : "demande de réservation";
  // depositAmount is in cents, price is in euros
  const depositInEuros = data.depositAmount
    ? (data.depositAmount / 100).toFixed(2)
    : null;
  const depositPercentage =
    data.depositAmount && data.price
      ? Math.round((data.depositAmount / 100 / data.price) * 100)
      : 0;
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
      .email-content p, .email-content strong, .email-content td, .email-content li { color: #f3f4f6 !important; }
      .details-box { background: #111827 !important; border-color: #F59E0B !important; }
      .details-box h3 { color: #F59E0B !important; }
      .info-box { background: #1e3a8a !important; border-color: #3b82f6 !important; }
      .info-box p, .info-box a { color: #dbeafe !important; }
      .footer { background: #111827 !important; color: #9ca3af !important; }
      .footer p { color: #9ca3af !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; background-color: #fff;">
  <div class="email-container" style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; border: 1px solid #e5e7eb;">

    <!-- Header ORANGE -->
    <div class="email-header" style="background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%); color: white; padding: 40px 24px; text-align: center;">
      <h1 style="margin: 0 0 12px 0; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">⏳ Réservation en attente de validation</h1>
      <p style="margin: 0; font-size: 17px; opacity: 0.95; font-weight: 500;">Votre réservation sera définitive après validation</p>
    </div>

    <!-- Contenu -->
    <div class="email-content" style="padding: 36px 24px; line-height: 1.7; color: #1f2937;">
      <p style="margin: 0 0 16px 0; font-size: 16px;">Bonjour <strong style="color: #F59E0B;">${
        data.name
      }</strong>,</p>

      <p style="margin: 0 0 24px 0; font-size: 16px;">Nous avons bien reçu votre ${bookingType}. Vous trouverez ci-dessous tous les détails.</p>

      <!-- Détails de la réservation -->
      <div class="details-box" style="background: #f9fafb; padding: 24px; border-radius: 12px; margin: 28px 0; border: 1px solid #F59E0B;">
        <h3 style="margin: 0 0 20px 0; color: #F59E0B; font-size: 19px; font-weight: 700; letter-spacing: -0.3px; border-bottom: 2px solid #F59E0B; padding-bottom: 10px;">📋 Détails de votre réservation</h3>

        <div class="detail-row" style="padding: 14px 0; border-bottom: 1px solid #e5e7eb;">
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td class="detail-label" style="font-weight: 600; color: #6b7280; font-size: 15px;">Espace</td>
              <td class="detail-value" style="text-align: right; color: #111827; font-size: 15px; font-weight: 500;">${displaySpaceName}</td>
            </tr>
          </table>
        </div>

        ${
          data.numberOfPeople
            ? `
        <div class="detail-row" style="padding: 14px 0; border-bottom: 1px solid #e5e7eb;">
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td class="detail-label" style="font-weight: 600; color: #6b7280; font-size: 15px;">Nombre de personnes</td>
              <td class="detail-value" style="text-align: right; color: #111827; font-size: 15px; font-weight: 500;">${data.numberOfPeople}</td>
            </tr>
          </table>
        </div>
        `
            : ""
        }

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
                data.time
              }</td>
            </tr>
          </table>
        </div>
        <div style="padding: 16px 0 0 0; ">
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td class="detail-label" style="font-weight: 700; color: #F59E0B; font-size: 16px; padding: 16px 0;">Prix total</td>
              <td class="price-value" style="text-align: right; color: #F59E0B; font-weight: 700; font-size: 22px; letter-spacing: -0.5px; padding: 16px 0;">${data.price.toFixed(
                2
              )}€</td>
            </tr>
          </table>
        </div>

        ${
          data.additionalServices && data.additionalServices.length > 0
            ? `
        <div style="padding: 10px 0;">
          <span style="font-weight: 600; color: #6b7280; display: block; margin-bottom: 8px;">Services supplémentaires</span>
          <ul style="margin: 0; padding-left: 20px; color: #111827;">
            ${data.additionalServices
              .map((service) => `<li style="padding: 3px 0;">${service}</li>`)
              .join("")}
          </ul>
        </div>
        `
            : ""
        }
      </div>

      ${
        data.depositAmount
          ? `
      <!-- Info Box Empreinte Bancaire -->
      <div class="info-box" style="background: #EFF6FF; border-left: 4px solid #3B82F6; padding: 20px; border-radius: 8px; margin: 28px 0;">
        <p style="margin: 0 0 12px 0; font-weight: 700; color: #1E40AF; font-size: 16px;">💳 Empreinte bancaire effectuée</p>
        <p style="margin: 0; color: #1E40AF; font-size: 15px; line-height: 1.7;">
          Une empreinte bancaire de <strong>${depositInEuros}€</strong> soit <strong>${depositPercentage}%</strong> du montant de la réservation a été effectuée sur votre carte. Cette empreinte sera automatiquement annulée lors de votre venue. <br /> Si vous annulez votre réservation ou ne vous présentez pas le jour de votre réservation, des frais d'annulation seront débités selon nos <a href="https://coworkingcafe.fr/CGU#article6" style="color: #1E40AF; text-decoration: underline; font-weight: 600;">CGVs</a>.
        </p>
      </div>
      `
          : !data.requiresPayment
          ? `
      <!-- Info Box Confirmation -->
      <div class="info-box" style="background: #EFF6FF; border-left: 4px solid #3B82F6; padding: 20px; border-radius: 8px; margin: 28px 0;">
        <p style="margin: 0 0 12px 0; font-weight: 700; color: #1E40AF; font-size: 16px;">⏳ Réservation en attente de confirmation</p>
        <p style="margin: 0; color: #1E40AF; font-size: 15px; line-height: 1.7;">
          Votre réservation sera confirmée. Vous recevrez un email de confirmation dès validation.
        </p>
      </div>
      `
          : ""
      }

      <!-- Contact -->
      <div style="background: #fffbeb; border-left: 4px solid #F59E0B; padding: 20px; border-radius: 8px; margin: 28px 0;">
        <p style="margin: 0 0 12px 0; font-weight: 700; color: #92400E !important; font-size: 16px;">📞 Pour toute question :</p>
        <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%;">
          <tr>
            <td style="padding: 4px 0; font-size: 15px; color: #92400E !important;">
              <strong style="color: #92400E !important;">Téléphone :</strong> <a href="tel:0987334519" style="color: #F59E0B !important; text-decoration: none;">09 87 33 45 19</a>
            </td>
          </tr>
          <tr>
            <td style="padding: 4px 0; font-size: 15px; color: #92400E !important;">
              <strong style="color: #92400E !important;">Email :</strong> <a href="mailto:strasbourg@coworkingcafe.fr" style="color: #F59E0B !important; text-decoration: none;">strasbourg@coworkingcafe.fr</a>
            </td>
          </tr>
        </table>
      </div>

      <p style="margin: 32px 0 0 0; font-size: 16px; line-height: 1.8;">
        À bientôt dans nos locaux,<br>
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
