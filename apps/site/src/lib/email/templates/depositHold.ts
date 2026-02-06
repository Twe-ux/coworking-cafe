/**
 * Template email : Empreinte bancaire
 * Couleur : BLEU (#3B82F6)
 *
 * Pour modifier ce template, éditez directement ce fichier.
 */

import { getSpaceDisplayName } from "./helpers";

interface DepositHoldEmailData {
  name: string;
  spaceName: string;
  date: string;
  startTime: string;
  endTime: string;
  depositAmount: number;
  totalPrice: number;
}

export function generateDepositHoldEmail(data: DepositHoldEmailData): string {
  const displaySpaceName = getSpaceDisplayName(data.spaceName);
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; background: #fff; border-radius: 12px; overflow: hidden; border: 1px solid #e5e7eb;">

    <!-- Header BLEU -->
    <div style="background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%); color: white; padding: 30px 20px; text-align: center;">
      <h1 style="margin: 0 0 10px 0; font-size: 28px;">💳 Empreinte bancaire confirmée</h1>
      <p style="margin: 0; font-size: 16px; opacity: 0.95;">Votre réservation est garantie</p>
    </div>

    <!-- Contenu -->
    <div style="padding: 30px 20px; line-height: 1.6; color: #333;">
      <p style="margin: 0 0 15px 0;">Bonjour <strong>${data.name}</strong>,</p>

      <p style="margin: 0 0 20px 0;">Nous avons effectué une empreinte bancaire pour garantir votre réservation.</p>

      <!-- Info Box Empreinte -->
      <div style="background: #EFF6FF; border-left: 4px solid #3B82F6; padding: 15px; border-radius: 4px; margin: 20px 0;">
        <p style="margin: 0; color: #1E40AF !important;"><strong>💳 Comment fonctionne l'empreinte bancaire ?</strong></p>
        <p style="margin: 8px 0 0 0; color: #1E40AF !important; font-size: 14px;">
          Une empreinte bancaire de <strong>${data.depositAmount.toFixed(
            2
          )}€</strong> a été effectuée sur votre carte.
        </p>
        <p style="margin: 8px 0 0 0; color: #1E40AF !important; font-size: 14px;">
          ✅ <strong>Si vous êtes présent</strong> : l'empreinte sera annulée automatiquement<br>
          ⚠️ <strong>En cas de non-présentation</strong> : l'empreinte sera encaissée
        </p>
      </div>

      <!-- Détails de la réservation -->
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin: 0 0 15px 0; color: #3B82F6;">Détails de votre réservation</h3>

        <div style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
          <div style="display: flex; justify-content: space-between;">
            <span style="font-weight: 600; color: #6b7280 !important;">Espace</span>
            <span style="color: #111827 !important;">${displaySpaceName}</span>
          </div>
        </div>

        <div style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
          <div style="display: flex; justify-content: space-between;">
            <span style="font-weight: 600; color: #6b7280 !important;">Date</span>
            <span style="color: #111827 !important;">${data.date}</span>
          </div>
        </div>

        <div style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
          <div style="display: flex; justify-content: space-between;">
            <span style="font-weight: 600; color: #6b7280 !important;">Horaires</span>
            <span style="color: #111827 !important;">${data.startTime} - ${
    data.endTime
  }</span>
          </div>
        </div>

        <div style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
          <div style="display: flex; justify-content: space-between;">
            <span style="font-weight: 600; color: #6b7280 !important;">Empreinte bancaire</span>
            <span style="color: #3B82F6 !important; font-weight: bold;">${data.depositAmount.toFixed(
              2
            )}€</span>
          </div>
        </div>

        <div style="padding: 10px 0;">
          <div style="display: flex; justify-content: space-between;">
            <span style="font-weight: 600; color: #6b7280 !important;">Prix total</span>
            <span style="color: #3B82F6 !important; font-weight: bold; font-size: 18px;">${data.totalPrice.toFixed(
              2
            )}€</span>
          </div>
        </div>
      </div>

      <!-- Contact -->
      <p style="margin: 25px 0 10px 0;"><strong>Pour toute question, n'hésitez pas à nous contacter :</strong></p>
      <ul style="list-style: none; padding: 0; margin: 0 0 20px 0;">
        <li style="padding: 5px 0;">📞 Téléphone : 09 87 33 45 19</li>
        <li style="padding: 5px 0;">📧 Email : ${data.contactEmail}</li>
      </ul>

      <p style="margin: 25px 0 0 0;">À bientôt dans nos locaux,<br><strong>L'équipe CoworKing Café by Anticafé</strong></p>
    </div>

    <!-- Footer -->
    <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #6b7280; font-size: 14px;">
      <p style="margin: 0;"><strong>CoworKing Café by Anticafé</strong></p>
      <p style="margin: 5px 0 0 0;">1 rue de la Division Leclerc, 67000 Strasbourg</p>
      <p style="margin: 5px 0 0 0;">L-V: 09h-20h | S-D & JF: 10h-20h</p>
    </div>
  </div>
</body>
</html>
  `;
}
