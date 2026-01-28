import { Resend } from 'resend';
import {
  generateClientPresentEmail,
  generateClientNoShowEmail,
  generateBookingModifiedEmail,
  generatePendingWithDepositEmail,
} from '@coworking-cafe/email';

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailParams) {
  try {
    const response = await resend.emails.send({
      from: 'CoworKing Café <noreply@coworkingcafe.fr>',
      to,
      subject,
      html,
    });

    return {
      success: true,
      data: response,
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
    totalPrice: number;
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
 * Send pending with deposit email
 */
export async function sendPendingWithDepositEmail(
  email: string,
  bookingDetails: {
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
): Promise<boolean> {
  const subject = '⏳ Réservation en attente - Acompte requis - CoworKing Café';

  const html = generatePendingWithDepositEmail({
    name: bookingDetails.name,
    spaceName: bookingDetails.spaceName,
    date: bookingDetails.date,
    startTime: bookingDetails.startTime,
    endTime: bookingDetails.endTime,
    numberOfPeople: bookingDetails.numberOfPeople,
    totalPrice: bookingDetails.totalPrice,
    depositAmount: bookingDetails.depositAmount,
    depositFileUrl: bookingDetails.depositFileUrl,
  });

  const result = await sendEmail({
    to: email,
    subject,
    html,
  });

  return result.success;
}
