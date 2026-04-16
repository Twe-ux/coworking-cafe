import {
  sendEmail as smtpSendEmail,
  generateClientPresentEmail,
  generateClientNoShowEmail,
  generateBookingModifiedEmail,
} from '@coworking-cafe/email';
import { accountActivationEmail } from './templates/accountActivation';
import { generatePurchaseOrderEmail } from './templates/purchaseOrder';
import { generateUnavailabilityApprovedEmail } from './templates/unavailabilityApproved';
import { generateUnavailabilityRejectedEmail } from './templates/unavailabilityRejected';

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
  console.log(`[Email] Préparation email présence pour: ${email}`);
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

  console.log(`[Email] Envoi email présence à: ${email}, sujet: ${subject}`);
  const result = await sendEmail({
    to: email,
    subject,
    html,
  });

  if (result.success) {
    console.log(`✅ [Email] Email présence envoyé avec succès à: ${email}`);
  } else {
    console.error(`❌ [Email] Échec envoi email présence à: ${email}`);
  }

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
  console.log(`[Email] Préparation email no-show pour: ${email}`);
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

  console.log(`[Email] Envoi email no-show à: ${email}, sujet: ${subject}`);
  const result = await sendEmail({
    to: email,
    subject,
    html,
  });

  if (result.success) {
    console.log(`✅ [Email] Email no-show envoyé avec succès à: ${email}`);
  } else {
    console.error(`❌ [Email] Échec envoi email no-show à: ${email}`);
  }

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

/**
 * Send purchase order email to supplier
 */
export async function sendPurchaseOrderEmail(
  email: string,
  orderData: {
    orderNumber: string;
    supplierName: string;
    items: Array<{
      productName: string;
      supplierReference?: string;
      packagingDescription?: string;
      quantity: number;
      packagingType: string;
      unitsPerPackage?: number;
      unitPriceHT: number;
      totalHT: number;
    }>;
    totalHT: number;
    totalTTC: number;
    notes?: string;
    createdAt: string;
    orderEmailConfig?: { showReference: boolean; quantityDisplay: 'type' | 'unit' };
  }
): Promise<boolean> {
  console.log(`[Email] Préparation email commande ${orderData.orderNumber} pour: ${email}`);
  console.log(`[Email] Fournisseur: ${orderData.supplierName}, Total TTC: ${orderData.totalTTC.toFixed(2)}€`);
  console.log(`[Email] Nombre de produits: ${orderData.items.length}`);

  const subject = `📦 Commande ${orderData.orderNumber} - CoworKing Café`;

  const html = generatePurchaseOrderEmail({
    orderNumber: orderData.orderNumber,
    supplierName: orderData.supplierName,
    items: orderData.items,
    totalHT: orderData.totalHT,
    totalTTC: orderData.totalTTC,
    notes: orderData.notes,
    createdAt: orderData.createdAt,
    orderEmailConfig: orderData.orderEmailConfig,
  });

  console.log(`[Email] Envoi email commande à: ${email}, sujet: ${subject}`);

  // Add BCC to admin email if configured
  const adminEmail = process.env.ADMIN_EMAIL;
  if (adminEmail) {
    console.log(`[Email] Copie BCC envoyée à: ${adminEmail}`);
  }

  const result = await sendEmail({
    to: email,
    subject,
    html,
    bcc: adminEmail, // Send copy to admin (invisible to supplier)
  });

  if (result.success) {
    console.log(`✅ [Email] Email commande ${orderData.orderNumber} envoyé avec succès à: ${email}`);
    if (adminEmail) {
      console.log(`✅ [Email] Copie BCC envoyée à: ${adminEmail}`);
    }
  } else {
    console.error(`❌ [Email] Échec envoi email commande ${orderData.orderNumber} à: ${email}`);
    console.error(`❌ [Email] Erreur: ${result.error || 'Erreur inconnue'}`);
  }

  return result.success;
}

/**
 * Send unavailability approved email to employee
 */
export async function sendUnavailabilityApprovedEmail(
  email: string,
  data: {
    employeeName: string;
    type: 'vacation' | 'sick' | 'personal' | 'other';
    startDate: string;
    endDate: string;
    reason?: string;
  }
): Promise<boolean> {
  console.log(`[Email] Préparation email approbation absence pour: ${email}`);
  const subject = '✅ Demande d\'absence approuvée - CoworKing Café';

  const html = generateUnavailabilityApprovedEmail({
    employeeName: data.employeeName,
    type: data.type,
    startDate: data.startDate,
    endDate: data.endDate,
    reason: data.reason,
    contactEmail: process.env.CONTACT_EMAIL || 'strasbourg@coworkingcafe.fr',
  });

  console.log(`[Email] Envoi email approbation absence à: ${email}`);
  const result = await sendEmail({
    to: email,
    subject,
    html,
  });

  if (result.success) {
    console.log(`✅ [Email] Email approbation absence envoyé avec succès à: ${email}`);
  } else {
    console.error(`❌ [Email] Échec envoi email approbation absence à: ${email}`);
  }

  return result.success;
}

/**
 * Send unavailability rejected email to employee
 */
export async function sendUnavailabilityRejectedEmail(
  email: string,
  data: {
    employeeName: string;
    type: 'vacation' | 'sick' | 'personal' | 'other';
    startDate: string;
    endDate: string;
    reason?: string;
    rejectionReason: string;
  }
): Promise<boolean> {
  console.log(`[Email] Préparation email refus absence pour: ${email}`);
  const subject = '❌ Demande d\'absence refusée - CoworKing Café';

  const html = generateUnavailabilityRejectedEmail({
    employeeName: data.employeeName,
    type: data.type,
    startDate: data.startDate,
    endDate: data.endDate,
    reason: data.reason,
    rejectionReason: data.rejectionReason,
    contactEmail: process.env.CONTACT_EMAIL || 'strasbourg@coworkingcafe.fr',
  });

  console.log(`[Email] Envoi email refus absence à: ${email}`);
  const result = await sendEmail({
    to: email,
    subject,
    html,
  });

  if (result.success) {
    console.log(`✅ [Email] Email refus absence envoyé avec succès à: ${email}`);
  } else {
    console.error(`❌ [Email] Échec envoi email refus absence à: ${email}`);
  }

  return result.success;
}
