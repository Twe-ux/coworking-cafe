import {
  sendEmail as smtpSendEmail,
  generateClientPresentEmail,
  generateClientNoShowEmail,
  generateBookingModifiedEmail,
} from '@coworking-cafe/email';
import { accountActivationEmail } from './templates/accountActivation';

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  text?: string;
  bcc?: string | string[];
  attachments?: Array<{
    filename: string;
    content?: string | Buffer;
    path?: string;
  }>;
}

export async function sendEmail({ to, subject, html, text, bcc, attachments }: SendEmailParams) {
  try {
    await smtpSendEmail({
      to,
      subject,
      html,
      text: text || '',
      bcc,
      attachments,
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error('❌ Erreur envoi email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
    };
  }
}

/**
 * Send client present confirmation email
 */
export async function sendClientPresentEmail(
  email: string,
  bookingDetails: {
    name: string;
    spaceName: string;
    date: string;
    startTime: string;
    endTime: string;
    numberOfPeople: number;
    totalPrice: number;
  }
): Promise<boolean> {
  const subject = '✅ Merci pour votre venue - CoworKing Café by Anticafé';

  const html = generateClientPresentEmail({
    name: bookingDetails.name,
    spaceName: bookingDetails.spaceName,
    date: bookingDetails.date,
    startTime: bookingDetails.startTime,
    endTime: bookingDetails.endTime,
    numberOfPeople: bookingDetails.numberOfPeople,
    totalPrice: bookingDetails.totalPrice,
  });

  const result = await sendEmail({
    to: email,
    subject,
    html,
  });

  return result.success;
}

/**
 * Send client no-show email
 */
export async function sendClientNoShowEmail(
  email: string,
  bookingDetails: {
    name: string;
    spaceName: string;
    date: string;
    startTime: string;
    endTime: string;
    numberOfPeople: number;
    depositAmount: number; // Montant empreinte en centimes
  }
): Promise<boolean> {
  const subject = '❌ Absence constatée - CoworKing Café by Anticafé';

  const html = generateClientNoShowEmail({
    name: bookingDetails.name,
    spaceName: bookingDetails.spaceName,
    date: bookingDetails.date,
    startTime: bookingDetails.startTime,
    endTime: bookingDetails.endTime,
    numberOfPeople: bookingDetails.numberOfPeople,
    depositAmount: bookingDetails.depositAmount,
    contactEmail: process.env.CONTACT_EMAIL || 'strasbourg@coworkingcafe.fr',
  });

  const result = await sendEmail({
    to: email,
    subject,
    html,
  });

  return result.success;
}

/**
 * Send booking modified email
 */
export async function sendBookingModifiedEmail(
  email: string,
  bookingDetails: {
    name: string;
    spaceName: string;
    date: string;
    startTime: string;
    endTime: string;
    numberOfPeople: number;
    totalPrice: number;
    confirmationNumber?: string;
  }
): Promise<boolean> {
  const subject = '🔄 Réservation modifiée - CoworKing Café by Anticafé';

  const html = generateBookingModifiedEmail({
    name: bookingDetails.name,
    spaceName: bookingDetails.spaceName,
    date: bookingDetails.date,
    startTime: bookingDetails.startTime,
    endTime: bookingDetails.endTime,
    numberOfPeople: bookingDetails.numberOfPeople,
    totalPrice: bookingDetails.totalPrice,
    confirmationNumber: bookingDetails.confirmationNumber,
  });

  const result = await sendEmail({
    to: email,
    subject,
    html,
  });

  return result.success;
}

/**
 * Send account activation email
 */
export async function sendAccountActivationEmail(
  email: string,
  data: {
    userName: string;
    activationToken: string;
  }
): Promise<boolean> {
  const subject = '🎉 Activez votre compte - CoworKing Café';

  const activationUrl = `${process.env.SITE_URL || 'http://localhost:3000'}/auth/activate-account?token=${data.activationToken}`;

  const html = accountActivationEmail({
    userName: data.userName,
    activationUrl,
  });

  const result = await sendEmail({
    to: email,
    subject,
    html,
  });

  return result.success;
}
