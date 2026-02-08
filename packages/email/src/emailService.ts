import { createSMTPTransporter, createSMTPTransporterWithCredentials } from './providers/smtp';
import type { SMTPProvider } from './providers/smtp';

/**
 * Email Service using SMTP
 *
 * Configuration via environment variables:
 * SMTP_PROVIDER=gmail|custom|brevo|sendgrid
 * SMTP_USER=your-email@gmail.com
 * SMTP_PASSWORD=your-app-password
 * SMTP_FROM_NAME=CoworKing Café
 * SMTP_FROM_EMAIL=noreply@coworkingcafe.fr
 */

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
  attachments?: Array<{
    filename: string;
    content?: string | Buffer;
    path?: string;
  }>;
}

/**
 * Email sender types
 */
export type EmailSenderType = 'booking' | 'contact' | 'default';

/**
 * Get email sender address based on type
 */
const getEmailSender = (type: EmailSenderType = 'default'): string => {
  const fromName = process.env.SMTP_FROM_NAME || 'CoworKing Café';
  const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER;

  switch (type) {
    case 'booking':
      return `${fromName} - Réservations <${fromEmail}>`;
    case 'contact':
      return `${fromName} - Contact <${fromEmail}>`;
    case 'default':
    default:
      return `${fromName} <${fromEmail}>`;
  }
};

/**
 * Send email via SMTP
 */
export async function sendEmail(
  options: EmailOptions,
  senderType: EmailSenderType = 'default'
): Promise<boolean> {
  try {
    const transporter = createSMTPTransporter();

    const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER!;
    const contactEmail = process.env.CONTACT_EMAIL || 'strasbourg@coworkingcafe.fr';

    await transporter.sendMail({
      from: options.from || getEmailSender(senderType),
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
      replyTo: options.replyTo || contactEmail,
      attachments: options.attachments,
      // ✅ Headers pour améliorer délivrabilité
      headers: {
        'X-Mailer': 'CoworKing Café Email Service',
        'X-Priority': '3',
        'List-Unsubscribe': `<mailto:${contactEmail}?subject=Unsubscribe>`,
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
      },
      // ✅ Envelope pour Return-Path
      envelope: {
        from: fromEmail,
        to: options.to,
      },
    });

    console.log(`✅ Email sent to ${options.to}`);
    return true;
  } catch (error) {
    console.error('❌ Error sending email:', error);
    return false;
  }
}

/**
 * Send booking confirmation email
 */
export async function sendBookingConfirmation(
  email: string,
  bookingDetails: {
    name: string;
    spaceName: string;
    date: string;
    time: string;
    price: number;
    bookingId: string;
  }
): Promise<boolean> {
  const subject = 'Confirmation de réservation - CoworKing Café';

  const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 20px; font-family: Arial, sans-serif; background-color: #f3f4f6;">
  <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; padding: 32px;">
    <h1 style="color: #1f2937; margin: 0 0 24px 0;">✅ Réservation Confirmée</h1>

    <p>Bonjour ${bookingDetails.name},</p>

    <p>Votre réservation a été confirmée avec succès !</p>

    <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 24px 0;">
      <h2 style="margin: 0 0 16px 0; font-size: 18px;">Détails de votre réservation</h2>
      <p style="margin: 8px 0;"><strong>Espace :</strong> ${bookingDetails.spaceName}</p>
      <p style="margin: 8px 0;"><strong>Date :</strong> ${bookingDetails.date}</p>
      <p style="margin: 8px 0;"><strong>Heure :</strong> ${bookingDetails.time}</p>
      <p style="margin: 8px 0;"><strong>Prix :</strong> ${bookingDetails.price.toFixed(2)}€</p>
      <p style="margin: 8px 0;"><strong>Référence :</strong> ${bookingDetails.bookingId}</p>
    </div>

    <p>Nous avons hâte de vous accueillir ! 😊</p>

    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">

    <p style="color: #6b7280; font-size: 14px; margin: 0;">
      <strong>CoworKing Café by Anticafé</strong><br>
      1 rue de la Division Leclerc, 67000 Strasbourg<br>
      Téléphone : 09 87 33 45 19<br>
      Email : strasbourg@coworkingcafe.fr
    </p>
  </div>
</body>
</html>
  `;

  const text = `
Bonjour ${bookingDetails.name},

Votre réservation a été confirmée avec succès !

Détails de votre réservation :
- Espace : ${bookingDetails.spaceName}
- Date : ${bookingDetails.date}
- Heure : ${bookingDetails.time}
- Prix : ${bookingDetails.price.toFixed(2)}€
- Référence : ${bookingDetails.bookingId}

Nous avons hâte de vous accueillir !

CoworKing Café by Anticafé
1 rue de la Division Leclerc, 67000 Strasbourg
Téléphone : 09 87 33 45 19
Email : strasbourg@coworkingcafe.fr
  `;

  return sendEmail(
    {
      to: email,
      subject,
      html,
      text,
    },
    'booking'
  );
}

/**
 * Send contact form email
 */
export async function sendContactFormEmail(
  email: string,
  details: {
    name: string;
    subject: string;
    message: string;
    replyTo?: string;
  }
): Promise<boolean> {
  const subject = `Nouveau message de contact: ${details.subject}`;

  const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 20px; font-family: Arial, sans-serif; background-color: #f3f4f6;">
  <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; padding: 32px;">
    <h2 style="color: #1f2937; margin: 0 0 24px 0;">Nouveau message de contact</h2>

    <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
      <p style="margin: 0 0 12px 0;"><strong>De:</strong> ${details.name}</p>
      ${details.replyTo ? `<p style="margin: 0 0 12px 0;"><strong>Email:</strong> ${details.replyTo}</p>` : ''}
      <p style="margin: 0;"><strong>Sujet:</strong> ${details.subject}</p>
    </div>

    <div style="background: white; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
      <p style="margin: 0; white-space: pre-wrap; color: #1f2937; line-height: 1.6;">${details.message}</p>
    </div>
  </div>
</body>
</html>
  `;

  const text = `
Nouveau message de contact

De: ${details.name}
${details.replyTo ? `Email: ${details.replyTo}` : ''}
Sujet: ${details.subject}

Message:
${details.message}
  `;

  return sendEmail(
    {
      to: email,
      subject,
      html,
      text,
      replyTo: details.replyTo,
    },
    'contact'
  );
}

/**
 * Send email from contact address (strasbourg@coworkingcafe.fr)
 * Uses separate SMTP credentials for contact replies
 *
 * Environment variables required:
 * CONTACT_SMTP_USER=strasbourg@coworkingcafe.fr
 * CONTACT_SMTP_PASSWORD=your-password
 */
export async function sendEmailAsContact(
  options: EmailOptions
): Promise<boolean> {
  try {
    const contactUser = process.env.CONTACT_SMTP_USER || process.env.REPLY_TO_SMTP_USER;
    const contactPassword = process.env.CONTACT_SMTP_PASSWORD || process.env.REPLY_TO_SMTP_PASSWORD;

    if (!contactUser || !contactPassword) {
      console.error('❌ Contact SMTP credentials not configured');
      console.error('Set CONTACT_SMTP_USER and CONTACT_SMTP_PASSWORD env variables');
      return false;
    }

    // Create transporter with contact email credentials
    const transporter = createSMTPTransporterWithCredentials(
      contactUser,
      contactPassword,
      process.env.SMTP_PROVIDER as SMTPProvider
    );

    const fromName = process.env.SMTP_FROM_NAME || 'CoworKing Café';
    const defaultFrom = `${fromName} - Contact <${contactUser}>`;

    await transporter.sendMail({
      from: options.from || defaultFrom,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
      replyTo: options.replyTo || contactUser, // Reply to contact email by default
      attachments: options.attachments,
    });

    console.log(`✅ Email sent from ${contactUser} to ${options.to}`);
    return true;
  } catch (error) {
    console.error('❌ Error sending email as contact:', error);
    return false;
  }
}
