/**
 * Template email : Réservation en attente avec acompte requis
 * Couleur : ORANGE (#F59E0B)
 *
 * Pour modifier ce template, éditez directement ce fichier.
 */

import { getSpaceDisplayName } from "./helpers";

interface PendingWithDepositEmailData {
  name: string;
  spaceName: string;
  date: string;
  startTime: string;
  endTime: string;
  numberOfPeople: number;
  totalPrice: number;
  depositAmount: number;
  depositFileUrl: string;
}

export function generatePendingWithDepositEmail(data: PendingWithDepositEmailData): string {
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
      .email-content p, .email-content li, .email-content strong { color: #f3f4f6 !important; }
      .details-box { background: #111827 !important; border-color: #F59E0B !important; }
      .details-box h3 { color: #FCD34D !important; }
      .detail-row { border-color: #374151 !important; }
      .detail-label { color: #9ca3af !important; }
      .detail-value { color: #f3f4f6 !important; }
      .price-value { color: #FCD34D !important; }
      .footer { background: #111827 !important; color: #9ca3af !important; }
      .footer p { color: #9ca3af !important; }
      .pending-badge { background: #92400E !important; color: #FED7AA !important; }
      .warning-box { background: #7C2D12 !important; border-color: #F59E0B !important; }
      .download-button { background: #F59E0B !important; color: #1f2937 !important; }
      .download-button:hover { background: #D97706 !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; background-color: #fff;">
  <div class="email-container" style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; border: 1px solid #e5e7eb;">

    <!-- Header avec dégradé orange -->
    <div class="email-header" style="background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%); padding: 40px 30px; text-align: center;">
      <h1 style="margin: 0; color: white; font-size: 28px; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        ⏳ Réservation en Attente
      </h1>
      <p style="margin: 10px 0 0; color: rgba(255,255,255,0.95); font-size: 15px; font-weight: 500;">
        Validation en cours
      </p>
    </div>

    <!-- Contenu principal -->
    <div class="email-content" style="padding: 40px 30px; background: white; color: #1f2937;">
      <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #1f2937;">
        Bonjour <strong>${data.name}</strong>,
      </p>

      <p style="margin: 0 0 25px; font-size: 16px; line-height: 1.6; color: #1f2937;">
        Nous avons bien reçu votre demande de réservation. Celle-ci est actuellement <strong>en attente de validation</strong>.
      </p>

      <!-- Box d'alerte -->
      <div class="warning-box" style="background: #FEF3C7; border-left: 4px solid #F59E0B; padding: 16px 20px; margin: 0 0 30px; border-radius: 8px;">
        <p style="margin: 0; font-size: 15px; line-height: 1.6; color: #92400E;">
          <strong>⚠️ Action requise</strong><br>
          Votre réservation sera validée <strong>à réception de l'acompte</strong> et validation des conditions d'annulation par retour de ce mail.
        </p>
      </div>

      <!-- Détails de la réservation -->
      <div class="details-box" style="background: #FEF3C7; border: 2px solid #F59E0B; border-radius: 12px; padding: 24px; margin: 0 0 30px;">
        <h3 style="margin: 0 0 20px; color: #D97706; font-size: 19px; font-weight: 700;">
          📋 Détails de votre réservation
        </h3>

        <div class="detail-row" style="padding: 14px 0; border-bottom: 1px solid rgba(249, 115, 22, 0.3);">
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td class="detail-label" style="font-weight: 500; color: #6b7280; font-size: 15px; width: 40%;">Espace</td>
              <td class="detail-value" style="text-align: right; color: #1f2937; font-size: 15px; font-weight: 600;">${displaySpaceName}</td>
            </tr>
          </table>
        </div>

        <div class="detail-row" style="padding: 14px 0; border-bottom: 1px solid rgba(249, 115, 22, 0.3);">
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td class="detail-label" style="font-weight: 500; color: #6b7280; font-size: 15px; width: 40%;">Nombre de personnes</td>
              <td class="detail-value" style="text-align: right; color: #1f2937; font-size: 15px; font-weight: 600;">${data.numberOfPeople} ${data.numberOfPeople > 1 ? "personnes" : "personne"}</td>
            </tr>
          </table>
        </div>

        <div class="detail-row" style="padding: 14px 0; border-bottom: 1px solid rgba(249, 115, 22, 0.3);">
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td class="detail-label" style="font-weight: 500; color: #6b7280; font-size: 15px; width: 40%;">Date</td>
              <td class="detail-value" style="text-align: right; color: #1f2937; font-size: 15px; font-weight: 600;">${data.date}</td>
            </tr>
          </table>
        </div>

        <div class="detail-row" style="padding: 14px 0; border-bottom: 1px solid rgba(249, 115, 22, 0.3);">
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td class="detail-label" style="font-weight: 500; color: #6b7280; font-size: 15px; width: 40%;">Horaires</td>
              <td class="detail-value" style="text-align: right; color: #1f2937; font-size: 15px; font-weight: 600;">${data.startTime} - ${data.endTime}</td>
            </tr>
          </table>
        </div>

        <div class="detail-row" style="padding: 14px 0; border-bottom: 1px solid rgba(249, 115, 22, 0.3);">
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td class="detail-label" style="font-weight: 500; color: #6b7280; font-size: 15px; width: 40%;">Acompte requis</td>
              <td class="detail-value" style="text-align: right; color: #D97706; font-size: 15px; font-weight: 700;">${data.depositAmount.toFixed(2)} €</td>
            </tr>
          </table>
        </div>

        <div style="padding: 16px 0 0 0;">
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td class="detail-label" style="font-weight: 600; color: #111827; font-size: 17px; width: 40%;">Prix total</td>
              <td class="price-value" style="text-align: right; color: #D97706; font-weight: 700; font-size: 24px; letter-spacing: -0.5px;">${data.totalPrice.toFixed(2)} €</td>
            </tr>
          </table>
        </div>
      </div>

      <!-- Bouton de téléchargement du devis OU message si pas de devis -->
      ${data.depositFileUrl ? `
      <div style="text-align: center; margin: 0 0 30px;">
        <a href="${data.depositFileUrl}" class="download-button" style="display: inline-block; background: #F59E0B; color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 15px; transition: all 0.2s;">
          📄 Télécharger le devis
        </a>
      </div>
      ` : `
      <div style="background: #FEF3C7; border-left: 4px solid #F59E0B; padding: 16px 20px; margin: 0 0 30px; border-radius: 8px;">
        <p style="margin: 0; font-size: 15px; line-height: 1.6; color: #92400E;">
          <strong>📄 Devis en préparation</strong><br>
          Un devis détaillé vous sera transmis prochainement par email.
        </p>
      </div>
      `}

      <!-- Prochaines étapes -->
      <div style="background: #F3F4F6; border-radius: 8px; padding: 20px; margin: 0 0 25px;">
        <h4 style="margin: 0 0 15px; color: #1f2937; font-size: 16px; font-weight: 700;">
          📝 Prochaines étapes
        </h4>
        <ol style="margin: 0; padding-left: 20px; color: #4B5563; line-height: 1.8;">
          ${data.depositFileUrl ? `
          <li style="margin-bottom: 8px;">Consultez le devis ci-dessus</li>
          ` : `
          <li style="margin-bottom: 8px;">Attendez la réception du devis par email</li>
          `}
          <li style="margin-bottom: 8px;">Validez les conditions d'annulation en répondant à cet email</li>
          <li style="margin-bottom: 8px;">Effectuez le paiement de l'acompte de <strong>${data.depositAmount.toFixed(2)} €</strong></li>
          <li>Recevez votre confirmation de réservation</li>
        </ol>
      </div>

      <!-- Contact -->
      <div style="background: #FEF3C7; border-left: 4px solid #F59E0B; padding: 20px; border-radius: 8px; margin: 28px 0;">
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
        À très bientôt,<br>
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
