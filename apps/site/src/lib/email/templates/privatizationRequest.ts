/**
 * Template email : Demande de privatisation
 * Couleur : TEAL (#10B981) pour cohérence avec les emails de confirmation
 *
 * 2 variantes :
 * - Admin : notification complète avec tous les détails
 * - Client : accusé de réception avec récapitulatif
 */

import { sendEmail } from '../emailService';
import type { DevisFormData } from '@/components/site/privatization/DevisFormSchema';

export type PrivatizationRequestData = DevisFormData;

const EVENT_TYPE_LABELS: Record<PrivatizationRequestData['eventType'], string> = {
  'atelier': 'Atelier',
  'team-building': 'Team Building',
  'conference': 'Conférence',
  'reunion': 'Réunion',
  'autre': 'Autre',
};

/**
 * Send privatization request email (admin notification or client confirmation)
 */
export async function sendPrivatizationRequestEmail({
  to,
  data,
  type,
}: {
  to: string;
  data: PrivatizationRequestData;
  type: 'admin' | 'client';
}): Promise<boolean> {
  const subject = type === 'admin'
    ? `Nouvelle demande de privatisation - ${data.contactName}`
    : 'Demande de privatisation reçue - CoworKing Café';

  const html = type === 'admin'
    ? generateAdminTemplate(data)
    : generateClientTemplate(data);

  return sendEmail({ to, subject, html });
}

// ─── Helpers ────────────────────────────────────────────

function getEventLabel(data: PrivatizationRequestData): string {
  const label = EVENT_TYPE_LABELS[data.eventType];
  if (data.eventType === 'autre' && data.eventTypeOther) {
    return `${label} - ${data.eventTypeOther}`;
  }
  return label;
}

function formatDateFR(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

// ─── Admin Template ─────────────────────────────────────

function generateAdminTemplate(data: PrivatizationRequestData): string {
  const eventDetails = getEventLabel(data);
  const formattedDate = formatDateFR(data.date);

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light dark">
  <style>
    @media (prefers-color-scheme: dark) {
      .email-container { background: #1f2937 !important; border-color: #374151 !important; }
      .email-header { background: linear-gradient(135deg, #10B981 0%, #059669 100%) !important; }
      .email-content { background: #1f2937 !important; color: #f3f4f6 !important; }
      .email-content p, .email-content strong, .email-content td { color: #f3f4f6 !important; }
      .details-box { background: #111827 !important; border-color: #10B981 !important; }
      .details-box h3 { color: #10B981 !important; }
      .message-box { background: #111827 !important; border-color: #3b82f6 !important; }
      .message-box p { color: #dbeafe !important; }
      .footer { background: #111827 !important; color: #9ca3af !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; background-color: #fff;">
  <div class="email-container" style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; border: 1px solid #e5e7eb;">

    <!-- Header -->
    <div class="email-header" style="background: linear-gradient(135deg, #10B981 0%, #059669 100%); color: white; padding: 40px 24px; text-align: center;">
      <h1 style="margin: 0 0 12px 0; font-size: 28px; font-weight: 700;">Nouvelle demande de privatisation</h1>
      <p style="margin: 0; font-size: 16px; opacity: 0.95;">${data.contactName}${data.company ? ` - ${data.company}` : ''}</p>
    </div>

    <!-- Content -->
    <div class="email-content" style="padding: 36px 24px; line-height: 1.7; color: #1f2937;">

      <!-- Contact Info -->
      <div class="details-box" style="background: #f9fafb; padding: 24px; border-radius: 12px; margin: 0 0 24px 0; border: 1px solid #10B981;">
        <h3 style="margin: 0 0 16px 0; color: #10B981; font-size: 18px; font-weight: 700; border-bottom: 2px solid #10B981; padding-bottom: 10px;">Contact</h3>
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
          <tr>
            <td style="padding: 8px 0; font-weight: 600; color: #6b7280; width: 120px;">Nom</td>
            <td style="padding: 8px 0; color: #111827;">${data.contactName}</td>
          </tr>
          ${data.company ? `
          <tr>
            <td style="padding: 8px 0; font-weight: 600; color: #6b7280;">Société</td>
            <td style="padding: 8px 0; color: #111827;">${data.company}</td>
          </tr>` : ''}
          <tr>
            <td style="padding: 8px 0; font-weight: 600; color: #6b7280;">Email</td>
            <td style="padding: 8px 0;"><a href="mailto:${data.email}" style="color: #10B981; text-decoration: none;">${data.email}</a></td>
          </tr>
          ${data.phone ? `
          <tr>
            <td style="padding: 8px 0; font-weight: 600; color: #6b7280;">Téléphone</td>
            <td style="padding: 8px 0;"><a href="tel:${data.phone}" style="color: #10B981; text-decoration: none;">${data.phone}</a></td>
          </tr>` : ''}
        </table>
      </div>

      <!-- Event Details -->
      <div class="details-box" style="background: #f9fafb; padding: 24px; border-radius: 12px; margin: 0 0 24px 0; border: 1px solid #10B981;">
        <h3 style="margin: 0 0 16px 0; color: #10B981; font-size: 18px; font-weight: 700; border-bottom: 2px solid #10B981; padding-bottom: 10px;">Détails de l'événement</h3>
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
          <tr>
            <td style="padding: 8px 0; font-weight: 600; color: #6b7280; width: 120px;">Type</td>
            <td style="padding: 8px 0; color: #111827; font-weight: 500;">${eventDetails}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: 600; color: #6b7280;">Date</td>
            <td style="padding: 8px 0; color: #111827;">${formattedDate}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: 600; color: #6b7280;">Horaires</td>
            <td style="padding: 8px 0; color: #111827;">${data.startTime} - ${data.endTime}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: 600; color: #6b7280;">Participants</td>
            <td style="padding: 8px 0; color: #111827; font-weight: 500;">${data.attendees} personnes</td>
          </tr>
        </table>
      </div>

      ${data.message ? `
      <!-- Message -->
      <div class="message-box" style="background: #EFF6FF; border-left: 4px solid #3B82F6; padding: 20px; border-radius: 8px; margin: 0 0 24px 0;">
        <p style="margin: 0 0 8px 0; font-weight: 700; color: #1E40AF; font-size: 15px;">Message du client</p>
        <p style="margin: 0; color: #1E40AF; font-size: 15px; line-height: 1.7;">${data.message.replace(/\n/g, '<br>')}</p>
      </div>` : ''}
    </div>

    <!-- Footer -->
    <div class="footer" style="background: #f9fafb; padding: 20px 24px; text-align: center; color: #6b7280; font-size: 13px; border-top: 1px solid #e5e7eb;">
      <p style="margin: 0;">Demande reçue via le formulaire de devis - coworkingcafe.fr</p>
    </div>
  </div>
</body>
</html>`;
}

// ─── Client Template ────────────────────────────────────

function generateClientTemplate(data: PrivatizationRequestData): string {
  const eventLabel = EVENT_TYPE_LABELS[data.eventType];
  const formattedDate = formatDateFR(data.date);

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light dark">
  <style>
    @media (prefers-color-scheme: dark) {
      .email-container { background: #1f2937 !important; border-color: #374151 !important; }
      .email-header { background: linear-gradient(135deg, #10B981 0%, #059669 100%) !important; }
      .email-content { background: #1f2937 !important; color: #f3f4f6 !important; }
      .email-content p, .email-content strong, .email-content td { color: #f3f4f6 !important; }
      .details-box { background: #111827 !important; border-color: #10B981 !important; }
      .details-box h3 { color: #10B981 !important; }
      .contact-box { background: #fffbeb !important; border-color: #F59E0B !important; }
      .footer { background: #111827 !important; color: #9ca3af !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; background-color: #fff;">
  <div class="email-container" style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; border: 1px solid #e5e7eb;">

    <!-- Header -->
    <div class="email-header" style="background: linear-gradient(135deg, #10B981 0%, #059669 100%); color: white; padding: 40px 24px; text-align: center;">
      <h1 style="margin: 0 0 12px 0; font-size: 28px; font-weight: 700;">Demande de devis reçue</h1>
      <p style="margin: 0; font-size: 16px; opacity: 0.95;">Nous reviendrons vers vous sous 48h ouvrées</p>
    </div>

    <!-- Content -->
    <div class="email-content" style="padding: 36px 24px; line-height: 1.7; color: #1f2937;">
      <p style="margin: 0 0 16px 0; font-size: 16px;">Bonjour <strong style="color: #10B981;">${data.contactName}</strong>,</p>

      <p style="margin: 0 0 24px 0; font-size: 16px;">Nous avons bien reçu votre demande de privatisation pour le <strong>${formattedDate}</strong>. Notre équipe va étudier votre demande et vous contactera sous <strong>48h ouvrées</strong>.</p>

      <!-- Summary -->
      <div class="details-box" style="background: #f9fafb; padding: 24px; border-radius: 12px; margin: 0 0 28px 0; border: 1px solid #10B981;">
        <h3 style="margin: 0 0 16px 0; color: #10B981; font-size: 18px; font-weight: 700; border-bottom: 2px solid #10B981; padding-bottom: 10px;">Récapitulatif de votre demande</h3>
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td style="font-weight: 600; color: #6b7280; font-size: 15px;">Type d'événement</td>
                  <td style="text-align: right; color: #111827; font-size: 15px; font-weight: 500;">${eventLabel}</td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td style="font-weight: 600; color: #6b7280; font-size: 15px;">Date</td>
                  <td style="text-align: right; color: #111827; font-size: 15px; font-weight: 500;">${formattedDate}</td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td style="font-weight: 600; color: #6b7280; font-size: 15px;">Horaires</td>
                  <td style="text-align: right; color: #111827; font-size: 15px; font-weight: 500;">${data.startTime} - ${data.endTime}</td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 10px 0;">
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td style="font-weight: 600; color: #6b7280; font-size: 15px;">Participants</td>
                  <td style="text-align: right; color: #111827; font-size: 15px; font-weight: 500;">${data.attendees} personnes</td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </div>

      <!-- CTA -->
      <div style="text-align: center; margin: 28px 0;">
        <a href="https://coworkingcafe.fr/privatization" style="display: inline-block; padding: 14px 28px; background: #10B981; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px;">Voir la page Privatisation</a>
      </div>

      <!-- Contact -->
      <div class="contact-box" style="background: #fffbeb; border-left: 4px solid #F59E0B; padding: 20px; border-radius: 8px; margin: 28px 0;">
        <p style="margin: 0 0 12px 0; font-weight: 700; color: #92400E; font-size: 16px;">Une question ?</p>
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
          <tr>
            <td style="padding: 4px 0; font-size: 15px; color: #92400E;">
              <strong>Téléphone :</strong> <a href="tel:0987334519" style="color: #F59E0B; text-decoration: none;">09 87 33 45 19</a>
            </td>
          </tr>
          <tr>
            <td style="padding: 4px 0; font-size: 15px; color: #92400E;">
              <strong>Email :</strong> <a href="mailto:contact@coworkingcafe.fr" style="color: #F59E0B; text-decoration: none;">contact@coworkingcafe.fr</a>
            </td>
          </tr>
        </table>
      </div>

      <p style="margin: 32px 0 0 0; font-size: 16px; line-height: 1.8;">
        À très bientôt au CoworKing Café !<br>
        <strong style="color: #10B981; font-size: 17px;">L'équipe CoworKing Café by Anticafé</strong>
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
</html>`;
}
