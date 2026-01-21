/**
 * Template email : Carte enregistrée pour paiement différé
 * Couleur : PURPLE (#8B5CF6)
 *
 * Pour modifier ce template, éditez directement ce fichier.
 */

import { getSpaceDisplayName } from "./helpers";

export interface CardSavedEmailData {
  name: string;
  spaceName: string;
  date: string;
  startTime: string;
  endTime: string;
  totalPrice: number;
}

export function generateCardSavedEmail(data: CardSavedEmailData): string {
  const displaySpaceName = getSpaceDisplayName(data.spaceName);
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; border: 1px solid #e5e7eb;">

    <!-- Header PURPLE -->
    <div style="background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%); color: white; padding: 30px 20px; text-align: center;">
      <h1 style="margin: 0 0 10px 0; font-size: 28px;">💳 Carte enregistrée</h1>
      <p style="margin: 0; font-size: 16px; opacity: 0.95;">Paiement programmé</p>
    </div>

    <!-- Contenu -->
    <div style="padding: 30px 20px; line-height: 1.6; color: #333;">
      <p style="margin: 0 0 15px 0;">Bonjour <strong>${data.name}</strong>,</p>

      <p style="margin: 0 0 20px 0;">Nous avons bien enregistré votre carte bancaire pour votre prochaine réservation.</p>

      <!-- Info Box Paiement Différé -->
      <div style="background: #F5F3FF; border-left: 4px solid #8B5CF6; padding: 15px; border-radius: 4px; margin: 20px 0;">
        <p style="margin: 0; color: #5B21B6 !important;"><strong>⏰ Paiement différé</strong></p>
        <p style="margin: 8px 0 0 0; color: #5B21B6 !important; font-size: 14px;">
          Le paiement de <strong>${data.totalPrice.toFixed(
            2
          )}€</strong> sera automatiquement prélevé <strong>7 jours avant votre réservation</strong>. Vous recevrez un email de confirmation du paiement à ce moment-là.
        </p>
      </div>

      <!-- Détails de la réservation -->
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin: 0 0 15px 0; color: #8B5CF6;">Détails de votre réservation</h3>

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

        <div style="padding: 10px 0;">
          <div style="display: flex; justify-content: space-between;">
            <span style="font-weight: 600; color: #6b7280 !important;">Prix total</span>
            <span style="color: #8B5CF6 !important; font-weight: bold; font-size: 18px;">${data.totalPrice.toFixed(
              2
            )}€</span>
          </div>
        </div>
      </div>

      <!-- Info Annulation -->
      <div style="background: #FEF2F2; border-left: 4px solid #EF4444; padding: 15px; border-radius: 4px; margin: 20px 0;">
        <p style="margin: 0; color: #991B1B !important;"><strong>⚠️ Politique d'annulation</strong></p>
        <p style="margin: 8px 0 0 0; color: #991B1B !important; font-size: 14px;">
          Vous pouvez annuler gratuitement votre réservation jusqu'à 7 jours avant la date prévue. Passé ce délai, le paiement sera effectué et aucun remboursement ne sera possible.
        </p>
      </div>

      <p style="margin: 20px 0;">Vous recevrez un rappel par email 8 jours avant votre réservation, juste avant le prélèvement.</p>

      <!-- Contact -->
      <p style="margin: 25px 0 10px 0;"><strong>Pour toute question, n'hésitez pas à nous contacter :</strong></p>
      <ul style="list-style: none; padding: 0; margin: 0 0 20px 0;">
        <li style="padding: 5px 0;">📞 Téléphone : 09 87 33 45 19</li>
        <li style="padding: 5px 0;">📧 Email : strasbourg@coworkingcafe.fr</li>
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
