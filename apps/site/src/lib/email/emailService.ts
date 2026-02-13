/**
 * Email Service - SMTP OVH avec noreply@coworkingcafe.fr
 *
 * Ce service envoie tous les emails de réservation via SMTP OVH.
 * L'adresse d'envoi est noreply@coworkingcafe.fr.
 * L'adresse de contact (strasbourg@) est configurée via env var.
 */

import { sendEmail as smtpSendEmail } from '@coworking-cafe/email';

// Import des types
import type { BaseEmailData, EmailWithDepositData, EmailWithFeesData, ReminderEmailData } from '../../types/cron';

// Import des templates
import { generateBookingValidationEmail, generateReservationRejectedEmail, generateAdminCancelClientBookingEmail, generateClientNoShowEmail } from './templates';
import { generateReminderEmail } from './templates/reminder';
import { generateClientCancelBookingEmail } from './templates/clientCancelBooking';

/**
 * Configuration emails
 */
const EMAIL_CONFIG = {
  // Adresse d'envoi (noreply)
  from: {
    name: process.env.SMTP_FROM_NAME || 'CoworKing Café by Anticafé',
    email: process.env.SMTP_FROM_EMAIL || 'noreply@coworkingcafe.fr',
  },
  // Adresse de contact (sécurisée)
  contact: {
    email: process.env.CONTACT_EMAIL || 'strasbourg@coworkingcafe.fr',
    phone: process.env.CONTACT_PHONE || '09 87 33 45 19',
  },
};

// Types are imported from '../../types/cron' - see imports above
// No need to redefine them here

/**
 * Envoyer un email via SMTP
 */
async function sendEmailViaSMTP(
  to: string,
  subject: string,
  html: string,
  text?: string
): Promise<boolean> {
  try {
    await smtpSendEmail({
      to,
      subject,
      html,
      text: text || '',
    });

    console.log(`Email envoyé avec succès à ${to}: ${subject}`);
    return true;
  } catch (error) {
    console.error(`Erreur lors de l'envoi de l'email à ${to}:`, error);
    return false;
  }
}

/**
 * 1️⃣ EMAIL: Confirmation de réservation initiale
 *
 * Envoyé : Immédiatement après création de la réservation (paiement initial)
 * À : Client
 * Contenu : Récapitulatif de la réservation, empreinte bancaire si applicable
 */
/**
 * 2️⃣ EMAIL: Réservation validée par l'admin
 *
 * Envoyé : Après validation manuelle par un administrateur
 * À : Client
 * Contenu : Confirmation que la réservation est définitivement validée
 */
export async function sendReservationConfirmed(
  to: string,
  data: BaseEmailData
): Promise<boolean> {
  const subject = '🎉 Réservation validée - CoworKing Café';
  const html = generateBookingValidationEmail({ ...data, contactEmail: EMAIL_CONFIG.contact.email }, 'client');

  const text = `
Bonjour ${data.name},

Excellente nouvelle ! Votre réservation a été validée par notre équipe.

Détails :
- Espace : ${data.spaceName}
- Nombre de personnes : ${data.numberOfPeople}
- Date : ${data.date}
- Horaires : ${data.startTime} - ${data.endTime}
- Prix total : ${data.totalPrice.toFixed(2)}€

Tout est prêt pour votre venue !

Pour toute question :
Téléphone : ${EMAIL_CONFIG.contact.phone}
Email : ${EMAIL_CONFIG.contact.email}

À très bientôt,
L'équipe CoworKing Café by Anticafé
  `;

  return sendEmailViaSMTP(to, subject, html, text);
}

/**
 * 3️⃣ EMAIL: Rappel 24h avant la réservation
 *
 * Envoyé : 24 heures avant la date de réservation (cron job)
 * À : Client
 * Contenu : Rappel de la réservation à venir
 */
export async function sendBookingReminder(
  to: string,
  data: ReminderEmailData
): Promise<boolean> {
  const subject = '🔔 Rappel : Votre réservation demain - CoworKing Café';
  const html = generateReminderEmail(data);

  const text = `
Bonjour ${data.name},

Nous vous rappelons votre réservation demain !

Détails :
- Espace : ${data.spaceName}
- Date : ${data.date}
- Horaires : ${data.time}

Nous vous attendons avec impatience !

Pour toute question :
Téléphone : ${EMAIL_CONFIG.contact.phone}
Email : ${EMAIL_CONFIG.contact.email}

À demain,
L'équipe CoworKing Café by Anticafé
  `;

  return sendEmailViaSMTP(to, subject, html, text);
}

/**
 * 4️⃣ EMAIL: Réservation annulée par l'admin
 *
 * Envoyé : Après annulation par un administrateur
 * À : Client
 * Contenu : Notification d'annulation, remboursement si applicable
 */
export async function sendReservationCancelled(
  to: string,
  data: BaseEmailData & { reason?: string }
): Promise<boolean> {
  const subject = '❌ Réservation annulée - CoworKing Café';
  const html = generateAdminCancelClientBookingEmail({ ...data, contactEmail: EMAIL_CONFIG.contact.email });

  const text = `
Bonjour ${data.name},

Nous regrettons de vous informer que votre réservation a été annulée.

Détails de la réservation annulée :
- Espace : ${data.spaceName}
- Date : ${data.date}
- Horaires : ${data.startTime} - ${data.endTime}

${data.reason ? `Raison : ${data.reason}` : ''}

Si un paiement a été effectué, vous serez intégralement remboursé sous 5-10 jours ouvrés.

Pour toute question :
Téléphone : ${EMAIL_CONFIG.contact.phone}
Email : ${EMAIL_CONFIG.contact.email}

Cordialement,
L'équipe CoworKing Café by Anticafé
  `;

  return sendEmailViaSMTP(to, subject, html, text);
}

/**
 * 6️⃣ EMAIL: Pénalité no-show (empreinte capturée)
 *
 * Envoyé : Après capture de l'empreinte bancaire (client ne s'est pas présenté)
 * À : Client
 * Contenu : Notification de capture de l'empreinte, montant débité
 */
export async function sendDepositCaptured(
  to: string,
  data: EmailWithDepositData
): Promise<boolean> {
  const subject = '⚠️ Absence non signalée - Frais appliqués - CoworKing Café';
  const html = generateClientNoShowEmail(data);

  const text = `
Bonjour ${data.name},

Nous n'avons pas constaté votre présence pour la réservation suivante :

- Espace : ${data.spaceName}
- Date : ${data.date}
- Horaires : ${data.startTime} - ${data.endTime}

Conformément à nos CGV, l'empreinte bancaire de ${(data.depositAmount / 100).toFixed(2)}€ a été capturée.

Pour toute question :
Téléphone : ${EMAIL_CONFIG.contact.phone}
Email : ${EMAIL_CONFIG.contact.email}

Cordialement,
L'équipe CoworKing Café by Anticafé
  `;

  return sendEmailViaSMTP(to, subject, html, text);
}

/**
 * 9️⃣ EMAIL: Annulation par le client (avec frais)
 *
 * Envoyé : Après annulation de la réservation par le client
 * À : Client
 * Contenu : Confirmation d'annulation, frais appliqués, montant remboursé
 */
export async function sendCancellationConfirmation(
  to: string,
  data: EmailWithFeesData
): Promise<boolean> {
  const subject = '❌ Annulation confirmée - CoworKing Café';
  const html = generateClientCancelBookingEmail(data);

  const text = `
Bonjour ${data.name},

Votre réservation a été annulée.

Détails :
- Espace : ${data.spaceName}
- Date : ${data.date}
- Horaires : ${data.startTime} - ${data.endTime}
- Prix initial : ${data.totalPrice.toFixed(2)}€

Frais d'annulation : ${data.cancellationFees.toFixed(2)}€
Montant remboursé : ${data.refundAmount.toFixed(2)}€

Le remboursement sera effectué sous 5-10 jours ouvrés.

Pour toute question :
Téléphone : ${EMAIL_CONFIG.contact.phone}
Email : ${EMAIL_CONFIG.contact.email}

Cordialement,
L'équipe CoworKing Café by Anticafé
  `;

  return sendEmailViaSMTP(to, subject, html, text);
}

/**
 * 🔟 EMAIL: Réservation refusée par l'admin
 *
 * Envoyé : Après refus de la réservation par un administrateur
 * À : Client
 * Contenu : Notification de refus, raison, remboursement intégral
 */
export async function sendReservationRejected(
  to: string,
  data: BaseEmailData & { reason?: string }
): Promise<boolean> {
  const subject = '❌ Réservation refusée - CoworKing Café';
  const html = generateReservationRejectedEmail(data);

  const text = `
Bonjour ${data.name},

Nous regrettons de vous informer que votre demande de réservation a été refusée.

Détails :
- Espace : ${data.spaceName}
- Date : ${data.date}
- Horaires : ${data.startTime} - ${data.endTime}

${data.reason ? `Raison : ${data.reason}` : ''}

Si un paiement a été effectué, vous serez intégralement remboursé sous 5-10 jours ouvrés.

Pour toute question :
Téléphone : ${EMAIL_CONFIG.contact.phone}
Email : ${EMAIL_CONFIG.contact.email}

Cordialement,
L'équipe CoworKing Café by Anticafé
  `;

  return sendEmailViaSMTP(to, subject, html, text);
}

/**
 * 1️⃣1️⃣ EMAIL: Confirmation initiale de booking
 *
 * Envoyé : Immédiatement après soumission du formulaire (avant validation)
 * À : Client
 * Contenu : Accusé de réception, en attente de validation
 */
export async function sendClientBookingConfirmation(
  to: string,
  data: BaseEmailData
): Promise<boolean> {
  const subject = '📝 Demande de réservation reçue - CoworKing Café';

  // Import the template function
  const { generateBookingInitialEmail } = require('./templates/clientBookingConfirmation');

  const html = generateBookingInitialEmail({
    name: data.name,
    spaceName: data.spaceName,
    date: data.date,
    time: `${data.startTime} - ${data.endTime}`,
    price: data.totalPrice,
    bookingId: '', // Not provided in BaseEmailData, will need to update if needed
    requiresPayment: false,
    numberOfPeople: data.numberOfPeople,
    contactEmail: data.contactEmail,
  });

  const text = `
Bonjour ${data.name},

Nous avons bien reçu votre demande de réservation.

Détails :
- Espace : ${data.spaceName}
- Nombre de personnes : ${data.numberOfPeople}
- Date : ${data.date}
- Horaires : ${data.startTime} - ${data.endTime}
- Prix total : ${data.totalPrice.toFixed(2)}€

Votre demande est en cours de traitement. Vous recevrez une confirmation par email une fois validée.

Pour toute question :
Téléphone : ${EMAIL_CONFIG.contact.phone}
Email : ${EMAIL_CONFIG.contact.email}

À très bientôt,
L'équipe CoworKing Café by Anticafé
  `;

  return sendEmailViaSMTP(to, subject, html, text);
}

/**
 * 📧 EMAIL: Formulaire de contact
 *
 * Envoyé : Après soumission du formulaire de contact
 * À : Client (confirmation) + Admin (notification)
 * Contenu : Accusé de réception du message
 */
export async function sendContactFormEmail(
  to: string,
  data: {
    name: string;
    email: string;
    subject: string;
    message: string;
  }
): Promise<boolean> {
  const subject = `📨 Message reçu - ${data.subject}`;

  const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <h1 style="color: #10B981;">Message reçu</h1>

    <p>Bonjour ${data.name},</p>

    <p>Nous avons bien reçu votre message concernant : <strong>${data.subject}</strong></p>

    <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <p style="margin: 0;"><strong>Votre message :</strong></p>
      <p style="margin: 10px 0 0 0;">${data.message}</p>
    </div>

    <p>Nous vous répondrons dans les plus brefs délais.</p>

    <p>Pour toute question urgente :</p>
    <ul>
      <li>Téléphone : ${EMAIL_CONFIG.contact.phone}</li>
      <li>Email : ${EMAIL_CONFIG.contact.email}</li>
    </ul>

    <p>Cordialement,<br>L'équipe CoworKing Café by Anticafé</p>
  </div>
</body>
</html>
  `;

  const text = `
Bonjour ${data.name},

Nous avons bien reçu votre message concernant : ${data.subject}

Votre message :
${data.message}

Nous vous répondrons dans les plus brefs délais.

Pour toute question urgente :
Téléphone : ${EMAIL_CONFIG.contact.phone}
Email : ${EMAIL_CONFIG.contact.email}

Cordialement,
L'équipe CoworKing Café by Anticafé
  `;

  return sendEmailViaSMTP(to, subject, html, text);
}

/**
 * 1️⃣1️⃣ EMAIL: Confirmation initiale de réservation (avec tous les détails)
 *
 * Envoyé : Immédiatement après création de la réservation
 * À : Client
 * Contenu : Récapitulatif complet avec services additionnels et empreinte bancaire si applicable
 */
export async function sendBookingInitialEmail(
  to: string,
  data: {
    name: string;
    spaceName: string;
    date: string;
    time: string;
    price: number;
    bookingId: string;
    requiresPayment: boolean;
    depositAmount?: number;
    captureMethod?: 'manual' | 'automatic';
    additionalServices?: Array<{ name: string; quantity: number; price: number }>;
    numberOfPeople: number;
  }
): Promise<boolean> {
  const subject = '⏳ Réservation en attente de validation - CoworKing Café';

  // Import du template clientBookingConfirmation
  const { generateBookingInitialEmail } = require('./templates/clientBookingConfirmation');

  const html = generateBookingInitialEmail({
    ...data,
    contactEmail: EMAIL_CONFIG.contact.email,
  });

  const text = `
Bonjour ${data.name},

Nous avons bien reçu votre demande de réservation.

Détails :
- Espace : ${data.spaceName}
- Nombre de personnes : ${data.numberOfPeople}
- Date : ${data.date}
- Horaires : ${data.time}
- Prix total : ${data.price.toFixed(2)}€

${data.depositAmount ? `Une empreinte bancaire de ${(data.depositAmount / 100).toFixed(2)}€ a été effectuée.` : ''}

Votre réservation sera confirmée après validation. Vous recevrez un email de confirmation.

Pour toute question :
Téléphone : ${EMAIL_CONFIG.contact.phone}
Email : ${EMAIL_CONFIG.contact.email}

À très bientôt,
L'équipe CoworKing Café by Anticafé
  `;

  return sendEmailViaSMTP(to, subject, html, text);
}

/**
 * Export de la configuration pour utilisation dans les templates
 */
export function getContactEmail(): string {
  return EMAIL_CONFIG.contact.email;
}

export function getContactPhone(): string {
  return EMAIL_CONFIG.contact.phone;
}
