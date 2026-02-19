/**
 * Admin notification template when a booking is cancelled
 * Sent to the team to alert them of cancellations
 */

interface AdminCancellationData {
  cancelledBy: 'client' | 'admin';
  cancelledByName?: string; // Name of admin if cancelled by admin
  clientName: string;
  clientEmail: string;
  spaceName: string;
  date: string;
  startTime?: string;
  endTime?: string;
  numberOfPeople?: number;
  totalPrice: number;
  cancellationFees: number;
  refundAmount: number;
  confirmationNumber?: string;
  reason?: string;
  wasPending: boolean;
  cancelledAt: string; // ISO date string
}

export function generateAdminCancellationNotification(data: AdminCancellationData): string {
  const timeSlot = data.startTime && data.endTime
    ? `${data.startTime} - ${data.endTime}`
    : 'Journée complète';

  const cancelSource = data.cancelledBy === 'admin'
    ? `par ${data.cancelledByName || 'un administrateur'}`
    : 'par le client';

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Annulation de réservation</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f4f4f4;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); padding: 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">
                ❌ Annulation de réservation
              </h1>
              <p style="margin: 10px 0 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">
                Notification équipe
              </p>
            </td>
          </tr>

          <!-- Alert Banner -->
          <tr>
            <td style="padding: 20px 30px; background-color: #fff3cd; border-bottom: 3px solid #ffc107;">
              <p style="margin: 0; color: #856404; font-size: 14px; text-align: center;">
                <strong>⚠️ Annulation ${cancelSource}</strong><br>
                ${new Date(data.cancelledAt).toLocaleDateString('fr-FR', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 30px;">

              <!-- Client Info -->
              <div style="margin-bottom: 25px; padding: 20px; background-color: #f8f9fa; border-left: 4px solid #6c757d; border-radius: 4px;">
                <h2 style="margin: 0 0 15px 0; color: #333; font-size: 16px; font-weight: 600;">
                  👤 Informations client
                </h2>
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                  <tr>
                    <td style="padding: 5px 0; color: #666; font-size: 14px;"><strong>Nom :</strong></td>
                    <td style="padding: 5px 0; color: #333; font-size: 14px; text-align: right;">${data.clientName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 5px 0; color: #666; font-size: 14px;"><strong>Email :</strong></td>
                    <td style="padding: 5px 0; color: #333; font-size: 14px; text-align: right;">${data.clientEmail}</td>
                  </tr>
                  ${data.confirmationNumber ? `
                  <tr>
                    <td style="padding: 5px 0; color: #666; font-size: 14px;"><strong>N° confirmation :</strong></td>
                    <td style="padding: 5px 0; color: #333; font-size: 14px; text-align: right; font-family: monospace;">${data.confirmationNumber}</td>
                  </tr>
                  ` : ''}
                </table>
              </div>

              <!-- Booking Details -->
              <div style="margin-bottom: 25px; padding: 20px; background-color: #f8f9fa; border-left: 4px solid #0056b3; border-radius: 4px;">
                <h2 style="margin: 0 0 15px 0; color: #333; font-size: 16px; font-weight: 600;">
                  📅 Détails de la réservation annulée
                </h2>
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                  <tr>
                    <td style="padding: 5px 0; color: #666; font-size: 14px;"><strong>Espace :</strong></td>
                    <td style="padding: 5px 0; color: #333; font-size: 14px; text-align: right;">${data.spaceName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 5px 0; color: #666; font-size: 14px;"><strong>Date :</strong></td>
                    <td style="padding: 5px 0; color: #333; font-size: 14px; text-align: right;">${data.date}</td>
                  </tr>
                  <tr>
                    <td style="padding: 5px 0; color: #666; font-size: 14px;"><strong>Horaire :</strong></td>
                    <td style="padding: 5px 0; color: #333; font-size: 14px; text-align: right;">${timeSlot}</td>
                  </tr>
                  ${data.numberOfPeople ? `
                  <tr>
                    <td style="padding: 5px 0; color: #666; font-size: 14px;"><strong>Nombre de personnes :</strong></td>
                    <td style="padding: 5px 0; color: #333; font-size: 14px; text-align: right;">${data.numberOfPeople}</td>
                  </tr>
                  ` : ''}
                  <tr>
                    <td style="padding: 5px 0; color: #666; font-size: 14px;"><strong>Montant total :</strong></td>
                    <td style="padding: 5px 0; color: #333; font-size: 14px; text-align: right; font-weight: 600;">${data.totalPrice.toFixed(2)}€</td>
                  </tr>
                </table>
              </div>

              <!-- Financial Details -->
              <div style="margin-bottom: 25px; padding: 20px; background-color: ${data.wasPending ? '#d1ecf1' : data.cancellationFees === 0 ? '#d4edda' : '#fff3cd'}; border-left: 4px solid ${data.wasPending ? '#17a2b8' : data.cancellationFees === 0 ? '#28a745' : '#ffc107'}; border-radius: 4px;">
                <h2 style="margin: 0 0 15px 0; color: #333; font-size: 16px; font-weight: 600;">
                  💰 Détails financiers
                </h2>
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                  <tr>
                    <td style="padding: 5px 0; color: #666; font-size: 14px;"><strong>Statut :</strong></td>
                    <td style="padding: 5px 0; color: #333; font-size: 14px; text-align: right;">
                      ${data.wasPending ? '⏳ En attente (non validée)' : '✅ Confirmée'}
                    </td>
                  </tr>
                  ${!data.wasPending ? `
                  <tr>
                    <td style="padding: 5px 0; color: #666; font-size: 14px;"><strong>Frais d'annulation :</strong></td>
                    <td style="padding: 5px 0; color: ${data.cancellationFees > 0 ? '#dc3545' : '#28a745'}; font-size: 14px; text-align: right; font-weight: 600;">
                      ${data.cancellationFees.toFixed(2)}€
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 5px 0; color: #666; font-size: 14px;"><strong>Montant non prélevé :</strong></td>
                    <td style="padding: 5px 0; color: #28a745; font-size: 14px; text-align: right; font-weight: 600;">
                      ${data.refundAmount.toFixed(2)}€
                    </td>
                  </tr>
                  ` : `
                  <tr>
                    <td colspan="2" style="padding: 10px 0; color: #0c5460; font-size: 13px; background-color: rgba(23, 162, 184, 0.1); padding: 10px; border-radius: 4px; margin-top: 10px;">
                      <strong>ℹ️ Aucun frais :</strong> Réservation non validée, aucune empreinte bancaire créée
                    </td>
                  </tr>
                  `}
                </table>
              </div>

              ${data.reason ? `
              <!-- Cancellation Reason -->
              <div style="margin-bottom: 25px; padding: 20px; background-color: #f8f9fa; border-left: 4px solid #6c757d; border-radius: 4px;">
                <h2 style="margin: 0 0 10px 0; color: #333; font-size: 16px; font-weight: 600;">
                  💬 Raison de l'annulation
                </h2>
                <p style="margin: 0; color: #333; font-size: 14px; font-style: italic;">
                  "${data.reason}"
                </p>
              </div>
              ` : ''}

              <!-- Action Required -->
              <div style="margin-top: 30px; padding: 20px; background-color: #e7f3ff; border-left: 4px solid #0056b3; border-radius: 4px;">
                <p style="margin: 0; color: #004085; font-size: 14px;">
                  <strong>📋 Actions à prévoir :</strong><br>
                  ${data.wasPending
                    ? '• Aucune action requise (réservation non validée)'
                    : `• Vérifier que le ${data.cancellationFees > 0 ? 'prélèvement' : 'release'} Stripe a bien été effectué<br>
                       • Mettre à jour le planning si nécessaire`
                  }
                </p>
              </div>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 30px; background-color: #f8f9fa; border-top: 1px solid #dee2e6; text-align: center;">
              <p style="margin: 0; color: #6c757d; font-size: 12px;">
                Email automatique - Dashboard Admin<br>
                <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://coworkingcafe.fr'}/admin/booking/reservations"
                   style="color: #0056b3; text-decoration: none;">
                  Voir dans le dashboard →
                </a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}
